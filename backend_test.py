#!/usr/bin/env python3
import requests
import json
import base64
import os
import time
from datetime import datetime
import unittest

# Backend URL from frontend/.env
BACKEND_URL = "https://02dfcea4-13b1-4e87-997f-80df55adf637.preview.emergentagent.com"
API_BASE_URL = f"{BACKEND_URL}/api"

# Test data
TEST_LAW_FIRM_ID = "test-firm-123"
TEST_USER_ID = "test-user-456"

class LegalPlatformAPITest(unittest.TestCase):
    """Test suite for the AI-powered Legal Research Platform API"""
    
    def setUp(self):
        """Setup for tests"""
        self.session = requests.Session()
        self.case_id = None
        
        # Create test law firm if it doesn't exist
        self.law_firm = {
            "name": "Test Law Associates",
            "address": "123 Legal Street, Mumbai, India",
            "contact_email": "test@testlawfirm.com",
            "contact_phone": "+91 9876543210"
        }
        
        # Create test user if it doesn't exist
        self.user = {
            "law_firm_id": TEST_LAW_FIRM_ID,
            "name": "Test Advocate",
            "email": "advocate@testlawfirm.com",
            "role": "associate",
            "bar_admission_number": "MAH/12345/2020",
            "specialization": "Contract Law"
        }
        
        # Test case data
        self.case = {
            "law_firm_id": TEST_LAW_FIRM_ID,
            "case_number": "CASE-2023-001",
            "case_title": "ABC Corp vs XYZ Ltd",
            "case_type": "civil",
            "court_jurisdiction": "Delhi High Court",
            "filing_date": datetime.now().isoformat(),
            "assigned_attorney": TEST_USER_ID,
            "client_name": "ABC Corporation",
            "description": "Breach of contract dispute regarding software development agreement"
        }
        
        # Test legal research query - Using a more complex Indian law query
        self.research_query = {
            "query": "Analyze the legal framework for cryptocurrency regulation in India, including RBI circulars, Supreme Court decisions, and recent legislative developments. What are the compliance requirements for crypto exchanges operating in India?",
            "law_firm_id": TEST_LAW_FIRM_ID,
            "user_id": TEST_USER_ID,
            "case_id": None  # Optional case ID
        }
        
        print(f"\n{'='*80}\nComprehensive Testing of Legal Platform API at {API_BASE_URL}\n{'='*80}")
        print(f"Testing after critical fixes: OpenRouter integration, form data validation, and MongoDB serialization")
    
    def test_01_health_check(self):
        """Test the health check endpoint to confirm OpenRouter is ready"""
        print("\n1. Testing Health Check API (Confirming OpenRouter Integration)...")
        
        response = self.session.get(f"{API_BASE_URL}/health")
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "healthy")
        self.assertTrue("database" in response.json()["services"])
        
        # Specifically check if OpenRouter is configured
        self.assertTrue("ai" in response.json()["services"])
        ai_status = response.json()["services"]["ai"]
        print(f"AI Service Status: {ai_status}")
        self.assertTrue("ready (OpenRouter)" in ai_status, "OpenRouter not properly configured")
        
        # Check Indian Kanoon API
        self.assertTrue("indian_kanoon" in response.json()["services"])
        kanoon_status = response.json()["services"]["indian_kanoon"]
        print(f"Indian Kanoon API Status: {kanoon_status}")
        
        print("✅ Health Check API test passed - OpenRouter integration confirmed")
    
    def test_02_create_law_firm(self):
        """Test creating a law firm"""
        print("\n2. Testing Law Firm Creation API...")
        
        response = self.session.post(
            f"{API_BASE_URL}/law-firms",
            json=self.law_firm
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue("id" in response.json())
        
        # Save the law firm ID for later tests
        self.law_firm_id = response.json()["id"]
        print(f"Created Law Firm with ID: {self.law_firm_id}")
        
        print("✅ Law Firm Creation API test passed")
    
    def test_03_create_user(self):
        """Test creating a user"""
        print("\n3. Testing User Creation API...")
        
        response = self.session.post(
            f"{API_BASE_URL}/users",
            json=self.user
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue("id" in response.json())
        
        # Save the user ID for later tests
        self.user_id = response.json()["id"]
        print(f"Created User with ID: {self.user_id}")
        
        print("✅ User Creation API test passed")
    
    def test_04_case_management(self):
        """Test case management CRUD operations"""
        print("\n4. Testing Case Management APIs...")
        
        # 4.1 Create a case
        print("\n4.1 Creating a new case...")
        response = self.session.post(
            f"{API_BASE_URL}/cases",
            json=self.case
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue("id" in response.json())
        
        # Save the case ID for later tests
        self.case_id = response.json()["id"]
        print(f"Created Case with ID: {self.case_id}")
        
        # 4.2 Get cases by law firm
        print("\n4.2 Getting cases for law firm...")
        response = self.session.get(
            f"{API_BASE_URL}/cases/{TEST_LAW_FIRM_ID}"
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(isinstance(response.json(), list))
        
        # 4.3 Get case details
        print("\n4.3 Getting case details...")
        response = self.session.get(
            f"{API_BASE_URL}/cases/detail/{self.case_id}"
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["id"], self.case_id)
        
        # 4.4 Update case
        print("\n4.4 Updating case...")
        update_data = {
            "status": "pending",
            "description": "Updated description for breach of contract case"
        }
        
        response = self.session.put(
            f"{API_BASE_URL}/cases/{self.case_id}",
            json=update_data
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["message"], "Case updated successfully")
        
        # 4.5 Verify update
        print("\n4.5 Verifying case update...")
        response = self.session.get(
            f"{API_BASE_URL}/cases/detail/{self.case_id}"
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "pending")
        self.assertEqual(response.json()["description"], "Updated description for breach of contract case")
        
        print("✅ Case Management APIs tests passed")
    
    def test_05_ai_legal_research(self):
        """Test the AI Legal Research API with OpenRouter integration"""
        print("\n5. Testing AI Legal Research API with OpenRouter Integration...")
        print("Using complex query about cryptocurrency regulation in India")
        
        try:
            response = self.session.post(
                f"{API_BASE_URL}/legal-research",
                json=self.research_query
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                
                # Print a preview of the response
                print(f"AI Response Preview: {result['ai_response'][:200]}...")
                print(f"Number of Indian Kanoon results: {len(result['indian_kanoon_results'])}")
                
                # Verify response structure
                self.assertTrue("ai_response" in result)
                self.assertTrue("indian_kanoon_results" in result)
                self.assertTrue("query" in result)
                
                # Verify AI response quality
                ai_response = result["ai_response"]
                self.assertTrue(len(ai_response) > 200, "AI response too short")
                
                # Check for authentication errors
                self.assertFalse("authentication error" in ai_response.lower(), 
                                "Authentication error in AI response")
                self.assertFalse("api key" in ai_response.lower() and "error" in ai_response.lower(), 
                                "API key error in response")
                
                # Check for content quality indicators
                quality_indicators = [
                    "Supreme Court", "RBI", "cryptocurrency", "regulation", 
                    "circular", "exchange", "compliance"
                ]
                
                found_indicators = [indicator for indicator in quality_indicators 
                                   if indicator.lower() in ai_response.lower()]
                
                print(f"Content quality indicators found: {found_indicators}")
                self.assertTrue(len(found_indicators) >= 3, 
                               "AI response lacks sufficient domain-specific content")
                
                # Check if research was saved to database by getting history
                time.sleep(1)  # Brief pause to ensure database write completes
                history_response = self.session.get(
                    f"{API_BASE_URL}/research-history/{TEST_LAW_FIRM_ID}"
                )
                
                self.assertEqual(history_response.status_code, 200)
                history = history_response.json()
                self.assertTrue(isinstance(history, list))
                
                # Look for our query in the history
                found_query = False
                for item in history:
                    if "query" in item and self.research_query["query"][:50] in item["query"]:
                        found_query = True
                        break
                
                self.assertTrue(found_query, "Research query not found in history")
                
                print("✅ AI Legal Research API test passed with OpenRouter integration")
            else:
                print(f"Response: {response.text}")
                self.fail(f"AI Legal Research API failed with status {response.status_code}")
        except Exception as e:
            print(f"Error during AI legal research test: {str(e)}")
            self.fail(f"AI Legal Research API test failed with exception: {str(e)}")
    
    def test_06_document_upload(self):
        """Test document upload with form data validation fix"""
        print("\n6. Testing Document Upload API with Form Data Validation Fix...")
        
        try:
            # Create a more complex legal document for testing
            test_file_path = "test_legal_document.txt"
            with open(test_file_path, "w") as f:
                f.write("LEGAL MEMORANDUM\n\n")
                f.write("TO: Senior Partner\n")
                f.write("FROM: Junior Associate\n")
                f.write("DATE: June 15, 2023\n")
                f.write("RE: Cryptocurrency Regulation in India\n\n")
                f.write("ISSUE: What are the current legal requirements for operating a cryptocurrency exchange in India?\n\n")
                f.write("BRIEF ANSWER: Following the Supreme Court's decision in Internet and Mobile Association of India v. Reserve Bank of India (2020), cryptocurrency trading is legal, but exchanges must comply with FEMA regulations, anti-money laundering laws, and potential forthcoming legislation.\n\n")
                f.write("ANALYSIS: The legal landscape for cryptocurrency in India has evolved significantly...\n")
            
            # Upload the document with form data
            with open(test_file_path, "rb") as f:
                # Using multipart/form-data with explicit content-type
                files = {
                    "file": ("legal_memo_crypto.txt", f, "text/plain")
                }
                
                data = {
                    "law_firm_id": TEST_LAW_FIRM_ID,
                    "case_id": self.case_id if hasattr(self, 'case_id') and self.case_id else "",
                    "document_type": "legal_memorandum",
                    "uploaded_by": TEST_USER_ID
                }
                
                print(f"Sending form data: {data}")
                
                response = self.session.post(
                    f"{API_BASE_URL}/documents/upload",
                    files=files,
                    data=data
                )
            
            # Clean up the test file
            os.remove(test_file_path)
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"Document ID: {result['document_id']}")
                print(f"AI Summary Preview: {result['ai_summary'][:200]}...")
                
                # Verify response structure
                self.assertTrue("document_id" in result)
                self.assertTrue("ai_summary" in result)
                self.assertTrue("key_points" in result)
                
                # Verify AI summary
                ai_summary = result["ai_summary"]
                self.assertTrue(len(ai_summary) > 100, "AI summary too short")
                
                # Get documents for the law firm to verify storage and serialization
                print("\nVerifying document was stored correctly...")
                docs_response = self.session.get(
                    f"{API_BASE_URL}/documents/{TEST_LAW_FIRM_ID}"
                )
                
                print(f"Documents API Status Code: {docs_response.status_code}")
                
                self.assertEqual(docs_response.status_code, 200)
                documents = docs_response.json()
                self.assertTrue(isinstance(documents, list))
                
                # Check if our document is in the list
                found_doc = False
                for doc in documents:
                    if doc.get("document_name") == "legal_memo_crypto.txt":
                        found_doc = True
                        # Verify MongoDB ObjectId serialization is working
                        self.assertTrue("_id" in doc)
                        self.assertTrue(isinstance(doc["_id"], str))
                        break
                
                self.assertTrue(found_doc, "Uploaded document not found in documents list")
                
                print("✅ Document Upload API test passed with form data validation fix")
            else:
                print(f"Response: {response.text}")
                self.fail(f"Document Upload API failed with status {response.status_code}")
        except Exception as e:
            print(f"Error during document upload test: {str(e)}")
            self.fail(f"Document Upload API test failed with exception: {str(e)}")
    
    def test_07_research_history(self):
        """Test research history API with ObjectId serialization fix"""
        print("\n7. Testing Research History API with ObjectId Serialization Fix...")
        
        try:
            # First, ensure we have some research history by making a research query
            research_query = {
                "query": "What are the legal implications of the Personal Data Protection Bill for law firms in India?",
                "law_firm_id": TEST_LAW_FIRM_ID,
                "user_id": TEST_USER_ID
            }
            
            # Make a research query to ensure we have history
            print("Creating a new research query to test history...")
            research_response = self.session.post(
                f"{API_BASE_URL}/legal-research",
                json=research_query
            )
            
            self.assertEqual(research_response.status_code, 200)
            
            # Now get the research history
            print("Getting research history...")
            response = self.session.get(
                f"{API_BASE_URL}/research-history/{TEST_LAW_FIRM_ID}"
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                history = response.json()
                print(f"Number of research history items: {len(history)}")
                
                if len(history) > 0:
                    # Print a sample history item
                    print(f"Sample history item: {json.dumps({k: v[:100] + '...' if isinstance(v, str) and len(v) > 100 else v for k, v in history[0].items() if k != 'ai_response'}, indent=2)}")
                
                # Verify response structure
                self.assertTrue(isinstance(history, list))
                
                # Check for MongoDB ObjectId serialization
                for item in history:
                    self.assertTrue("_id" in item)
                    self.assertTrue(isinstance(item["_id"], str))
                    
                    # Check other required fields
                    self.assertTrue("query" in item)
                    self.assertTrue("ai_response" in item)
                    self.assertTrue("law_firm_id" in item)
                
                print("✅ Research History API test passed with ObjectId serialization fix")
            else:
                print(f"Response: {response.text}")
                self.fail(f"Research History API failed with status {response.status_code}")
        except Exception as e:
            print(f"Error during research history test: {str(e)}")
            self.fail(f"Research History API test failed with exception: {str(e)}")

if __name__ == "__main__":
    # Run the tests in order
    test_suite = unittest.TestSuite()
    test_suite.addTest(LegalPlatformAPITest("test_01_health_check"))
    test_suite.addTest(LegalPlatformAPITest("test_02_create_law_firm"))
    test_suite.addTest(LegalPlatformAPITest("test_03_create_user"))
    test_suite.addTest(LegalPlatformAPITest("test_04_case_management"))
    test_suite.addTest(LegalPlatformAPITest("test_05_ai_legal_research"))
    test_suite.addTest(LegalPlatformAPITest("test_06_document_upload"))
    test_suite.addTest(LegalPlatformAPITest("test_07_research_history"))
    
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(test_suite)