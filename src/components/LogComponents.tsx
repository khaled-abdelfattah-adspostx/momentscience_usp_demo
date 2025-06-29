import type { ReactNode } from 'react'
import './LogComponentsFallback.css'

interface LogEntryProps {
  timestamp: string
  action: string
  offer?: any
  request?: any
  response?: any
  error?: string | null
  children?: ReactNode
}

interface SessionDetailsProps {
  sessionId: string
  offerCount: number
  selectedCount: number
  onGetDetails: () => void
  loading: boolean
}

export const LogEntry = ({ timestamp, action, offer, request, response, error }: LogEntryProps) => {
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
    if (error) return 'text-red-600 bg-red-50 border-red-200'
    switch (action) {
      case 'fetch_offers': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'select': return 'text-green-600 bg-green-50 border-green-200'
      case 'unselect': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'bulk_select': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'bulk_unselect': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'auto_select_all': return 'text-indigo-600 bg-indigo-50 border-indigo-200'
      case 'wrap_session': return 'text-green-600 bg-green-50 border-green-200'
      case 'session_details': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
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
    <div 
      className={`border rounded-lg p-4 mb-3 ${getActionColor(action)} log-entry ${error ? 'error' : 'info'}`}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '1rem',
        marginBottom: '0.75rem',
        borderColor: error ? '#fca5a5' : '#93c5fd',
        backgroundColor: error ? '#fef2f2' : '#eff6ff',
        color: error ? '#dc2626' : '#2563eb'
      }}
    >
      <div 
        className="flex items-center justify-between mb-2 log-entry-header"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}
      >
        <div 
          className="flex items-center gap-2 log-entry-action"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}
        >
          <span style={{ fontSize: '1.125rem' }}>{getActionIcon(action)}</span>
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.025em' }}>
            {action.replace('_', ' ')}
          </span>
        </div>
        <span 
          className="text-xs text-gray-500 log-entry-timestamp"
          style={{ fontSize: '0.75rem', color: '#6b7280' }}
        >
          {new Date(timestamp).toLocaleTimeString()}
        </span>
      </div>
      
      <div 
        className="text-sm text-gray-700 mb-3 italic log-entry-description"
        style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.75rem', fontStyle: 'italic' }}
      >
        {getActionDescription(action)}
      </div>
      
      {error ? (
        <div 
          className="text-sm text-red-700 bg-red-100 p-2 rounded"
          style={{ fontSize: '0.875rem', color: '#b91c1c', background: '#fee2e2', padding: '0.5rem', borderRadius: '0.25rem' }}
        >
          <strong>Error:</strong> {error}
        </div>
      ) : (
        <div 
          className="space-y-2 text-sm log-entry-details"
          style={{ fontSize: '0.875rem' }}
        >
          {offer && (
            <div>
              <strong>Offer:</strong> 
              <span 
                className="ml-2 text-gray-700"
                style={{ marginLeft: '0.5rem', color: '#374151' }}
              >
                {typeof offer === 'object' ? JSON.stringify(offer, null, 2) : offer}
              </span>
            </div>
          )}
          {request && (
            <details className="cursor-pointer" style={{ cursor: 'pointer' }}>
              <summary 
                className="font-medium hover:text-gray-900"
                style={{ fontWeight: 500 }}
              >
                Request Details
              </summary>
              <pre 
                className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto"
                style={{ 
                  marginTop: '0.5rem', 
                  background: '#f3f4f6', 
                  padding: '0.5rem', 
                  borderRadius: '0.25rem', 
                  fontSize: '0.75rem', 
                  overflow: 'auto',
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace'
                }}
              >
                {JSON.stringify(request, null, 2)}
              </pre>
            </details>
          )}
          {response && (
            <details className="cursor-pointer" style={{ cursor: 'pointer' }}>
              <summary 
                className="font-medium hover:text-gray-900"
                style={{ fontWeight: 500 }}
              >
                Response Details
              </summary>
              <pre 
                className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto"
                style={{ 
                  marginTop: '0.5rem', 
                  background: '#f3f4f6', 
                  padding: '0.5rem', 
                  borderRadius: '0.25rem', 
                  fontSize: '0.75rem', 
                  overflow: 'auto',
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace'
                }}
              >
                {JSON.stringify(response, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  )
}

export const SessionDetails = ({ 
  sessionId, 
  offerCount, 
  selectedCount, 
  onGetDetails, 
  loading 
}: SessionDetailsProps) => {
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 mb-6 session-details"
      style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1.5rem' }}
    >
      <h4 
        className="font-semibold text-gray-900 mb-4 flex items-center gap-2"
        style={{ fontWeight: 600, color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}
      >
        <span style={{ fontSize: '1.125rem' }}>📊</span>
        Current Session
      </h4>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div 
          className="flex justify-between items-center py-2 border-b border-gray-100 session-detail-row"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}
        >
          <span 
            className="text-sm font-medium text-gray-600 session-detail-label"
            style={{ fontSize: '0.875rem', fontWeight: 500, color: '#4b5563' }}
          >
            Session ID:
          </span>
          <span 
            className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded session-detail-value session-id-value"
            style={{ 
              fontSize: '0.875rem', 
              fontFamily: 'Consolas, Monaco, "Courier New", monospace', 
              color: '#111827', 
              background: '#f3f4f6', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '0.25rem',
              maxWidth: '200px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block'
            }}
            title={sessionId || 'Not available'}
          >
            {sessionId || 'Not available'}
          </span>
        </div>
        
        <div 
          className="flex justify-between items-center py-2 border-b border-gray-100 session-detail-row"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}
        >
          <span 
            className="text-sm font-medium text-gray-600 session-detail-label"
            style={{ fontSize: '0.875rem', fontWeight: 500, color: '#4b5563' }}
          >
            Offers Available:
          </span>
          <span 
            className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded session-detail-value blue"
            style={{ 
              fontSize: '0.875rem', 
              fontWeight: 600, 
              color: '#2563eb', 
              background: '#dbeafe', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '0.25rem' 
            }}
          >
            {offerCount}
          </span>
        </div>
        
        <div 
          className="flex justify-between items-center py-2 border-b border-gray-100 session-detail-row"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}
        >
          <span 
            className="text-sm font-medium text-gray-600 session-detail-label"
            style={{ fontSize: '0.875rem', fontWeight: 500, color: '#4b5563' }}
          >
            Selected:
          </span>
          <span 
            className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded session-detail-value green"
            style={{ 
              fontSize: '0.875rem', 
              fontWeight: 600, 
              color: '#16a34a', 
              background: '#dcfce7', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '0.25rem' 
            }}
          >
            {selectedCount}
          </span>
        </div>
        
        <button
          onClick={onGetDetails}
          disabled={loading || !sessionId}
          className={`session-details-button ${loading || !sessionId ? 'disabled' : 'enabled'}`}
          style={{
            width: '100%',
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            borderRadius: '0.5rem',
            transition: 'background-color 0.2s',
            border: 'none',
            cursor: loading || !sessionId ? 'not-allowed' : 'pointer',
            background: loading || !sessionId ? '#f3f4f6' : '#3b82f6',
            color: loading || !sessionId ? '#9ca3af' : 'white'
          }}
          onMouseEnter={(e) => {
            if (!loading && sessionId) {
              e.currentTarget.style.background = '#2563eb'
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && sessionId) {
              e.currentTarget.style.background = '#3b82f6'
            }
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '1rem', 
                height: '1rem', 
                border: '2px solid #d1d5db', 
                borderTop: '2px solid #4b5563', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite' 
              }}></div>
              Loading...
            </span>
          ) : (
            'Get Session Details'
          )}
        </button>
      </div>
    </div>
  )
}

export const EmptyState = ({ title, description, icon }: { 
  title: string
  description: string
  icon: string
}) => {
  return (
    <div 
      className="text-center py-12 px-6 empty-state"
      style={{ textAlign: 'center', padding: '3rem 1.5rem' }}
    >
      <div 
        className="text-4xl mb-4 empty-state-icon"
        style={{ fontSize: '2.5rem', marginBottom: '1rem' }}
      >
        {icon}
      </div>
      <h3 
        className="text-lg font-medium text-gray-900 mb-2 empty-state-title"
        style={{ fontSize: '1.125rem', fontWeight: 500, color: '#111827', marginBottom: '0.5rem' }}
      >
        {title}
      </h3>
      <p 
        className="text-sm text-gray-500 empty-state-description"
        style={{ fontSize: '0.875rem', color: '#6b7280' }}
      >
        {description}
      </p>
    </div>
  )
}
