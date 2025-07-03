import { useEffect, useState, startTransition, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './SelectPerksPage.css'
import EmbeddedSidebar from '../components/EmbeddedSidebar'
import SidebarToggleButton from '../components/SidebarToggleButton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/Tabs'
import { LogEntry, SessionDetails, EmptyState } from '../components/LogComponents'

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
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
  const [error, setError] = useState<string>('')
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [selectedOffers, setSelectedOffers] = useState<Set<string | number>>(new Set())

  // Debug log for sidebar state
  console.log('🔧 SelectPerksPage render - showSidebar:', showSidebar)
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
  const [activeTab, setActiveTab] = useState('session')

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
      // TEMPORARY: Set demo session data for testing
      const demoData = {
        apiKey: 'demo-api-key-12345',
        pubUserId: 'demo-user-123',
        useDemoCredentials: true
      }
      console.log('🔧 No session data found, using demo data:', demoData)
      setSessionData(demoData)
      initialFetchDone.current = true
      fetchOffers(demoData)
      // navigate('/')
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
    console.log(`🎯 handleOfferSelection called:`, { campaignId, isSelected, sessionData: !!sessionData, sessionId })
    
    if (!sessionData || !sessionId) {
      console.warn('⚠️ Missing session data or session ID for offer selection')
      return
    }

    // Update local selection state immediately for better UX
    setSelectedOffers(prev => {
      const newSet = new Set(prev)
      if (isSelected) {
        newSet.add(campaignId)
        console.log(`✅ Added ${campaignId} to selection. New size: ${newSet.size}`)
      } else {
        newSet.delete(campaignId)
        console.log(`❌ Removed ${campaignId} from selection. New size: ${newSet.size}`)
      }
      return newSet
    })

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
      
      // Revert the state change on error
      setSelectedOffers(prev => {
        const revertSet = new Set(prev)
        if (isSelected) {
          revertSet.delete(campaignId) // Remove if we tried to add
          console.log(`🔄 Reverted add for ${campaignId}. New size: ${revertSet.size}`)
        } else {
          revertSet.add(campaignId) // Add back if we tried to remove
          console.log(`🔄 Reverted remove for ${campaignId}. New size: ${revertSet.size}`)
        }
        return revertSet
      })
      
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
      setIsPaymentProcessing(true)
      
      // Make sure sidebar is visible to show technical details
      setShowSidebar(true)
      
      // Switch to API logs tab to show the payment processing
      setActiveTab('api')
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Call wrap session API after successful payment
      const wrapResult = await wrapSession()
      
      // Navigate to thank you page with payment results and API details
      navigate('/thank-you', { 
        state: { 
          sessionId,
          selectedOffers: Array.from(selectedOffers),
          offerCount: selectedOffers.size,
          totalAmount: '$39.97',
          wrapSessionSuccess: wrapResult.success,
          wrapSessionRequest: wrapResult.request,
          wrapSessionResponse: wrapResult.response,
          webhookPayload: wrapResult.webhookPayload,
          webhookFieldDescriptions: wrapResult.webhookFieldDescriptions
        }
      })
      
    } catch (error) {
      console.error('Payment failed:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setIsPaymentProcessing(false)
    }
  }

  const wrapSession = async (): Promise<{
    success: boolean;
    request?: any;
    response?: any;
    webhookPayload?: any;
    webhookFieldDescriptions?: any;
  }> => {
    if (!sessionData || !sessionId) return { success: false }

    try {
      const endpoint = `https://api-staging.adspostx.com/sdk/v4/usp/session/${sessionId}.json`
      const requestBody = {
        key: sessionData.apiKey,
        pub_user_id: sessionData.pubUserId,
        action: 'wrap'
      }

      // Create a webhook payload example that would be sent to the publisher
      const webhookPayload = {
        body: {
          campaigns: Array.from(selectedOffers).map(campaignId => {
            const offer = offers.find(o => o.campaign_id === campaignId) || {};
            return {
              campaign_id: campaignId,
              advertiser_name: offer.advertiser_name || "",
              title: offer.title || "",
              short_headline: offer.headline || "",
              short_description: offer.short_description || "",
              offer_description: offer.description || "",
              terms_and_conditions: offer.terms || "",
              click_url: offer.click_url || "",
              cta_yes: offer.cta_yes || "Claim Now",
              cta_no: offer.cta_no || "No Thanks",
              mini_text: offer.mini_text || "",
              image: offer.image || "",
              pixel: offer.pixel || "",
              adv_pixel_url: offer.adv_pixel_url || "",
              save_for_later_url: offer.save_for_later_url || "",
              description: offer.description || "",
              is_loyaltyboost: false,
              loyaltyboost_requirements: {},
              offerwall_enabled: false,
              perkswallet_enabled: false,
              tags: offer.tags || [],
              beacons: {
                close: "",
                no_thanks_click: ""
              },
              creatives: [
                {
                  id: 0,
                  url: offer.image || "",
                  type: "image",
                  creative_type: "primary",
                  aspect_ratio: 1.78,
                  height: 600,
                  width: 1067,
                  user_id: 0,
                  is_primary: true
                }
              ],
              campaign: {
                is_product: false,
                offer_description: offer.description || "",
                campaign_images: [
                  {
                    id: 0,
                    url: offer.image || "",
                    type: "image",
                    creative_type: "primary",
                    aspect_ratio: 1.78,
                    height: 600,
                    width: 1067,
                    user_id: 0,
                    is_primary: true
                  }
                ]
              },
              useraction_cta: null,
              useraction_url: null
            };
          }),
          pub_user_id: sessionData.pubUserId,
          selected: selectedOffers.size > 0 ? 1 : 0,
          session_id: sessionId
        }
      };

      // Create webhook field descriptions
      const webhookFieldDescriptions = {
        "body": "Container for the webhook payload data",
        "body.campaigns": "Array of offers selected by the user",
        "body.campaign_id": "The internal ID of the offer campaign",
        "body.advertiser_name": "The name of the advertiser associated with the offer",
        "body.title/short_headline/short_description": "Basic metadata for how the offer should be displayed",
        "body.offer_description": "Detailed explanation of the offer",
        "body.terms_and_conditions": "Terms of the selected offer",
        "body.click_url": "URL that leads to the offer landing page",
        "body.cta_yes/cta_no": "The CTA text for positive/negative user actions",
        "body.image/creatives": "Images and media creatives associated with the offer",
        "body.mini_text": "Supplemental note for the user, often for compliance",
        "body.pixel/adv_pixel_url": "Optional tracking pixels",
        "body.save_for_later_url": "Link that allows users to access the offer again later",
        "body.tags": "Optional categorization tags",
        "body.pub_user_id": "The unique identifier for the user, provided by the publisher",
        "body.selected": "Indicates whether the user selected any offers (1 for selected, 0 for none)",
        "body.session_id": "The unique session identifier generated by the Moments SDK"
      };

      const curlCommand = `curl -X POST '${endpoint}' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer ${sessionData.apiKey}' \\
  -d '${JSON.stringify(requestBody, null, 2)}'`

      console.log('Wrapping session:', { endpoint, requestBody })
      console.log('Wrap session cURL:', curlCommand)
      console.log('Webhook payload example:', webhookPayload)

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
        request: { 
          endpoint, 
          body: requestBody, 
          curl: curlCommand 
        },
        response: responseData,
        webhook: {
          payload: webhookPayload,
          description: webhookFieldDescriptions
        },
        error: null
      }
      setSelectionLogs(prev => [logEntry, ...prev])

      return {
        success: true,
        request: { 
          endpoint, 
          body: requestBody, 
          curl: curlCommand 
        },
        response: responseData,
        webhookPayload,
        webhookFieldDescriptions
      };
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
      
      return {
        success: false,
        request: { 
          endpoint: `https://api-staging.adspostx.com/sdk/v4/usp/session/${sessionId}.json`,
          body: {
            key: sessionData?.apiKey,
            pub_user_id: sessionData?.pubUserId,
            action: 'wrap'
          }
        },
        response: null,
        webhookPayload: null,
        webhookFieldDescriptions: null
      };
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

  if (loading || isPaymentProcessing) {
    return (
      <div className="loading-page-overlay">
        <div className="loading-container-modern">
          <div className="loading-animation">
            <div className="loading-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
            <div className="loading-pulse-ring">
              <div className="pulse-ring"></div>
              <div className="pulse-ring delay-1"></div>
              <div className="pulse-ring delay-2"></div>
            </div>
          </div>
          <div className="loading-content">
            <h2 className="loading-title">
              {isPaymentProcessing ? "Processing Your Payment" : "Loading Your Perks"}
            </h2>
            <p className="loading-subtitle">
              {isPaymentProcessing 
                ? "We're securely processing your transaction and registering your selected perks..." 
                : "We're preparing your personalized offers..."}
            </p>
            <div className="loading-progress">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
              <span className="progress-text">
                {isPaymentProcessing 
                  ? "Completing your purchase and finalizing perks selection" 
                  : "Fetching offers from MomentScience API"}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-page-overlay">
        <div className="error-container-modern">
          <div className="error-icon-modern">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="error-content-modern">
            <h2 className="error-title-modern">Unable to Load Offers</h2>
            <p className="error-description-modern">{error}</p>
            <div className="error-actions-modern">
              <button onClick={handleRetry} className="btn-primary-modern">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M1 4V10H7M23 20V14H17M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Try Again
              </button>
              <button onClick={handleGoHome} className="btn-secondary-modern">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Go Back Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="select-perks-page"
      style={{ 
        display: 'flex', 
        minHeight: '100vh', 
        height: '100vh',
        background: '#f9fafb',
        position: 'relative' // For fixed sidebar positioning
      }}
    >
      {/* Floating Toggle Button */}
      <SidebarToggleButton 
        isOpen={showSidebar} 
        onToggle={() => setShowSidebar(!showSidebar)} 
        position="right"
      />

      {/* Main Content Area */}
      <div 
        className="main-content"
        style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          minWidth: 0, // Important for flex shrinking
          height: '100vh',
          overflowY: 'auto', // Allow main content to scroll
          marginRight: showSidebar ? '480px' : '0px', // Account for fixed sidebar
          transition: 'margin-right 0.3s ease-out'
        }}
      >
        <div className="container" style={{ maxWidth: 'none', padding: '2rem', flex: 1 }}>
          {/* Modern Page Header */}
          <div className="page-header">
            <div className="header-content">
              <div className="status-badge">
                <div className="status-indicator"></div>
                <span>Session Active</span>
              </div>
              
              <h1 className="page-title">Complete Your Purchase</h1>
              <p className="page-description">
                Review your order and add any bonus offers that catch your interest. 
                All selected offers will be delivered to your email after purchase.
              </p>
              
              <div className="session-info">
                <div className="session-item">
                  <span className="session-label">Session ID</span>
                  <span className="session-value">{sessionId || 'Initializing...'}</span>
                </div>
                <div className="session-item">
                  <span className="session-label">User ID</span>
                  <span className="session-value">{sessionData?.pubUserId || 'demo-user-123'}</span>
                </div>
                <div className="session-item">
                  <span className="session-label">Date</span>
                  <span className="session-value">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="header-actions">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className={`tech-toggle-btn ${showSidebar ? 'active' : ''}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Technical Dashboard</span>
              </button>
            </div>
          </div>

          {/* Modern Cart Summary Section */}
          <div className="checkout-layout">
            <div className="checkout-main">
              {/* Order Summary Card */}
              <div className="order-summary-modern">
                <div className="summary-header">
                  <h2 className="summary-title">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z" fill="currentColor"/>
                    </svg>
                    Your Order
                  </h2>
                  <div className="summary-badge">3 items</div>
                </div>
                
                <div className="order-items-modern">
                  <div className="order-item-modern">
                    <div className="item-image-modern">
                      <img src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop&crop=center" alt="Premium Subscription" />
                    </div>
                    <div className="item-details-modern">
                      <h4 className="item-name-modern">Premium Subscription</h4>
                      <p className="item-description-modern">Monthly Plan • Full Access</p>
                      <span className="item-sku-modern">SKU: PREM-001</span>
                    </div>
                    <div className="item-price-modern">$29.99</div>
                  </div>
                  
                  <div className="order-item-modern">
                    <div className="item-image-modern">
                      <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=80&h=80&fit=crop&crop=center" alt="Analytics Package" />
                    </div>
                    <div className="item-details-modern">
                      <h4 className="item-name-modern">Advanced Analytics</h4>
                      <p className="item-description-modern">Pro Dashboard • Real-time Data</p>
                      <span className="item-sku-modern">SKU: ANLY-002</span>
                    </div>
                    <div className="item-price-modern">$9.99</div>
                  </div>
                  
                  <div className="order-item-modern">
                    <div className="item-image-modern">
                      <img src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=80&h=80&fit=crop&crop=center" alt="Support Package" />
                    </div>
                    <div className="item-details-modern">
                      <h4 className="item-name-modern">Priority Support</h4>
                      <p className="item-description-modern">24/7 Chat • Phone Support</p>
                      <span className="item-sku-modern">SKU: SUPP-003</span>
                    </div>
                    <div className="item-price-modern">$4.99</div>
                  </div>
                </div>
                
                <div className="order-totals-modern">
                  <div className="total-row">
                    <span className="total-label">Subtotal</span>
                    <span className="total-value">$44.97</span>
                  </div>
                  <div className="total-row discount">
                    <span className="total-label">First-time Customer Discount</span>
                    <span className="total-value">-$5.00</span>
                  </div>
                  <div className="total-row final">
                    <span className="total-label">Total</span>
                    <span className="total-value">$39.97</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Payment & Customer Information Sidebar */}
            <div className="checkout-sidebar">
              <div className="payment-info-modern">
                <h3 className="payment-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" fill="currentColor"/>
                  </svg>
                  Payment Method
                </h3>
                <div className="payment-method-modern">
                  <div className="payment-card">
                    <div className="card-icon">💳</div>
                    <div className="card-details">
                      <span className="card-type">Credit Card</span>
                      <span className="card-number">•••• •••• •••• 1234</span>
                    </div>
                    <div className="card-status">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#22c55e">
                        <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="customer-details">
                  <h4 className="details-title">Billing Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <div className="detail-icon">📧</div>
                      <div className="detail-content">
                        <span className="detail-label">Email</span>
                        <span className="detail-value">customer@example.com</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-icon">👤</div>
                      <div className="detail-content">
                        <span className="detail-label">User ID</span>
                        <span className="detail-value">{sessionData?.pubUserId || 'demo-user-123'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>        {/* Smart Auto-selection notification */}
        {autoSelectionHandled && (apiResponse?.data?.settings?.usp_all_offers_checked || forceAutoSelect || true) && (
          <div className="smart-banner">
            <div className="banner-content">
              <div className="banner-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="banner-text">
                <h4 className="banner-title">Auto-Selection Active</h4>
                <p className="banner-description">
                  {selectedOffers.size} of {offers.length} offers selected automatically based on MomentScience integration settings
                </p>
              </div>
            </div>
          </div>
        )}        {/* Modern Bonus Offers Section */}
        <div className="offers-section-modern">
          <div className="offers-header-modern">
            <div className="header-content">
              <h2 className="offers-title">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9L17 14.74L18.18 21.02L12 17.77L5.82 21.02L7 14.74L2 9L8.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
                Exclusive Rewards Unlocked!
              </h2>
              <p className="offers-subtitle">
                Congratulations! Your order has unlocked these premium bonus offers exclusively for you. Select any that catch your interest and they'll be delivered to your email along with your order confirmation after payment. No extra cost – these rewards are our gift to you!
              </p>
            </div>
            
            <div className="offers-badges">
              <div className="feature-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
                </svg>
                <span>Personally Selected</span>
              </div>
              <div className="feature-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L13.09 8.26L22 9L13.09 15.74L12 22L10.91 15.74L2 9L10.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
                <span>Absolutely Free</span>
              </div>
              <div className="feature-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4ZM20 8H4V6H20V8ZM4 18H20V10H4V18Z" fill="currentColor"/>
                </svg>
                <span>Instant Email Delivery</span>
              </div>
              <div className="feature-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" fill="currentColor"/>
                </svg>
                <span>Premium Value</span>
              </div>
            </div>
          </div>          {offers.length > 0 ? (
            <div className="offers-container-modern">
              <div className="offers-controls">
                <div className="offers-stats-modern">
                  <div className="stat-card">
                    <span className="stat-number">{offers.length}</span>
                    <span className="stat-label">Available Offers</span>
                  </div>
                  <div className="stat-card selected">
                    <span className="stat-number">{selectedOffers.size}</span>
                    <span className="stat-label">Selected</span>
                  </div>
                </div>
                
                <div className="offers-actions">
                  <button
                    onClick={() => handleBulkSelection(true)}
                    disabled={selectedOffers.size === offers.length}
                    className="action-btn primary"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Select All
                  </button>
                  <button
                    onClick={() => handleBulkSelection(false)}
                    disabled={selectedOffers.size === 0}
                    className="action-btn secondary"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Clear All
                  </button>
                </div>
              </div>

              <div className="offers-grid-modern" key={`grid-${renderKey}-${selectedOffers.size}`}>
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
                    className={`offer-card-modern ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      if (campaignId) {
                        handleOfferSelection(campaignId, !isSelected);
                      } else {
                        console.warn('⚠️ No campaign ID for offer click');
                      }
                    }}
                  >
                    <div className="offer-card-header">
                      <div className="offer-image-modern">
                        {(offer.image || offer.creative || offer.logo) ? (
                          <img 
                            src={offer.image || offer.creative || offer.logo} 
                            alt={offer.title || offer.headline || 'Offer'} 
                          />
                        ) : (
                          <div className="offer-image-placeholder-modern">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                              <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="currentColor"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="offer-content-modern">
                      <h3 className="offer-title-modern">
                        {offer.title || offer.headline || 'Untitled Offer'}
                      </h3>
                      <p className="offer-description-modern">
                        {offer.description || offer.short_description || 'No description available'}
                      </p>
                      
                      <div className="offer-footer">
                        <div className="advertiser-info">
                          <div className="advertiser-avatar">
                            {(offer.advertiser_name || 'Unknown Advertiser').charAt(0)}
                          </div>
                          <span className="advertiser-name">
                            {offer.advertiser_name || 'Unknown Advertiser'}
                          </span>
                        </div>
                        
                        <div className="offer-cta">
                          <label className="offer-checkbox-modern" onClick={(e) => e.stopPropagation()}>
                            <input
                              key={`checkbox-${campaignId}-${isSelected}-${renderKey}`}
                              type="checkbox"
                              className="checkbox-input"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation(); // Prevent triggering the card click
                                if (campaignId) {
                                  handleOfferSelection(campaignId, e.target.checked);
                                } else {
                                  console.warn('⚠️ No campaign ID for checkbox change');
                                }
                              }}
                              disabled={!campaignId}
                            />
                            <div className="checkbox-custom">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <span className="cta-text">Email me this offer</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  )
                })}            </div>
            </div>
          ) : (
            <div className="no-offers-modern">
              <div className="no-offers-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="no-offers-title">No Bonus Offers Available</h3>
              <p className="no-offers-description">
                No additional offers are available at this time. This might be due to targeting constraints or configuration settings.
              </p>
            </div>
          )}
        </div>

        {/* Modern Checkout Section */}
        <div className="checkout-section-modern">
          <div className="checkout-final-card">
            <div className="checkout-header-modern">
              <h2 className="checkout-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Complete Your Purchase
              </h2>
              <p className="checkout-subtitle">Ready to finalize your order? Review the summary below and proceed when ready.</p>
            </div>
            
            <div className="checkout-summary-modern">
              <div className="summary-grid">
                <div className="summary-item-modern">
                  <div className="summary-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="summary-content">
                    <span className="summary-label">Cart Total</span>
                    <span className="summary-value">$39.97</span>
                  </div>
                </div>
                
                <div className="summary-item-modern">
                  <div className="summary-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L13.09 8.26L22 9L13.09 15.74L12 22L10.91 15.74L2 9L10.91 8.26L12 2Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="summary-content">
                    <span className="summary-label">Bonus Offers</span>
                    <span className="summary-value">{selectedOffers.size} selected</span>
                  </div>
                </div>
                
                <div className="summary-item-modern final">
                  <div className="summary-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="summary-content">
                    <span className="summary-label">Total to Pay</span>
                    <span className="summary-value">$39.97</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="checkout-actions-modern">
              <button onClick={handleGoHome} className="btn-secondary-modern">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Continue Shopping
              </button>
              
              <button onClick={handleRetry} className="btn-tertiary-modern">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M1 4V10H7M23 20V14H17M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Refresh Offers
              </button>
              
              <button
                onClick={handlePayment}
                disabled={loading || !sessionId}
                className="btn-primary-modern"
              >
                {loading ? (
                  <>
                    <div className="btn-loading-spinner">
                      <div className="spinner-dots">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                      </div>
                    </div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Secure Payment - $39.97
                  </>
                )}
              </button>
            </div>
            
            <div className="security-notice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 22S8 18 8 13V6L12 4L16 6V13C16 18 12 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Your payment is secure and protected. Selected offers will be delivered to your email after purchase.</span>
            </div>
          </div>
        </div>
        </div> {/* End container */}
      </div> {/* End main-content */}

      {/* Fixed Embedded Technical Sidebar */}
      <EmbeddedSidebar
        isOpen={showSidebar}
        onToggle={() => setShowSidebar(!showSidebar)}
        title="🔧 Technical Dashboard"
        subtitle="API Monitoring & Session Details"
        position="right"
      >
        <Tabs>
          <TabsList className="mb-4">
            <TabsTrigger 
              value="session" 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
            >
              📊 Session
            </TabsTrigger>
            <TabsTrigger 
              value="api-logs" 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
            >
              📋 API Logs
            </TabsTrigger>
            <TabsTrigger 
              value="session-api" 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
            >
              🔍 Session API
            </TabsTrigger>
          </TabsList>

          <TabsContent value="session" activeTab={activeTab}>
            <SessionDetails
              sessionId={sessionId}
              offerCount={offers.length}
              selectedCount={selectedOffers.size}
              onGetDetails={() => {
                getSessionDetails()
                // Navigate to Session API tab after getting details
                setActiveTab('session-api')
              }}
              loading={sessionDetailsLoading}
            />
            
            <div style={{ marginTop: '1.5rem' }}>
              <h5 style={{ fontWeight: 600, color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.125rem' }}>📈</span>
                Session Statistics
              </h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '0.5rem', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                    API Calls
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e3a8a' }}>
                    {selectionLogs.length}
                  </div>
                </div>
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '0.5rem', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                    Success Rate
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#14532d' }}>
                    {selectionLogs.length > 0 
                      ? Math.round((selectionLogs.filter(log => !log.error).length / selectionLogs.length) * 100)
                      : 0}%
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="api-logs" activeTab={activeTab} className="flex-1 flex flex-col">
            <div className="api-logs-container-full">
              <div className="api-logs-header">
                <h5 className="api-logs-title">
                  <span className="api-logs-icon">📊</span>
                  Selection API Activity
                </h5>
                <div className="api-logs-stats">
                  <span className="stat-badge events">
                    {selectionLogs.length} Events
                  </span>
                  <span className="stat-badge success">
                    {selectionLogs.filter(log => !log.error).length} Success
                  </span>
                  {selectionLogs.filter(log => log.error).length > 0 && (
                    <span className="stat-badge errors">
                      {selectionLogs.filter(log => log.error).length} Errors
                    </span>
                  )}
                </div>
              </div>
              
              {selectionLogs.length > 0 ? (
                <div className="api-logs-content-full">
                  {selectionLogs.map((log, index) => (
                    <LogEntry
                      key={index}
                      timestamp={log.timestamp}
                      action={log.action}
                      offer={log.offer}
                      request={log.request}
                      response={log.response}
                      error={log.error}
                    />
                  ))}
                </div>
              ) : (
                <div className="api-logs-empty-full">
                  <EmptyState
                    icon="📋"
                    title="No API Activity"
                    description="API calls will appear here when you interact with offers"
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="session-api" activeTab={activeTab} className="flex-1 flex flex-col">
            <div className="session-api-container-full">
              <div className="session-api-header">
                <h5 className="session-api-title">
                  <span className="session-api-icon">🔍</span>
                  Session API Calls
                </h5>
                <div className="session-api-stats">
                  <span className="stat-badge events">
                    {sessionDetailsLogs.length} Calls
                  </span>
                  <span className="stat-badge success">
                    {sessionDetailsLogs.filter(log => !log.error).length} Success
                  </span>
                  {sessionDetailsLogs.filter(log => log.error).length > 0 && (
                    <span className="stat-badge errors">
                      {sessionDetailsLogs.filter(log => log.error).length} Errors
                    </span>
                  )}
                </div>
              </div>
              
              {/* Get Session Details Button */}
              <div className="mb-4">
                <button
                  onClick={() => {
                    getSessionDetails()
                  }}
                  disabled={sessionDetailsLoading}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    sessionDetailsLoading 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  }`}
                >
                  {sessionDetailsLoading ? (
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
              
              {sessionDetailsLogs.length > 0 ? (
                <div className="session-api-content-full">
                  {sessionDetailsLogs.map((log, index) => (
                    <LogEntry
                      key={index}
                      timestamp={log.timestamp}
                      action="session_details"
                      request={log.request}
                      response={log.response}
                      error={log.error}
                    />
                  ))}
                </div>
              ) : (
                <div className="session-api-empty-full">
                  <EmptyState
                    icon="🔍"
                    title="No Session API Calls"
                    description="Session API calls will appear here when you get session details"
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </EmbeddedSidebar>
    </div>
  )
}

export default SelectPerksPage
