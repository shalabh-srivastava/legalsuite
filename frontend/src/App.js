import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Main App Component
function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [lawFirmId, setLawFirmId] = useState('demo-firm-1');
  const [userId, setUserId] = useState('demo-user-1');
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">⚖️ LegalAI Research</h1>
              </div>
            </div>
            <nav className="flex space-x-8">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'dashboard' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentPage('research')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'research' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                AI Research
              </button>
              <button
                onClick={() => setCurrentPage('cases')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'cases' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Cases
              </button>
              <button
                onClick={() => setCurrentPage('documents')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'documents' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Documents
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {currentPage === 'dashboard' && <Dashboard lawFirmId={lawFirmId} />}
        {currentPage === 'research' && <AIResearch lawFirmId={lawFirmId} userId={userId} />}
        {currentPage === 'cases' && <CaseManagement lawFirmId={lawFirmId} />}
        {currentPage === 'documents' && <DocumentManagement lawFirmId={lawFirmId} userId={userId} />}
      </main>
    </div>
  );
}

// Dashboard Component
const Dashboard = ({ lawFirmId }) => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data for now - in real implementation would fetch from API
      setStats({
        totalCases: 24,
        activeResearch: 8,
        documentsProcessed: 156,
        aiQueries: 342
      });
      
      setRecentActivity([
        { type: 'research', title: 'Contract Law Research - Breach of Agreement', time: '2 hours ago' },
        { type: 'case', title: 'New Case Added: Smith vs. Jones', time: '4 hours ago' },
        { type: 'document', title: 'Document Analyzed: Employment Contract', time: '6 hours ago' }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Legal Associate Dashboard</h2>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">📁</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Cases</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.totalCases || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">🔍</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Research</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.activeResearch || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">📄</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Documents</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.documentsProcessed || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">🤖</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">AI Queries</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.aiQueries || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.map((activity, index) => (
                  <li key={index}>
                    <div className="relative pb-8">
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                            {activity.type === 'research' && '🔍'}
                            {activity.type === 'case' && '📁'}
                            {activity.type === 'document' && '📄'}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">{activity.title}</p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// AI Research Component - The Core Feature
const AIResearch = ({ lawFirmId, userId }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [researchHistory, setResearchHistory] = useState([]);

  useEffect(() => {
    fetchResearchHistory();
  }, []);

  const fetchResearchHistory = async () => {
    try {
      const response = await axios.get(`${API}/research-history/${lawFirmId}`);
      setResearchHistory(response.data.slice(0, 5)); // Show last 5 queries
    } catch (error) {
      console.error('Error fetching research history:', error);
    }
  };

  const handleResearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/legal-research`, {
        query: query,
        law_firm_id: lawFirmId,
        user_id: userId,
        case_id: null
      });
      
      setResult(response.data);
      fetchResearchHistory(); // Refresh history
    } catch (error) {
      console.error('Research error:', error);
      setResult({
        ai_response: `Error: ${error.response?.data?.detail || 'Research failed'}`,
        indian_kanoon_results: [],
        relevant_cases: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">🤖 AI Legal Research Assistant</h2>
        
        {/* Research Input */}
        <form onSubmit={handleResearch} className="mb-8">
          <div className="mb-4">
            <label htmlFor="research-query" className="block text-sm font-medium text-gray-700 mb-2">
              Legal Research Query
            </label>
            <textarea
              id="research-query"
              rows={4}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Enter your legal research question... (e.g., 'What are the key elements required to prove breach of contract under Indian Contract Act 1872?')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Researching...
              </>
            ) : (
              '🔍 Conduct AI Research'
            )}
          </button>
        </form>

        {/* Research Results */}
        {result && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Research Results</h3>
            
            {/* AI Analysis */}
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3">🤖 AI Legal Analysis</h4>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700">{result.ai_response}</div>
                </div>
              </div>
            </div>

            {/* Indian Kanoon Results */}
            {result.indian_kanoon_results && result.indian_kanoon_results.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">📚 Relevant Indian Case Law</h4>
                  <div className="space-y-4">
                    {result.indian_kanoon_results.map((case_item, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <h5 className="font-medium text-gray-900">{case_item.title}</h5>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Court:</span> {case_item.court} | 
                          <span className="font-medium"> Date:</span> {case_item.date}
                        </p>
                        {case_item.citation && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Citation:</span> {case_item.citation}
                          </p>
                        )}
                        {case_item.summary && (
                          <p className="text-sm text-gray-700 mt-2">{case_item.summary}</p>
                        )}
                        {case_item.url && (
                          <a 
                            href={case_item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-500 text-sm mt-2 inline-block"
                          >
                            View Full Case →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Research History */}
        {researchHistory.length > 0 && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">📝 Recent Research History</h3>
              <div className="space-y-3">
                {researchHistory.map((item, index) => (
                  <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.query}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        setQuery(item.query);
                        setResult({
                          ai_response: item.ai_response,
                          indian_kanoon_results: item.indian_kanoon_results,
                          relevant_cases: item.relevant_cases
                        });
                      }}
                      className="ml-4 text-blue-600 hover:text-blue-500 text-sm"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Case Management Component with Kanban Board
const CaseManagement = ({ lawFirmId }) => {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showAddCase, setShowAddCase] = useState(false);
  const [showCaseDetail, setShowCaseDetail] = useState(false);
  const [draggedCase, setDraggedCase] = useState(null);
  const [newCase, setNewCase] = useState({
    case_number: '',
    case_title: '',
    case_type: 'civil',
    court_jurisdiction: '',
    client_name: '',
    assigned_attorney: '',
    description: '',
    opposing_counsel: '',
    judge_name: '',
    priority: 'medium'
  });

  // Define stage columns
  const stageColumns = [
    {
      id: 'intake',
      title: '📥 Intake',
      subtitle: 'New cases & client onboarding',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      id: 'ongoing',
      title: '⚖️ Ongoing',
      subtitle: 'Active cases & pre-trial',
      color: 'bg-yellow-50 border-yellow-200'
    },
    {
      id: 'hearing',
      title: '🧑‍⚖️ Hearing',
      subtitle: 'Court proceedings & dates',
      color: 'bg-purple-50 border-purple-200'
    },
    {
      id: 'judgment',
      title: '📝 Judgment',
      subtitle: 'Awaiting orders & decisions',
      color: 'bg-orange-50 border-orange-200'
    },
    {
      id: 'closed',
      title: '✅ Closed',
      subtitle: 'Completed cases',
      color: 'bg-green-50 border-green-200'
    }
  ];

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await axios.get(`${API}/cases/${lawFirmId}`);
      setCases(response.data);
    } catch (error) {
      console.error('Error fetching cases:', error);
    }
  };

  // Get cases by stage
  const getCasesByStage = (stage) => {
    return cases.filter(case_item => case_item.stage === stage);
  };

  // Color coding by case type
  const getCaseTypeColor = (type) => {
    const colors = {
      'criminal': 'bg-red-100 text-red-800 border-red-200',
      'civil': 'bg-blue-100 text-blue-800 border-blue-200',
      'family': 'bg-pink-100 text-pink-800 border-pink-200',
      'corporate': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'constitutional': 'bg-purple-100 text-purple-800 border-purple-200',
      'labor': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Priority color coding
  const getPriorityColor = (priority) => {
    const colors = {
      'urgent': 'text-red-600',
      'high': 'text-orange-600',
      'medium': 'text-yellow-600',
      'low': 'text-green-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  // Drag and drop handlers
  const handleDragStart = (e, caseItem) => {
    setDraggedCase(caseItem);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetStage) => {
    e.preventDefault();
    if (draggedCase && draggedCase.stage !== targetStage) {
      try {
        await axios.put(`${API}/cases/${draggedCase.id}/stage`, {
          stage: targetStage
        });
        fetchCases(); // Refresh to show updated positions
      } catch (error) {
        console.error('Error updating case stage:', error);
      }
    }
    setDraggedCase(null);
  };

  // Case action handlers
  const handleCaseClick = (caseItem) => {
    setSelectedCase(caseItem);
    setShowCaseDetail(true);
  };

  const handleAddNote = async (caseId, note) => {
    try {
      await axios.post(`${API}/cases/${caseId}/notes`, {
        case_id: caseId,
        content: note,
        author: 'Current User', // In real app, get from auth context
        note_type: 'general'
      });
      fetchCases();
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleAddTask = async (caseId, task) => {
    try {
      await axios.post(`${API}/cases/${caseId}/tasks`, {
        case_id: caseId,
        title: task.title,
        description: task.description,
        assigned_to: task.assigned_to,
        due_date: task.due_date,
        priority: task.priority
      });
      fetchCases();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleSetReminder = async (caseId, reminder) => {
    try {
      await axios.post(`${API}/cases/${caseId}/alerts`, {
        case_id: caseId,
        type: 'reminder',
        message: reminder.message,
        due_date: reminder.due_date,
        priority: reminder.priority
      });
      fetchCases();
    } catch (error) {
      console.error('Error setting reminder:', error);
    }
  };

  const handleAddCase = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/cases`, {
        ...newCase,
        law_firm_id: lawFirmId,
        stage: 'intake'
      });
      
      setNewCase({
        case_number: '',
        case_title: '',
        case_type: 'civil',
        court_jurisdiction: '',
        client_name: '',
        assigned_attorney: '',
        description: '',
        opposing_counsel: '',
        judge_name: '',
        priority: 'medium'
      });
      setShowAddCase(false);
      fetchCases();
    } catch (error) {
      console.error('Error adding case:', error);
    }
  };

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">📁 Case Management</h2>
            <p className="text-gray-600 mt-2">Kanban-style workflow for legal case management</p>
          </div>
          <button
            onClick={() => setShowAddCase(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            + Add New Case
          </button>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-screen">
          {stageColumns.map((column) => (
            <div
              key={column.id}
              className={`${column.color} rounded-lg p-4 border-2 border-dashed`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="mb-4">
                <h3 className="font-semibold text-lg text-gray-800">{column.title}</h3>
                <p className="text-sm text-gray-600">{column.subtitle}</p>
                <div className="mt-2 text-sm font-medium text-gray-700">
                  {getCasesByStage(column.id).length} cases
                </div>
              </div>

              {/* Case Cards */}
              <div className="space-y-4">
                {getCasesByStage(column.id).map((caseItem) => (
                  <div
                    key={caseItem.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, caseItem)}
                    onClick={() => handleCaseClick(caseItem)}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    {/* Case Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {caseItem.case_number}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getCaseTypeColor(caseItem.case_type)}`}>
                          {caseItem.case_type}
                        </span>
                      </div>
                      <div className={`text-xs font-medium ${getPriorityColor(caseItem.priority)}`}>
                        {caseItem.priority === 'urgent' && '🔴'}
                        {caseItem.priority === 'high' && '🟠'}
                        {caseItem.priority === 'medium' && '🟡'}
                        {caseItem.priority === 'low' && '🟢'}
                      </div>
                    </div>

                    {/* Case Title */}
                    <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {caseItem.case_title}
                    </h4>

                    {/* Case Details */}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <span className="font-medium">👥 Client:</span>
                        <span className="ml-2 truncate">{caseItem.client_name}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="font-medium">⚖️ Court:</span>
                        <span className="ml-2 truncate">{caseItem.court_jurisdiction}</span>
                      </div>

                      {caseItem.next_hearing_date && (
                        <div className="flex items-center">
                          <span className="font-medium">⏰ Next Date:</span>
                          <span className="ml-2">{formatDate(caseItem.next_hearing_date)}</span>
                        </div>
                      )}
                    </div>

                    {/* Badges and Counts */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-3">
                        {caseItem.documents_count > 0 && (
                          <span className="inline-flex items-center text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            📎 {caseItem.documents_count}
                          </span>
                        )}
                        {caseItem.research_count > 0 && (
                          <span className="inline-flex items-center text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                            🧠 {caseItem.research_count}
                          </span>
                        )}
                        {caseItem.active_alerts_count > 0 && (
                          <span className="inline-flex items-center text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            ⚠️ {caseItem.active_alerts_count}
                          </span>
                        )}
                        {caseItem.pending_tasks_count > 0 && (
                          <span className="inline-flex items-center text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                            ✅ {caseItem.pending_tasks_count}
                          </span>
                        )}
                      </div>

                      {/* Quick Actions (Visible on Hover) */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center space-x-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const note = prompt('Add a quick note:');
                              if (note) handleAddNote(caseItem.id, note);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="Add Note"
                          >
                            📝
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // In real app, this would open a file picker
                              alert('Document upload would open here');
                            }}
                            className="p-1 text-gray-400 hover:text-green-600"
                            title="Upload Document"
                          >
                            📁
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const reminder = prompt('Set a reminder:');
                              if (reminder) {
                                handleSetReminder(caseItem.id, {
                                  message: reminder,
                                  due_date: new Date(Date.now() + 24*60*60*1000), // Tomorrow
                                  priority: 'medium'
                                });
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-yellow-600"
                            title="Set Reminder"
                          >
                            🔔
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add Case Modal */}
        {showAddCase && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Case</h3>
                <form onSubmit={handleAddCase}>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Case Number (e.g., CR2025-041)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newCase.case_number}
                      onChange={(e) => setNewCase({...newCase, case_number: e.target.value})}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Case Title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newCase.case_title}
                      onChange={(e) => setNewCase({...newCase, case_title: e.target.value})}
                      required
                    />
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newCase.case_type}
                      onChange={(e) => setNewCase({...newCase, case_type: e.target.value})}
                    >
                      <option value="civil">Civil</option>
                      <option value="criminal">Criminal</option>
                      <option value="family">Family</option>
                      <option value="corporate">Corporate</option>
                      <option value="constitutional">Constitutional</option>
                      <option value="labor">Labor</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Court Jurisdiction"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newCase.court_jurisdiction}
                      onChange={(e) => setNewCase({...newCase, court_jurisdiction: e.target.value})}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Client Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newCase.client_name}
                      onChange={(e) => setNewCase({...newCase, client_name: e.target.value})}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Assigned Attorney"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newCase.assigned_attorney}
                      onChange={(e) => setNewCase({...newCase, assigned_attorney: e.target.value})}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Opposing Counsel (Optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newCase.opposing_counsel}
                      onChange={(e) => setNewCase({...newCase, opposing_counsel: e.target.value})}
                    />
                    <input
                      type="text"
                      placeholder="Judge Name (Optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newCase.judge_name}
                      onChange={(e) => setNewCase({...newCase, judge_name: e.target.value})}
                    />
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newCase.priority}
                      onChange={(e) => setNewCase({...newCase, priority: e.target.value})}
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <textarea
                      placeholder="Case Description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newCase.description}
                      onChange={(e) => setNewCase({...newCase, description: e.target.value})}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddCase(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Case
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Case Detail Modal/Sidebar */}
        {showCaseDetail && selectedCase && (
          <CaseDetailPanel 
            case={selectedCase} 
            onClose={() => setShowCaseDetail(false)}
            onUpdate={fetchCases}
          />
        )}
      </div>
    </div>
  );
};

// Document Management Component
const DocumentManagement = ({ lawFirmId, userId }) => {
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${API}/documents/${lawFirmId}`);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('law_firm_id', lawFirmId);
      formData.append('document_type', 'contract'); // Default type
      formData.append('uploaded_by', userId);

      const response = await axios.post(`${API}/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Document uploaded:', response.data);
      fetchDocuments(); // Refresh the list
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">📄 Document Management</h2>
          <div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.txt"
            />
            <label
              htmlFor="file-upload"
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              }`}
            >
              {isUploading ? 'Uploading...' : '📁 Upload Document'}
            </label>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-4">
              {documents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No documents uploaded yet. Upload your first document to get AI analysis.</p>
              ) : (
                documents.map((doc, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">{doc.document_name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Type:</span> {doc.document_type} | 
                          <span className="font-medium"> Uploaded:</span> {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                        {doc.ai_summary && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <h5 className="text-sm font-medium text-blue-900 mb-2">🤖 AI Analysis</h5>
                            <p className="text-sm text-blue-800">{doc.ai_summary}</p>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Analyzed
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;