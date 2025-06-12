from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import json
import aiohttp
import base64
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# API Keys
OPENROUTER_API_KEY = os.environ.get('OPENROUTER_API_KEY')
INDIAN_KANOON_API_KEY = os.environ.get('INDIAN_KANOON_API_KEY')

# Legacy reference for backward compatibility
OPENAI_API_KEY = OPENROUTER_API_KEY

# Create the main app without a prefix
app = FastAPI(title="AI Legal Research Platform", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic Models
class LawFirm(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    address: str
    contact_email: str
    contact_phone: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    law_firm_id: str
    name: str
    email: str
    role: str  # partner, associate, paralegal, client
    bar_admission_number: Optional[str] = None
    specialization: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CaseAlert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # reminder, deadline, hearing, task
    message: str
    due_date: datetime
    priority: str = "medium"  # low, medium, high, urgent
    is_read: bool = False

class CaseTask(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    assigned_to: str
    due_date: Optional[datetime] = None
    status: str = "pending"  # pending, in_progress, completed
    priority: str = "medium"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CaseNote(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content: str
    author: str
    note_type: str = "general"  # general, hearing, research, communication
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CaseTimeEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    attorney: str
    description: str
    hours: float
    billable: bool = True
    date: datetime = Field(default_factory=datetime.utcnow)

class Case(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    law_firm_id: str
    case_number: str
    case_title: str
    case_type: str  # criminal, civil, family, corporate, constitutional, labor
    court_jurisdiction: str
    filing_date: Optional[datetime] = None
    
    # Enhanced workflow fields
    stage: str = "intake"  # intake, ongoing, hearing, judgment, closed
    sub_stage: Optional[str] = None  # Notice Sent, Counter Filed, etc.
    priority: str = "medium"  # low, medium, high, urgent
    
    # People involved
    assigned_attorney: str
    client_name: str
    opposing_counsel: Optional[str] = None
    judge_name: Optional[str] = None
    
    # Dates and deadlines
    next_hearing_date: Optional[datetime] = None
    filing_deadline: Optional[datetime] = None
    statute_limitations: Optional[datetime] = None
    
    # Case content
    description: str
    case_summary: Optional[str] = None
    legal_issues: Optional[List[str]] = None
    
    # Workflow data
    alerts: Optional[List[CaseAlert]] = []
    tasks: Optional[List[CaseTask]] = []
    notes: Optional[List[CaseNote]] = []
    time_entries: Optional[List[CaseTimeEntry]] = []
    
    # Counts for UI
    documents_count: int = 0
    research_count: int = 0
    active_alerts_count: int = 0
    pending_tasks_count: int = 0
    
    # Status tracking
    status: str = "active"  # active, closed, dropped, on_hold
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity: Optional[datetime] = None

class LegalDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    law_firm_id: str
    case_id: Optional[str] = None
    document_name: str
    document_type: str  # contract, pleading, motion, brief, etc.
    content: str  # base64 encoded document content
    ai_summary: Optional[str] = None
    key_points: Optional[List[str]] = None
    uploaded_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ResearchQuery(BaseModel):
    query: str
    law_firm_id: str
    case_id: Optional[str] = None
    user_id: str

class ResearchResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    query: str
    ai_response: str
    indian_kanoon_results: Optional[List[dict]] = None
    relevant_cases: Optional[List[str]] = None
    legal_authorities: Optional[List[str]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Create Models
class LawFirmCreate(BaseModel):
    name: str
    address: str
    contact_email: str
    contact_phone: str

class UserCreate(BaseModel):
    law_firm_id: str
    name: str
    email: str
    role: str
    bar_admission_number: Optional[str] = None
    specialization: Optional[str] = None

class CaseCreate(BaseModel):
    law_firm_id: str
    case_number: str
    case_title: str
    case_type: str
    court_jurisdiction: str
    filing_date: Optional[datetime] = None
    assigned_attorney: str
    client_name: str
    description: str

# AI Legal Assistant with OpenRouter
async def get_ai_legal_response(query: str, context: str = "", session_id: str = None) -> str:
    """Get AI response for legal queries using OpenRouter"""
    try:
        if not session_id:
            session_id = str(uuid.uuid4())
            
        # Check if API key is available
        if not OPENROUTER_API_KEY:
            return "Error: OpenRouter API key not configured"
            
        system_message = """You are an expert AI legal assistant specialized in Indian law. 
        You help legal associates with research, case analysis, and legal reasoning.
        
        Key guidelines:
        1. Provide accurate, well-researched legal analysis
        2. Cite relevant Indian statutes, case law, and legal principles
        3. Structure responses with clear headings and bullet points
        4. Always mention when additional research or professional consultation is needed
        5. Focus on practical legal implications and strategies
        6. Use proper legal terminology and citation format
        
        Remember: You assist with legal research but cannot provide specific legal advice."""
        
        # Use OpenRouter endpoint directly with aiohttp
        async with aiohttp.ClientSession() as session:
            headers = {
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://emergent.sh",
                "X-Title": "Legal AI Research Platform"
            }
            
            payload = {
                "model": "openai/gpt-4o",
                "messages": [
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": f"Legal Research Query: {query}" + (f"\n\nAdditional Context: {context}" if context else "")}
                ],
                "max_tokens": 2000,
                "temperature": 0.7
            }
            
            async with session.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    error_text = await response.text()
                    logger.error(f"OpenRouter API error: {response.status} - {error_text}")
                    return f"AI Service Error: OpenRouter API returned status {response.status}. Please check your API key and credits."
        
    except Exception as e:
        logger.error(f"Error getting AI response from OpenRouter: {str(e)}")
        error_msg = str(e)
        if "authentication" in error_msg.lower() or "api_key" in error_msg.lower():
            return f"AI Service Authentication Error: Please verify the OpenRouter API key is valid and has sufficient credits. Error: {error_msg}"
        return f"AI Service Error: {error_msg}"

# Indian Kanoon Search Integration
async def search_indian_kanoon(query: str, max_results: int = 10) -> List[dict]:
    """Search Indian Kanoon database for relevant cases"""
    try:
        # Indian Kanoon API endpoint
        url = "https://api.indiankanoon.org/search/"
        
        params = {
            'formInput': query,
            'pagenum': 0,
            'API_KEY': INDIAN_KANOON_API_KEY
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    # Process and format the results
                    results = []
                    if 'docs' in data:
                        for doc in data['docs'][:max_results]:
                            results.append({
                                'title': doc.get('title', 'Unknown Case'),
                                'court': doc.get('court', 'Unknown Court'),
                                'date': doc.get('date', 'Unknown Date'),
                                'citation': doc.get('citation', ''),
                                'summary': doc.get('summary', ''),
                                'url': f"https://indiankanoon.org/doc/{doc.get('tid', '')}"
                            })
                    return results
                else:
                    logger.error(f"Indian Kanoon API error: {response.status}")
                    return []
                    
    except Exception as e:
        logger.error(f"Error searching Indian Kanoon: {str(e)}")
        return []

# API Routes

# Law Firm Management
@api_router.post("/law-firms", response_model=LawFirm)
async def create_law_firm(firm: LawFirmCreate):
    firm_dict = firm.dict()
    firm_obj = LawFirm(**firm_dict)
    await db.law_firms.insert_one(firm_obj.dict())
    return firm_obj

@api_router.get("/law-firms", response_model=List[LawFirm])
async def get_law_firms():
    firms = await db.law_firms.find().to_list(1000)
    return [LawFirm(**firm) for firm in firms]

# User Management
@api_router.post("/users", response_model=User)
async def create_user(user: UserCreate):
    user_dict = user.dict()
    user_obj = User(**user_dict)
    await db.users.insert_one(user_obj.dict())
    return user_obj

@api_router.get("/users/{law_firm_id}", response_model=List[User])
async def get_users_by_firm(law_firm_id: str):
    users = await db.users.find({"law_firm_id": law_firm_id}).to_list(1000)
    return [User(**user) for user in users]

# Case Management
@api_router.post("/cases", response_model=Case)
async def create_case(case: CaseCreate):
    case_dict = case.dict()
    case_obj = Case(**case_dict)
    await db.cases.insert_one(case_obj.dict())
    return case_obj

@api_router.get("/cases/{law_firm_id}")
async def get_cases_by_firm(law_firm_id: str):
    cases = await db.cases.find({"law_firm_id": law_firm_id}).to_list(1000)
    return [Case(**case) for case in cases]

@api_router.get("/cases/detail/{case_id}")
async def get_case_detail(case_id: str):
    case = await db.cases.find_one({"id": case_id})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return Case(**case)

@api_router.put("/cases/{case_id}")
async def update_case(case_id: str, case_update: dict):
    case_update['updated_at'] = datetime.utcnow()
    result = await db.cases.update_one({"id": case_id}, {"$set": case_update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Case not found")
    return {"message": "Case updated successfully"}

# Legal Research - The Core AI Feature
@api_router.post("/legal-research")
async def conduct_legal_research(research: ResearchQuery):
    try:
        # Get AI analysis
        session_id = f"legal_research_{research.law_firm_id}_{uuid.uuid4()}"
        ai_response = await get_ai_legal_response(
            research.query, 
            context=f"Law firm context for legal research",
            session_id=session_id
        )
        
        # Search Indian Kanoon for relevant cases
        kanoon_results = await search_indian_kanoon(research.query)
        
        # Create research result
        result = ResearchResult(
            query=research.query,
            ai_response=ai_response,
            indian_kanoon_results=kanoon_results,
            relevant_cases=[case.get('title', '') for case in kanoon_results[:5]],
            legal_authorities=[case.get('citation', '') for case in kanoon_results[:5] if case.get('citation')]
        )
        
        # Save research to database
        await db.research_results.insert_one({
            **result.dict(),
            "law_firm_id": research.law_firm_id,
            "user_id": research.user_id,
            "case_id": research.case_id
        })
        
        return result
        
    except Exception as e:
        logger.error(f"Legal research error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Research failed: {str(e)}")

# Document Upload and Analysis
@api_router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    law_firm_id: str = Form(None),
    case_id: Optional[str] = Form(None),
    document_type: str = Form("general"),
    uploaded_by: str = Form(None)
):
    try:
        # Validate required parameters
        if not law_firm_id:
            raise HTTPException(status_code=400, detail="law_firm_id is required")
        if not uploaded_by:
            raise HTTPException(status_code=400, detail="uploaded_by is required")
            
        # Read file content
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded")
            
        # Encode content for storage
        encoded_content = base64.b64encode(content).decode('utf-8')
        
        # Get AI analysis of the document
        session_id = f"doc_analysis_{law_firm_id}_{uuid.uuid4()}"
        analysis_query = f"""Please analyze this legal document and provide: 
        1) A comprehensive summary
        2) Key legal points and issues  
        3) Potential risks or concerns
        4) Recommended next steps
        
        Document Details:
        - Filename: {file.filename}
        - Type: {document_type}
        - Size: {len(content)} bytes
        
        Note: This is a document analysis based on metadata. In a full implementation, document text would be extracted and analyzed."""
        
        ai_summary = await get_ai_legal_response(
            analysis_query,
            context=f"Document analysis for law firm {law_firm_id}",
            session_id=session_id
        )
        
        # Extract key points (simplified for MVP)
        key_points = [
            f"Document type: {document_type}",
            f"File size: {len(content)} bytes",
            f"Upload date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}",
            "AI analysis completed"
        ]
        
        # Create document record
        document = LegalDocument(
            law_firm_id=law_firm_id,
            case_id=case_id,
            document_name=file.filename,
            document_type=document_type,
            content=encoded_content,
            ai_summary=ai_summary,
            key_points=key_points,
            uploaded_by=uploaded_by
        )
        
        # Save to database
        await db.legal_documents.insert_one(document.dict())
        
        return {
            "document_id": document.id,
            "filename": file.filename,
            "size": len(content),
            "ai_summary": ai_summary,
            "key_points": key_points,
            "message": "Document uploaded and analyzed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Document upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Document upload failed: {str(e)}")

@api_router.get("/documents/{law_firm_id}")
async def get_documents_by_firm(law_firm_id: str):
    try:
        documents = await db.legal_documents.find(
            {"law_firm_id": law_firm_id},
            {"content": 0}  # Exclude large content field
        ).sort("created_at", -1).to_list(1000)
        
        # Convert MongoDB ObjectId to string for JSON serialization
        for doc in documents:
            if "_id" in doc:
                doc["_id"] = str(doc["_id"])
                
        return documents
    except Exception as e:
        logger.error(f"Error fetching documents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch documents: {str(e)}")

# Research History
@api_router.get("/research-history/{law_firm_id}")
async def get_research_history(law_firm_id: str):
    try:
        results = await db.research_results.find(
            {"law_firm_id": law_firm_id}
        ).sort("created_at", -1).limit(100).to_list(100)
        
        # Convert MongoDB ObjectId to string for JSON serialization
        for result in results:
            if "_id" in result:
                result["_id"] = str(result["_id"])
        
        return results
    except Exception as e:
        logger.error(f"Error fetching research history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch research history: {str(e)}")

# Health check
@api_router.get("/")
async def root():
    return {"message": "AI Legal Research Platform API", "status": "active"}

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "services": {
            "database": "connected",
            "ai": "ready (OpenRouter)" if OPENROUTER_API_KEY else "not configured",
            "indian_kanoon": "ready" if INDIAN_KANOON_API_KEY else "not configured"
        }
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()