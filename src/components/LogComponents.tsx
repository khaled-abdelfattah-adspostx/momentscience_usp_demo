import type { ReactNode } from 'react'
import './LogComponentsFallback.css'

// Function to format request object as a cURL command
const formatAsCurl = (request: any) => {
  if (!request) return '';

  // Handle different request object structures
  let url = request.endpoint || request.url || '';
  const method = request.method || 'POST'; // Default to POST since most USP API calls are POST
  const headers = request.headers || {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${request.apiKey || '[API_KEY]'}`
  };
  const body = request.body || null;
  
  // If we already have a pre-formatted curl command, use it
  if (request.curl) {
    return request.curl;
  }
  
  // Start building the cURL command
  let curlCommand = `curl -X ${method} "${url}"`;
  
  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    curlCommand += `\\\n  -H "${key}: ${value}"`;
  });
  
  // Add body if present
  if (body) {
    // Format the JSON body with proper indentation for display
    const formattedBody = typeof body === 'object' 
      ? JSON.stringify(body, null, 2) 
      : body;
    
    curlCommand += `\\\n  -d '${formattedBody}'`;
  }
  
  return curlCommand;
};

// Format response for better display
const formatResponse = (response: any) => {
  if (!response) return '';

  // Extract status and format
  const status = response.status || 200;
  const statusText = response.statusText || 'OK';
  
  // Format headers if present
  const headers = response.headers || {};
  
  // Get body
  const body = response.data || response.body || {};
  
  // Build formatted response
  const formatted = {
    status: `${status} ${statusText}`,
    headers: headers,
    body: body
  };
  
  return formatted;
};

interface LogEntryProps {
  timestamp: string
  action: string
  offer?: any
  request?: any
  response?: any
  webhook?: {
    payload: any,
    description: any
  }
  error?: string | null
  children?: ReactNode
}

interface SessionDetailsProps {
  sessionId: string | null
  offerCount: number
  selectedCount: number
  onGetDetails: () => void
  loading: boolean
}

export const LogEntry = ({ timestamp, action, offer, request, response, webhook, error }: LogEntryProps) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'fetch_offers': return '📋'
      case 'select': return '✅'
      case 'unselect': return '❌'
      case 'bulk_select': return '🔄'
      case 'bulk_unselect': return '🔄'
      case 'auto_select_all': return '⚡'
      case 'wrap_session': return '🎁'
      case 'session_details': return '🔍'
      default: return '🔧'
    }
  }

  const getActionColor = (action: string) => {
    if (error) return 'border-red-200 bg-red-50'
    switch (action) {
      case 'fetch_offers': return 'border-blue-200 bg-blue-50'
      case 'select': return 'border-green-200 bg-green-50'
      case 'unselect': return 'border-orange-200 bg-orange-50'
      case 'bulk_select': return 'border-purple-200 bg-purple-50'
      case 'bulk_unselect': return 'border-purple-200 bg-purple-50'
      case 'auto_select_all': return 'border-indigo-200 bg-indigo-50'
      case 'wrap_session': return 'border-green-200 bg-green-50'
      case 'session_details': return 'border-gray-200 bg-gray-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getActionDescription = (action: string) => {
    const descriptions: { [key: string]: string } = {
      'fetch_offers': 'Calling the MomentScience API to fetch available offers for the user',
      'select': 'The user selected a single offer to add to their preferences',
      'unselect': 'The user unselected a single offer from their preferences',
      'bulk_select_all': 'The user selected all available offers at once',
      'bulk_unselect_all': 'The user unselected all offers at once',
      'auto_select_all': 'Automatically selected all offers based on USP settings',
      'wrap_session': 'Finalizing the session with selected offers and sending completion data to MomentScience',
      'session_details': 'Getting current session state and selected campaigns list'
    }
    return descriptions[action] || `API action: ${action.replace('_', ' ')}`
  }

  return (
    <div className={`border rounded-xl p-6 mb-4 shadow-sm hover:shadow-md transition-shadow ${getActionColor(action)}`}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border">
            <span className="text-lg">{getActionIcon(action)}</span>
          </div>
          <div>
            <h4 className={`font-semibold text-lg ${error ? 'text-red-700' : 'text-gray-900'}`}>
              {action.replace('_', ' ').toUpperCase()}
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              {getActionDescription(action)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1">Timestamp</div>
          <div className="text-sm font-mono bg-white px-2 py-1 rounded border">
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
      
      {/* Error Section */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <span className="text-red-500 text-lg">⚠️</span>
            </div>
            <div>
              <h5 className="font-medium text-red-800 mb-1">Error Occurred</h5>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Offer Section */}
      {offer && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">🎯 Offer Details</span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <pre className="text-xs font-mono text-gray-700 overflow-x-auto">
              {typeof offer === 'object' ? JSON.stringify(offer, null, 2) : offer}
            </pre>
          </div>
        </div>
      )}

      {/* Request and Response Sections */}
      <div className="space-y-6">
        {/* Request Section */}
        {request && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 text-lg">➤</span>
                <h5 className="font-medium text-gray-900">Request</h5>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {request.method || 'GET'}
                </span>
              </div>
            </div>
            
            {/* Unified Request Details */}
            <details className="group" open>
              <summary className="cursor-pointer p-3 bg-blue-600 text-white rounded-t-lg hover:bg-blue-700 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Request Details</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigator.clipboard.writeText(formatAsCurl(request));
                      }}
                      className="px-2 py-1 text-xs bg-blue-700 hover:bg-blue-800 rounded transition-colors"
                      title="Copy cURL command"
                    >
                      📋 Copy cURL
                    </button>
                    <span className="text-blue-200 group-open:rotate-180 transition-transform">▼</span>
                  </div>
                </div>
              </summary>
              <div className="border border-blue-200 rounded-b-lg bg-white overflow-hidden">
                {/* cURL Command Section */}
                <div className="border-b border-gray-200">
                  <div className="p-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">🔧 cURL Command</span>
                      <span className="text-xs text-gray-500">(Copy-paste ready)</span>
                    </div>
                  </div>
                  <div className="bg-slate-900">
                    <pre className="p-4 text-sm font-mono text-green-400 overflow-x-auto max-h-48">
                      {formatAsCurl(request)}
                    </pre>
                  </div>
                </div>
                
                {/* Raw Request Data Section */}
                <div>
                  <div className="p-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">📄 Raw Request Data</span>
                      <span className="text-xs text-gray-500">(JSON format)</span>
                    </div>
                  </div>
                  <div className="bg-white">
                    <pre className="p-4 text-xs font-mono text-gray-700 overflow-x-auto max-h-40">
                      {JSON.stringify(request, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </details>
          </div>
        )}

        {/* Response Section */}
        {response && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-lg">←</span>
                <h5 className="font-medium text-gray-900">Response</h5>
                {response.status && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    response.status >= 400 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {response.status}
                  </span>
                )}
              </div>
              {response.timestamp && (
                <span className="text-xs text-gray-500">
                  {new Date(response.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>

            {/* Response Headers */}
            {response.headers && Object.keys(response.headers).length > 0 && (
              <details className="group">
                <summary className="cursor-pointer p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Headers</span>
                    <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                  </div>
                </summary>
                <div className="mt-2 bg-white border border-gray-200 rounded-lg p-3">
                  <div className="space-y-1 text-xs font-mono">
                    {Object.entries(response.headers || {}).map(([key, value]) => (
                      <div key={key} className="flex">
                        <span className="text-gray-500 w-32 flex-shrink-0">{key}:</span>
                        <span className="text-gray-700">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            )}

            {/* Response Body */}
            <details className="group" open>
              <summary className={`cursor-pointer p-3 rounded-t-lg transition-colors ${
                response.status >= 400 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Response Body</span>
                  <span className="group-open:rotate-180 transition-transform">▼</span>
                </div>
              </summary>
              <div className={`border rounded-b-lg overflow-hidden ${
                response.status >= 400 ? 'border-red-200' : 'border-green-200'
              }`}>
                <pre className={`p-4 text-xs font-mono overflow-x-auto max-h-48 ${
                  response.status >= 400 
                    ? 'bg-red-50 text-red-900' 
                    : 'bg-green-50 text-green-900'
                }`}>
                  {JSON.stringify(formatResponse(response), null, 2)}
                </pre>
              </div>
            </details>
          </div>
        )}
      </div>

      {/* Webhook Section */}
      {webhook && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-purple-600 text-lg">🔗</span>
            <h5 className="font-medium text-gray-900">Webhook Data</h5>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h6 className="text-sm font-medium text-gray-700 mb-2">Payload</h6>
              <pre className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs font-mono text-purple-900 overflow-x-auto max-h-32">
                {JSON.stringify(webhook.payload, null, 2)}
              </pre>
            </div>
            <div>
              <h6 className="text-sm font-medium text-gray-700 mb-2">Field Descriptions</h6>
              <pre className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs font-mono text-purple-900 overflow-x-auto max-h-32">
                {JSON.stringify(webhook.description, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const SessionDetails = ({ sessionId, offerCount, selectedCount, onGetDetails, loading }: SessionDetailsProps) => {
  return (
    <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl mb-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🔍</span>
        <h4 className="text-lg font-semibold text-gray-900">Session Details</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-white rounded-lg border border-gray-100">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Session ID
          </div>
          <div className="text-sm font-mono font-semibold text-gray-900 break-all">
            {sessionId || 'N/A'}
          </div>
        </div>
        <div className="text-center p-4 bg-white rounded-lg border border-gray-100">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Total Offers
          </div>
          <div className="text-3xl font-bold text-green-600">
            {offerCount}
          </div>
        </div>
        <div className="text-center p-4 bg-white rounded-lg border border-gray-100">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Selected
          </div>
          <div className="text-3xl font-bold text-red-600">
            {selectedCount}
          </div>
        </div>
      </div>
      
      <button
        onClick={onGetDetails}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
          loading 
            ? 'bg-gray-400 text-white cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
        }`}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin"></div>
            Loading...
          </>
        ) : (
          <>
            <span>🔍</span>
            Get Session Details
          </>
        )}
      </button>
    </div>
  )
}

interface EmptyStateProps {
  icon: string
  title: string
  description: string
}

export const EmptyState = ({ icon, title, description }: EmptyStateProps) => {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '3rem 1rem',
      color: '#6b7280'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        {icon}
      </div>
      <h3 style={{ 
        fontSize: '1.125rem', 
        fontWeight: 600, 
        color: '#374151', 
        marginBottom: '0.5rem',
        margin: 0
      }}>
        {title}
      </h3>
      <p style={{ 
        fontSize: '0.875rem',
        margin: 0
      }}>
        {description}
      </p>
    </div>
  )
}
