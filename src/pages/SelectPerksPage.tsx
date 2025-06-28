import { useEffect, useState } from 'react'
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

  // Load session data from localStorage on component mount
  useEffect(() => {
    const storedSessionData = localStorage.getItem('sessionData')
    if (storedSessionData) {
      try {
        const parsedData = JSON.parse(storedSessionData)
        setSessionData(parsedData)
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
    if (offers.length > 0 && !autoSelectionHandled && apiResponse?.data?.settings?.usp_all_offers_checked) {
      const campaignIds = offers.map(offer => offer.campaign_id).filter((id): id is number => Boolean(id))
      setSelectedOffers(new Set(campaignIds))
      setAutoSelectionHandled(true)
    }
  }, [offers, apiResponse, autoSelectionHandled])

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
    const action = selectAll ? 'selected_campaigns' : 'unselected_campaigns'
    
    try {
      const endpoint = `https://api-staging.adspostx.com/sdk/v4/usp/session/${sessionId}.json`
      const requestBody = {
        key: sessionData.apiKey,
        pub_user_id: sessionData.pubUserId,
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
            <h3>Session Details & API Tracker</h3>
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
            {selectionLogs.length > 0 ? (
              <div className="selection-logs">
                <h4>Selection API Calls</h4>
                {selectionLogs.map((log, index) => (
                  <div key={index} className={`log-entry ${log.error ? 'error' : 'success'}`}>
                    <div className="log-header">
                      <div className={`log-action ${log.action}`}>{log.action.replace('_', ' ')}</div>
                      <div className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</div>
                    </div>
                    
                    {log.offer && (
                      <div className="log-offer">
                        {log.action.includes('bulk') ? 
                          `${log.offer.count} offers` : 
                          (log.offer.title || log.offer.headline || `Campaign ${log.offer.campaign_id}`)}
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
            ) : (
              <div className="no-response">
                <h4>No Selection API Calls Yet</h4>
                <p>Select or unselect offers to see API tracking information here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="container">
        {/* Header */}
        <div className="header">
          <h1 className="title">Select Your Perks</h1>
          <p className="subtitle">Choose the offers that interest you</p>
          
          <div className="header-actions">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="debug-button"
            >
              {showSidebar ? 'Hide' : 'Show'} Session & API Details
            </button>
          </div>
        </div>

        {/* Session Information */}
        <div className="session-info">
          <div className="session-header">
            <h3>Session Information</h3>
            <div className="session-stats">
              <div className="stat-item">
                <strong>Session ID:</strong> {sessionId || 'Not available'}
              </div>
              <div className="stat-item">
                <strong>Total Offers:</strong> {offers.length}
              </div>
              <div className="stat-item">
                <strong>Selected:</strong> {selectedOffers.size}
              </div>
            </div>
          </div>
        </div>

        {/* Offers Section */}
        {offers.length > 0 ? (
          <div className="offers-section">
            <div className="offers-header">
              <h3>Available Offers ({offers.length})</h3>
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

            <div className="offers-grid">
              {offers.map((offer) => {
                const campaignId = offer.campaign_id
                const isSelected = campaignId ? selectedOffers.has(campaignId) : false

                return (
                  <div
                    key={offer.id || offer.campaign_id}
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
                          type="checkbox"
                          className="offer-checkbox"
                          checked={isSelected}
                          onChange={(e) => campaignId && handleOfferSelection(campaignId, e.target.checked)}
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

        {/* Actions */}
        <div className="actions">
          <button onClick={handleGoHome} className="secondary-button">
            Back to Home
          </button>
          <button onClick={handleRetry} className="primary-button">
            Refresh Offers
          </button>
          {offers.length > 0 && (
            <button
              onClick={wrapSession}
              disabled={!sessionId || selectedOffers.size === 0}
              className="primary-button"
            >
              Wrap Session
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default SelectPerksPage
