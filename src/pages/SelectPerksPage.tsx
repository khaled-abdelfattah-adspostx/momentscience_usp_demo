import { useEffect, useState, startTransition, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './SelectPerksPage.css'

interface SessionData {
  apiKey: string
  pubUserId: string
  useDemoCredentials: boolean
}

interface Offer {
  id?: string | number
  campaign_id?: number
  title?: string
  description?: string
  short_description?: string
  headline?: string
  logo?: string
  creative?: string
  image?: string
  cta_text?: string
  cta_yes?: string
  advertiser_name?: string
  [key: string]: any
}

const SelectPerksPage = () => {
  const navigate = useNavigate()
  const initialFetchDone = useRef(false)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [sessionId, setSessionId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [selectedOffers, setSelectedOffers] = useState<Set<string | number>>(new Set())
  const [selectionLogs, setSelectionLogs] = useState<{
    timestamp: string
    action: string
    offer: any
    request: any
    response: any
    error: string | null
  }[]>([])
  const [sessionDetailsLoading, setSessionDetailsLoading] = useState(false)
  const [sessionDetailsLogs, setSessionDetailsLogs] = useState<{
    timestamp: string
    request: any
    response: any
    error: string | null
  }[]>([])
  const [autoSelectionHandled, setAutoSelectionHandled] = useState(false)
  const [renderKey, setRenderKey] = useState(0)
  const [forceAutoSelect] = useState(false)

  // Helper function to get action descriptions
  const getActionDescription = (action: string) => {
    const descriptions: { [key: string]: string } = {
      'fetch_offers': 'Calling the MomentScience API to fetch available offers for the user',
      'select': 'The user selected a single offer to add to their preferences',
      'unselect': 'The user unselected a single offer from their preferences',
      'bulk_select_all': 'The user selected all available offers at once',
      'bulk_unselect_all': 'The user unselected all offers at once',
      'auto_select_all': 'Automatically selected all offers based on USP settings',
      'wrap_session': 'Finalizing the session with selected offers and sending completion data to MomentScience'
    }
    return descriptions[action] || `API action: ${action.replace('_', ' ')}`
  }

  // Load session data from localStorage on component mount
  useEffect(() => {
    // Prevent duplicate calls in React StrictMode
    if (initialFetchDone.current) return
    
    const storedSessionData = localStorage.getItem('sessionData')
    if (storedSessionData) {
      try {
        const parsedData = JSON.parse(storedSessionData)
        setSessionData(parsedData)
        initialFetchDone.current = true
        fetchOffers(parsedData)
      } catch (error) {
        console.error('Error parsing stored session data:', error)
        navigate('/')
      }
    } else {
      navigate('/')
    }
  }, [navigate])

  // Auto-select offers when they are loaded and settings indicate auto-selection
  useEffect(() => {
    // Check for auto-selection setting from API response or manual override
    // TEMPORARILY FORCE AUTO-SELECT FOR TESTING
    const shouldAutoSelect = apiResponse?.data?.settings?.usp_all_offers_checked || forceAutoSelect || true
    
    console.log('🔍 Auto-selection check:', {
      hasApiResponse: !!apiResponse,
      hasData: !!apiResponse?.data,
      hasSettings: !!apiResponse?.data?.settings,
      uspAllOffersChecked: apiResponse?.data?.settings?.usp_all_offers_checked,
      forceAutoSelect,
      shouldAutoSelect,
      offersLength: offers.length,
      autoSelectionHandled
    })
    
    if (offers.length > 0 && !autoSelectionHandled && shouldAutoSelect) {
      console.log('🔄 TRIGGERING AUTO-SELECTION')
      const campaignIds = offers.map(offer => offer.campaign_id).filter((id): id is number => Boolean(id))
      
      console.log('📋 Campaign IDs to select:', campaignIds)
      
      // CRITICAL FIX: Force immediate synchronous UI update
      const newSelectedSet = new Set<string | number>(campaignIds)
      
      // Batch state updates for immediate UI reflection
      startTransition(() => {
        setSelectedOffers(newSelectedSet)
        setAutoSelectionHandled(true)
        setRenderKey(prev => prev + 1)
      })
      
      console.log('✅ State updated, selectedOffers now contains:', Array.from(newSelectedSet))
      
      // Double-check with a micro-task to ensure UI updates
      queueMicrotask(() => {
        console.log('🔍 Micro-task check - selectedOffers:', Array.from(newSelectedSet))
        setRenderKey(prev => prev + 1) // Force another render
      })
      
      // Call API after ensuring UI state is set
      setTimeout(() => {
        handleAutoSelection(campaignIds)
      }, 250)
    }
  }, [offers, apiResponse, autoSelectionHandled, forceAutoSelect])

  const handleAutoSelection = async (campaignIds: number[]) => {
    if (!sessionData || !sessionId || campaignIds.length === 0) return

    try {
      const endpoint = `https://api-staging.adspostx.com/sdk/v4/usp/session/${sessionId}.json?pub_user_id=${encodeURIComponent(sessionData.pubUserId)}`
      // When usp_all_offers_checked = true, don't include "key" parameter in body
      const requestBody = {
        selected: campaignIds
      }

      const curlCommand = `curl -X PUT '${endpoint}' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer ${sessionData.apiKey}' \\
  -d '${JSON.stringify(requestBody, null, 2)}'`

      console.log('Auto-selecting all offers (usp_all_offers_checked=true):', { endpoint, requestBody })
      console.log('Auto-select cURL:', curlCommand)

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      const responseData = await response.json()
      console.log('Auto-select response:', responseData)

      // Add to selection logs
      const logEntry = {
        timestamp: new Date().toISOString(),
        action: 'auto_select_all',
        offer: { 
          count: campaignIds.length, 
          campaigns: campaignIds, 
          reason: 'usp_all_offers_checked=true (no key param in body)' 
        },
        request: { endpoint, body: requestBody, curl: curlCommand },
        response: responseData,
        error: null
      }
      setSelectionLogs(prev => [logEntry, ...prev])

    } catch (error) {
      console.error('Error auto-selecting offers:', error)
      
      // Add error to selection logs
      const logEntry = {
        timestamp: new Date().toISOString(),
        action: 'auto_select_all',
        offer: { 
          count: campaignIds.length, 
          campaigns: campaignIds, 
          reason: 'usp_all_offers_checked=true (no key param in body)' 
        },
        request: { campaignIds },
        response: null,
        error: error instanceof Error ? error.message : 'Failed to auto-select offers'
      }
      setSelectionLogs(prev => [logEntry, ...prev])
    }
  }

  const fetchOffers = async (data: SessionData) => {
    setLoading(true)
    setError('')
    
    try {
      const requestBody = {
        key: data.apiKey,
        pub_user_id: data.pubUserId,
        placement: 'in-app',
        user_agent: navigator.userAgent,
        ip: 'auto',
        fingerprint: 'demo_fingerprint',
        membership_id: data.pubUserId,
        country: 'us',
        dev: 1
      }

      const endpoint = 'https://api-staging.adspostx.com/native/v2/offers.json'
      const curlCommand = `curl -X POST '${endpoint}' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer ${data.apiKey}' \\
  -d '${JSON.stringify(requestBody, null, 2)}'`

      console.log('Fetching offers with request:', requestBody)
      console.log('cURL command:', curlCommand)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()
      console.log('Offers API response:', responseData)
      
      setApiResponse(responseData)
      
      // Extract offers and session ID from response
      const offersData = responseData.data?.offers || responseData.offers || []
      const sessionIdData = responseData.data?.session_id || responseData.session_id || ''
      
      setOffers(offersData)
      setSessionId(sessionIdData)

      // Add to selection logs for API tracking
      const logEntry = {
        timestamp: new Date().toISOString(),
        action: 'fetch_offers',
        offer: { count: offersData.length, session_id: sessionIdData },
        request: { endpoint, body: requestBody, curl: curlCommand },
        response: responseData,
        error: null
      }
      setSelectionLogs(prev => [logEntry, ...prev])
      
    } catch (error) {
      console.error('Error fetching offers:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch offers')
    } finally {
      setLoading(false)
    }
  }

  const handleOfferSelection = async (campaignId: number, isSelected: boolean) => {
    if (!sessionData || !sessionId) return

    const action = isSelected ? 'select' : 'unselect'
    const offer = offers.find(o => o.campaign_id === campaignId)
    
    try {
      const endpoint = `https://api-staging.adspostx.com/sdk/v4/usp/${sessionId}/${campaignId}/${action}.json`
      const requestBody = {
        key: sessionData.apiKey,
        pub_user_id: sessionData.pubUserId
      }

      const curlCommand = `curl -X POST '${endpoint}' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer ${sessionData.apiKey}' \\
  -d '${JSON.stringify(requestBody, null, 2)}'`

      console.log(`${action} offer:`, { campaignId, endpoint, requestBody })
      console.log(`${action} cURL:`, curlCommand)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      const responseData = await response.json()
      console.log(`${action} response:`, responseData)

      // Update local selection state
      const newSelectedOffers = new Set(selectedOffers)
      if (isSelected) {
        newSelectedOffers.add(campaignId)
      } else {
        newSelectedOffers.delete(campaignId)
      }
      setSelectedOffers(newSelectedOffers)

      // Add to selection logs
      const logEntry = {
        timestamp: new Date().toISOString(),
        action,
        offer,
        request: { endpoint, body: requestBody, curl: curlCommand },
        response: responseData,
        error: null
      }
      setSelectionLogs(prev => [logEntry, ...prev])

    } catch (error) {
      console.error(`Error ${action}ing offer:`, error)
      
      // Add error to selection logs
      const logEntry = {
        timestamp: new Date().toISOString(),
        action,
        offer,
        request: { campaignId },
        response: null,
        error: error instanceof Error ? error.message : `Failed to ${action} offer`
      }
      setSelectionLogs(prev => [logEntry, ...prev])
    }
  }

  const handleBulkSelection = async (selectAll: boolean) => {
    if (!sessionData || !sessionId || offers.length === 0) return

    const campaignIds = offers.map(offer => offer.campaign_id).filter((id): id is number => Boolean(id))
    const action = selectAll ? 'selected' : 'unselected'
    
    try {
      const endpoint = `https://api-staging.adspostx.com/sdk/v4/usp/session/${sessionId}.json?pub_user_id=${encodeURIComponent(sessionData.pubUserId)}`
      const requestBody = {
        [action]: campaignIds
      }

      const curlCommand = `curl -X PUT '${endpoint}' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer ${sessionData.apiKey}' \\
  -d '${JSON.stringify(requestBody, null, 2)}'`

      console.log(`Bulk ${selectAll ? 'select' : 'unselect'}:`, { endpoint, requestBody })
      console.log(`Bulk ${selectAll ? 'select' : 'unselect'} cURL:`, curlCommand)

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      const responseData = await response.json()
      console.log(`Bulk ${selectAll ? 'select' : 'unselect'} response:`, responseData)

      // Update local selection state
      if (selectAll) {
        setSelectedOffers(new Set(campaignIds))
      } else {
        setSelectedOffers(new Set())
      }

      // Add to selection logs
      const logEntry = {
        timestamp: new Date().toISOString(),
        action: `bulk_${selectAll ? 'select' : 'unselect'}`,
        offer: { count: campaignIds.length, campaigns: campaignIds },
        request: { endpoint, body: requestBody, curl: curlCommand },
        response: responseData,
        error: null
      }
      setSelectionLogs(prev => [logEntry, ...prev])

    } catch (error) {
      console.error(`Error bulk ${selectAll ? 'selecting' : 'unselecting'} offers:`, error)
      
      // Add error to selection logs
      const logEntry = {
        timestamp: new Date().toISOString(),
        action: `bulk_${selectAll ? 'select' : 'unselect'}`,
        offer: { count: campaignIds.length, campaigns: campaignIds },
        request: { campaignIds },
        response: null,
        error: error instanceof Error ? error.message : `Failed to bulk ${selectAll ? 'select' : 'unselect'} offers`
      }
      setSelectionLogs(prev => [logEntry, ...prev])
    }
  }

  const getSessionDetails = async () => {
    if (!sessionData || !sessionId) return

    setSessionDetailsLoading(true)
    
    try {
      const endpoint = `https://api-staging.adspostx.com/sdk/v4/usp/session/${sessionId}.json`
      const queryParams = new URLSearchParams({
        key: sessionData.apiKey,
        pub_user_id: sessionData.pubUserId
      })

      const fullUrl = `${endpoint}?${queryParams}`
      const curlCommand = `curl -X GET '${fullUrl}' \\
  -H 'Authorization: Bearer ${sessionData.apiKey}'`

      console.log('Getting session details:', { endpoint, queryParams: queryParams.toString() })
      console.log('Session details cURL:', curlCommand)

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionData.apiKey}`
        }
      })

      const responseData = await response.json()
      console.log('Session details response:', responseData)

      // Add to session details logs
      const logEntry = {
        timestamp: new Date().toISOString(),
        request: { endpoint: fullUrl, curl: curlCommand },
        response: responseData,
        error: null
      }
      setSessionDetailsLogs(prev => [logEntry, ...prev])

    } catch (error) {
      console.error('Error getting session details:', error)
      
      // Add error to session details logs
      const logEntry = {
        timestamp: new Date().toISOString(),
        request: { sessionId },
        response: null,
        error: error instanceof Error ? error.message : 'Failed to get session details'
      }
      setSessionDetailsLogs(prev => [logEntry, ...prev])
    } finally {
      setSessionDetailsLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!sessionData || !sessionId) {
      alert('Session not ready. Please try again.')
      return
    }

    try {
      setLoading(true)
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Call wrap session API after successful payment
      await wrapSession()
      
      // Navigate to thank you page
      navigate('/thank-you', { 
        state: { 
          sessionId,
          selectedOffers: Array.from(selectedOffers),
          offerCount: selectedOffers.size,
          totalAmount: '$39.97'
        }
      })
      
    } catch (error) {
      console.error('Payment failed:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const wrapSession = async () => {
    if (!sessionData || !sessionId) return

    try {
      const endpoint = `https://api-staging.adspostx.com/sdk/v4/usp/session/${sessionId}.json`
      const requestBody = {
        key: sessionData.apiKey,
        pub_user_id: sessionData.pubUserId,
        action: 'wrap'
      }

      const curlCommand = `curl -X POST '${endpoint}' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer ${sessionData.apiKey}' \\
  -d '${JSON.stringify(requestBody, null, 2)}'`

      console.log('Wrapping session:', { endpoint, requestBody })
      console.log('Wrap session cURL:', curlCommand)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      const responseData = await response.json()
      console.log('Wrap session response:', responseData)

      // Add to selection logs
      const logEntry = {
        timestamp: new Date().toISOString(),
        action: 'wrap_session',
        offer: { sessionId },
        request: { endpoint, body: requestBody, curl: curlCommand },
        response: responseData,
        error: null
      }
      setSelectionLogs(prev => [logEntry, ...prev])

      alert('Session wrapped successfully! Check the API logs for details.')

    } catch (error) {
      console.error('Error wrapping session:', error)
      
      // Add error to selection logs
      const logEntry = {
        timestamp: new Date().toISOString(),
        action: 'wrap_session',
        offer: { sessionId },
        request: { sessionId },
        response: null,
        error: error instanceof Error ? error.message : 'Failed to wrap session'
      }
      setSelectionLogs(prev => [logEntry, ...prev])
      
      alert('Failed to wrap session. Check the API logs for details.')
    }
  }

  const handleRetry = () => {
    if (sessionData) {
      setAutoSelectionHandled(false)
      initialFetchDone.current = false // Reset the flag for retry
      fetchOffers(sessionData)
    }
  }

  const handleGoHome = () => {
    navigate('/')
  }

  if (loading) {
    return (
      <div className="select-perks-page">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading offers...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="select-perks-page">
        <div className="container">
          <div className="error-message">
            <h4>Error Loading Offers</h4>
            <p>{error}</p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={handleRetry} className="retry-button">
                Try Again
              </button>
              <button onClick={handleGoHome} className="secondary-button">
                Go Back Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`select-perks-page ${showSidebar ? 'sidebar-open' : ''}`}>
      {/* Combined API Response Tracking and Session Details Right Sidebar */}
      {showSidebar && (
        <div className="api-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-title-section">
              <h3>🔧 Technical Dashboard</h3>
              <span className="sidebar-subtitle">API Monitoring & Session Details</span>
            </div>
            <button
              onClick={() => setShowSidebar(false)}
              className="close-sidebar"
            >
              ×
            </button>
          </div>
          <div className="sidebar-content">
            {/* Session Details Section */}
            <div className="session-details-section">
              <div className="current-session-info">
                <h4>Current Session</h4>
                <div className="session-detail-item">
                  <strong>Session ID:</strong>
                  <span className="session-id">{sessionId || 'Not available'}</span>
                </div>
                <div className="session-detail-item">
                  <strong>Offer Count:</strong>
                  <span>{offers.length}</span>
                </div>
                <div className="session-detail-item">
                  <strong>Selected:</strong>
                  <span>{selectedOffers.size}</span>
                </div>
              </div>

              <button
                onClick={getSessionDetails}
                disabled={sessionDetailsLoading || !sessionId}
                className="session-details-button"
              >
                {sessionDetailsLoading ? 'Loading...' : 'Get Session Details'}
              </button>
            </div>

            {/* Session Details Logs */}
            {sessionDetailsLogs.length > 0 && (
              <div className="session-details-logs">
                <h4>Session API Calls</h4>
                {sessionDetailsLogs.map((log, index) => (
                  <div key={index} className="log-entry">
                    <div className="log-header">
                      <div className="log-timestamp">{new Date(log.timestamp).toLocaleTimeString()}</div>
                      {log.error && <div className="log-error">ERROR</div>}
                    </div>
                    <div className="log-content">
                      {log.request && (
                        <div className="request-section">
                          <h5>Request</h5>
                          {log.request.curl && (
                            <div className="curl-command">
                              <strong>cURL:</strong>
                              <pre>{log.request.curl}</pre>
                            </div>
                          )}
                        </div>
                      )}
                      {log.response && (
                        <div className="response-section">
                          <h5>Response</h5>
                          <div className="response-data">
                            <pre>{JSON.stringify(log.response, null, 2)}</pre>
                          </div>
                        </div>
                      )}
                      {log.error && (
                        <div className="error-section">
                          <h5>Error</h5>
                          <div className="log-error">{log.error}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Selection/API Logs */}
            <div className="selection-logs-container">
              <div className="logs-header">
                <h4>📊 Selection API Activity</h4>
                <div className="logs-stats">
                  <span className="stat-badge">{selectionLogs.length} Events</span>
                  <span className="stat-badge success">{selectionLogs.filter(log => !log.error).length} Success</span>
                  {selectionLogs.filter(log => log.error).length > 0 && (
                    <span className="stat-badge error">{selectionLogs.filter(log => log.error).length} Errors</span>
                  )}
                </div>
              </div>
              {selectionLogs.length > 0 ? (
                <div className="selection-logs">
                  <div className="selection-logs-content">
                    {selectionLogs.map((log, index) => (
                      <div key={index} className={`log-entry ${log.error ? 'error' : 'success'}`}>
                        <div className="log-header">
                          <div className="log-action-wrapper">
                            <div className={`log-action ${log.action}`}>
                              <span className="action-icon">
                                {log.action === 'fetch_offers' && '📥'}
                                {log.action === 'select' && '✅'}
                                {log.action === 'unselect' && '❌'}
                                {log.action.includes('bulk') && '📋'}
                                {log.action.includes('auto') && '🤖'}
                                {log.action === 'wrap_session' && '🎁'}
                              </span>
                              {log.action.replace('_', ' ').toUpperCase()}
                            </div>
                            <div className="log-status">
                              {log.error ? (
                                <span className="status-error">❌ Failed</span>
                              ) : (
                                <span className="status-success">✅ Success</span>
                              )}
                            </div>
                          </div>
                          <div className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</div>
                        </div>
                        
                        {/* Action Description */}
                        <div className="log-description">
                          <span className="description-icon">💬</span>
                          {getActionDescription(log.action)}
                        </div>
                        
                        {log.offer && (
                          <div className="log-offer">
                            <span className="offer-icon">🎯</span>
                            {log.action.includes('bulk') || log.action.includes('auto_select') ? 
                              `${log.offer.count} offers processed` : 
                              (log.offer.title || log.offer.headline || 
                               (log.offer.campaign_id ? `Campaign #${log.offer.campaign_id}` : 'Unknown offer'))}
                          </div>
                        )}

                        {log.request && (
                          <div className="log-request">
                            <details>
                              <summary>Request Details</summary>
                              <div className="request-details">
                            {log.request.endpoint && <div><strong>Endpoint:</strong> {log.request.endpoint}</div>}
                            {log.request.body && (
                              <div className="request-body">
                                <strong>Body:</strong>
                                <pre>{JSON.stringify(log.request.body, null, 2)}</pre>
                              </div>
                            )}
                            {log.request.curl && (
                              <div className="curl-command">
                                <strong>cURL:</strong>
                                <pre>{log.request.curl}</pre>
                              </div>
                            )}
                          </div>
                        </details>
                      </div>
                    )}

                    {log.response && (
                      <div className="log-response">
                        <details>
                          <summary>Response Data</summary>
                          <div className="response-data">
                            <pre>{JSON.stringify(log.response, null, 2)}</pre>
                          </div>
                        </details>
                      </div>
                    )}

                    {log.error && (
                      <div className="log-error">
                        <strong>Error:</strong> {log.error}
                      </div>
                    )}
                  </div>
                ))}
                  </div>
                </div>
              ) : (
                <div className="no-response">
                  <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <h4>No API Activity Yet</h4>
                    <p>Start selecting offers to see real-time API tracking information here.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="container">
        {/* Checkout Page Header */}
        <div className="order-header">
          <div className="checkout-icon">🛒</div>
          <h1 className="order-title">Complete Your Purchase</h1>
          <p className="order-subtitle">Review your order and select any bonus offers that interest you</p>
          <div className="order-number">Session ID: {sessionId || 'Initializing...'}</div>
          
          <div className="header-actions">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="debug-button"
            >
              {showSidebar ? 'Hide' : 'Show'} Technical Details
            </button>
          </div>
        </div>

        {/* Cart Summary Section */}
        <div className="order-summary-section">
          <div className="order-summary-card">
            <h3>� Your Cart</h3>
            <div className="order-items">
              <div className="order-item">
                <div className="item-image">
                  <img src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop&crop=center" alt="Premium Subscription" />
                </div>
                <div className="item-details">
                  <span className="item-name">Premium Subscription</span>
                  <span className="item-description">Monthly Plan • Full Access</span>
                  <span className="item-sku">SKU: PREM-001</span>
                </div>
                <div className="item-price">$29.99</div>
              </div>
              <div className="order-item">
                <div className="item-image">
                  <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=80&h=80&fit=crop&crop=center" alt="Analytics Package" />
                </div>
                <div className="item-details">
                  <span className="item-name">Advanced Analytics</span>
                  <span className="item-description">Pro Dashboard • Real-time Data</span>
                  <span className="item-sku">SKU: ANLY-002</span>
                </div>
                <div className="item-price">$9.99</div>
              </div>
              <div className="order-item">
                <div className="item-image">
                  <img src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=80&h=80&fit=crop&crop=center" alt="Support Package" />
                </div>
                <div className="item-details">
                  <span className="item-name">Priority Support</span>
                  <span className="item-description">24/7 Chat • Phone Support</span>
                  <span className="item-sku">SKU: SUPP-003</span>
                </div>
                <div className="item-price">$4.99</div>
              </div>
              <div className="order-subtotal">
                <div className="subtotal-label">Subtotal</div>
                <div className="subtotal-price">$44.97</div>
              </div>
              <div className="order-discount">
                <div className="discount-label">First-time Customer Discount</div>
                <div className="discount-price">-$5.00</div>
              </div>
              <div className="order-total">
                <div className="total-label">Total</div>
                <div className="total-price">$39.97</div>
              </div>
            </div>
          </div>

          {/* Payment & Customer Information */}
          <div className="delivery-info-card">
            <h3>� Payment Information</h3>
            <div className="delivery-details">
              <div className="payment-method">
                <h4>Payment Method</h4>
                <div className="payment-option selected">
                  <div className="payment-icon">💳</div>
                  <div className="payment-details">
                    <span className="payment-type">Credit Card</span>
                    <span className="payment-info">•••• •••• •••• 1234</span>
                  </div>
                  <div className="payment-status">✓</div>
                </div>
              </div>
              
              <div className="customer-info">
                <h4>Billing Details</h4>
                <div className="detail-row">
                  <span className="detail-label">📧 Email:</span>
                  <span className="detail-value">customer@example.com</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">👤 User ID:</span>
                  <span className="detail-value">{sessionData?.pubUserId || 'demo-user-123'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">🔗 Session:</span>
                  <span className="detail-value session-id">{sessionId || 'Initializing...'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">📅 Date:</span>
                  <span className="detail-value">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auto-selection notification */}
        {autoSelectionHandled && (apiResponse?.data?.settings?.usp_all_offers_checked || forceAutoSelect || true) && (
          <div className="auto-selection-banner">
            <div className="banner-content">
              <div className="banner-icon">⚙️</div>
              <div className="banner-text">
                <strong>Auto-Selection Applied:</strong> Based on your defined settings in the MomentScience integration page where you indicated that "USP All Offers Should Be Checked" is set to <code>true</code>, all available offers have been automatically selected and sent to the session API using the selected campaign IDs (without the key parameter in the request body).
                {forceAutoSelect && <span className="banner-note"> (Manually triggered for testing)</span>}
                {!apiResponse?.data?.settings?.usp_all_offers_checked && !forceAutoSelect && <span className="banner-note"> (Demo mode - forced auto-selection enabled for testing purposes)</span>}
              </div>
            </div>
            <div className="banner-details">
              <div className="setting-info">
                <span className="setting-label">Integration Setting:</span>
                <code className="setting-value">usp_all_offers_checked = true</code>
              </div>
              <div className="offers-info">
                <span className="offers-label">Result:</span>
                <span className="offers-count">{selectedOffers.size} of {offers.length} offers automatically selected</span>
              </div>
            </div>
          </div>
        )}

        {/* Bonus Offers Section - Checkout Context */}
        <div className="offers-checkout-section">
          <div className="offers-section-header">
            <h3>
              <span className="offers-icon">🎁</span>
              Add Bonus Offers to Your Order
            </h3>
            <p className="offers-description">
              Before you complete your purchase, check out these personalized offers we've selected just for you. 
              Select any that interest you and we'll include them in your order confirmation email - completely free!
            </p>
            <div className="offers-benefits">
              <span className="benefit-badge">✅ Handpicked for you</span>
              <span className="benefit-badge">✅ Free with purchase</span>
              <span className="benefit-badge">✅ Email delivery</span>
            </div>
          </div>

          {offers.length > 0 ? (
            <div className="embedded-offers-section">
              <div className="offers-header">
                <div className="offers-stats">
                  <span className="offers-count">{offers.length} Available Offers</span>
                  <span className="offers-selected">{selectedOffers.size} Selected</span>
                </div>
                <div className="bulk-actions">
                  <button
                    onClick={() => handleBulkSelection(true)}
                    disabled={selectedOffers.size === offers.length}
                    className="bulk-button select-all"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => handleBulkSelection(false)}
                    disabled={selectedOffers.size === 0}
                    className="bulk-button unselect-all"
                  >
                    Unselect All
                  </button>
                </div>
              </div>

            <div className="offers-grid" key={`grid-${renderKey}-${selectedOffers.size}`}>
              {offers.map((offer, index) => {
                const campaignId = offer.campaign_id
                const isSelected = campaignId ? selectedOffers.has(campaignId) : false
                
                // Enhanced debug logging for auto-selection
                console.log(`🔍 Render offer ${index + 1}:`, { 
                  campaignId, 
                  isSelected, 
                  selectedOffersSize: selectedOffers.size,
                  hasInSet: campaignId ? selectedOffers.has(campaignId) : 'no-id',
                  autoSelectionHandled,
                  renderKey
                })

                return (
                  <div
                    key={`offer-${offer.id || offer.campaign_id}-${isSelected}-${renderKey}`}
                    className={`offer-card ${isSelected ? 'selected' : ''}`}
                  >
                    {/* Offer Image */}
                    <div className="offer-image">
                      {(offer.image || offer.creative || offer.logo) ? (
                        <img 
                          src={offer.image || offer.creative || offer.logo} 
                          alt={offer.title || offer.headline || 'Offer'} 
                        />
                      ) : (
                        <div className="offer-image-placeholder">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="#9CA3AF"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Offer Content */}
                    <div className="offer-content">
                      <h4 className="offer-title">
                        {offer.title || offer.headline || 'Untitled Offer'}
                      </h4>
                      <p className="offer-description">
                        {offer.description || offer.short_description || 'No description available'}
                      </p>
                      <div className="offer-meta">
                        <span className="advertiser-name">
                          {offer.advertiser_name || 'Unknown Advertiser'}
                        </span>
                      </div>
                    </div>

                    {/* Offer Actions */}
                    <div className="offer-actions">
                      <label className="offer-checkbox-label">
                        <input
                          key={`checkbox-${campaignId}-${isSelected}-${renderKey}`}
                          type="checkbox"
                          className="offer-checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            console.log(`📝 Checkbox changed for campaign ${campaignId}:`, e.target.checked)
                            campaignId && handleOfferSelection(campaignId, e.target.checked)
                          }}
                          disabled={!campaignId}
                        />
                        <span className="offer-cta">
                          Email me this offer
                        </span>
                      </label>
                    </div>
                  </div>
                )
              })}
            </div>
            </div>
          ) : (
            <div className="no-offers">
              <h4>No Offers Available</h4>
              <p>No offers were returned from the API. This might be due to targeting constraints or configuration issues.</p>
            </div>
          )}
        </div>

        {/* Checkout Section */}
        <div className="checkout-section">
          <div className="checkout-header">
            <h3>💳 Complete Your Purchase</h3>
            <p>Ready to proceed? Click the button below to complete your order.</p>
          </div>
          
          <div className="checkout-summary">
            <div className="summary-item">
              <span className="summary-label">Cart Total:</span>
              <span className="summary-value">$39.97</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Bonus Offers Selected:</span>
              <span className="summary-value">{selectedOffers.size} offers</span>
            </div>
            <div className="summary-item total">
              <span className="summary-label">Total to Pay:</span>
              <span className="summary-value">$39.97</span>
            </div>
          </div>
          
          <div className="checkout-actions">
            <button onClick={handleGoHome} className="secondary-button">
              ← Continue Shopping
            </button>
            <button onClick={handleRetry} className="tertiary-button">
              Refresh Offers
            </button>
            <button
              onClick={handlePayment}
              disabled={loading || !sessionId}
              className="pay-button"
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Processing Payment...
                </>
              ) : (
                <>
                  🔒 Pay $39.97 Now
                </>
              )}
            </button>
          </div>
          
          <div className="checkout-note">
            <p>
              🔒 Your payment is secure and protected. Selected offers will be sent to your email after payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SelectPerksPage
