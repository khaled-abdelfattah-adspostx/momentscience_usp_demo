import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import EmbeddedSidebar from '../components/EmbeddedSidebar'
import SidebarToggleButton from '../components/SidebarToggleButton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/Tabs'

interface ThankYouState {
  sessionId: string
  selectedOffers: string[]
  offerCount: number
  totalAmount: string
  wrapSessionSuccess?: boolean
  wrapSessionRequest?: {
    endpoint: string
    body: any
    curl: string
  }
  wrapSessionResponse?: any
}

interface WebhookFieldDescription {
  name: string;
  description: string;
}

// Helper function to generate webhook payload example
const getWebhookPayloadExample = (state: ThankYouState) => {
  return {
    body: {
      campaigns: state.selectedOffers.map((offerId, index) => ({
        campaign_id: offerId,
        advertiser_name: `Advertiser ${index + 1}`,
        title: `Offer ${index + 1}`,
        short_headline: `Special Offer ${index + 1}`,
        short_description: "Limited time offer for our customers",
        offer_description: "Take advantage of this exclusive deal available only to our customers",
        terms_and_conditions: "Some restrictions apply. See offer details for more information.",
        click_url: "https://example.com/offers/special-deal",
        cta_yes: "Claim Now",
        cta_no: "No Thanks",
        mini_text: "Limited time offer",
        image: "https://example.com/images/offer.jpg",
        pixel: "",
        adv_pixel_url: "",
        save_for_later_url: "https://example.com/offers/save-for-later",
        description: "Take advantage of this exclusive deal available only to our customers",
        is_loyaltyboost: false,
        loyaltyboost_requirements: {},
        offerwall_enabled: false,
        perkswallet_enabled: false,
        sub_text: "Valid for limited time",
        unique_id: `unique_${index + 1}`,
        lander_type: "default",
        category_display_name: "Special Offers",
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        restrictions: []
      })),
      pub_user_id: "demo_user_123",
      session_id: state.sessionId,
      total_amount: state.totalAmount,
      timestamp: new Date().toISOString()
    },
    endpoint: "/api/webhook/offers-selected",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": "your-api-key"
    }
  }
}

// Webhook field descriptions for the documentation
const webhookFieldDescriptions: WebhookFieldDescription[] = [
  { name: "campaigns", description: "Array of selected offer objects with campaign details" },
  { name: "campaign_id", description: "Unique identifier for the campaign" },
  { name: "advertiser_name", description: "Name of the advertiser" },
  { name: "title", description: "Main title of the offer" },
  { name: "short_headline", description: "Brief headline for the offer" },
  { name: "offer_description", description: "Detailed description of the offer" },
  { name: "click_url", description: "URL to redirect users when they click the offer" },
  { name: "cta_yes", description: "Text for the positive call-to-action button" },
  { name: "cta_no", description: "Text for the negative call-to-action button" },
  { name: "pub_user_id", description: "Publisher's user identifier" },
  { name: "session_id", description: "Unique session identifier" },
  { name: "total_amount", description: "Total monetary value of selected offers" },
  { name: "timestamp", description: "ISO timestamp of when the selection was made" }
]

const ThankYouPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [showSidebar, setShowSidebar] = useState(false)
  const [activeTab, setActiveTab] = useState('webhook')

  // Get state from navigation or use defaults
  const state: ThankYouState = location.state || {
    sessionId: 'demo-session-123',
    selectedOffers: ['offer1', 'offer2'],
    offerCount: 2,
    totalAmount: '$50.00',
    wrapSessionSuccess: true,
    wrapSessionRequest: {
      endpoint: '/api/wrap-session',
      body: { session_id: 'demo-session-123' },
      curl: 'curl -X POST "https://api.momentscience.com/wrap-session" -H "Content-Type: application/json" -d \'{"session_id":"demo-session-123"}\''
    },
    wrapSessionResponse: { status: 'success', message: 'Session wrapped successfully' }
  }

  useEffect(() => {
    // Store completion state
    localStorage.setItem('usp_demo_completed', 'true')
    localStorage.setItem('usp_demo_session_data', JSON.stringify(state))
  }, [state])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You might want to add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Sidebar Toggle Button */}
      <SidebarToggleButton
        isOpen={showSidebar}
        onToggle={() => setShowSidebar(!showSidebar)}
      />

      {/* Main Content Area */}
      <div 
        className="transition-all duration-300 ease-in-out"
        style={{ marginRight: showSidebar ? '480px' : '0px', maxWidth: '100%' }}>
        
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Thank You!</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Session: 
                    <span className="ml-2 font-mono">{state.sessionId}</span>
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-emerald-700">Complete</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Order Summary Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transform hover:scale-[1.02] transition-transform duration-200">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Order Summary
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Total Value</span>
                  <span className="font-bold text-gray-900">{state.totalAmount}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Session ID</span>
                  <span className="font-mono text-xs bg-gray-50 px-2.5 py-1.5 rounded-md text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors">{state.sessionId}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Offers Selected</span>
                  <div className="flex items-center">
                    <span className="font-bold text-gray-900 mr-2">{state.offerCount}</span>
                    <span className={`w-3 h-3 rounded-full ${state.offerCount > 0 ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                  </div>
                </div>
              </div>
            </div>

            {/* What's Next Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transform hover:scale-[1.02] transition-transform duration-200">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  What's Next?
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Webhook Notification</h3>
                    <p className="text-gray-600 text-sm mt-1">Your server will receive the offer selection data via webhook</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-emerald-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email Delivery</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {state.offerCount > 0 && (
                        <>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 mr-2">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Active
                          </span>
                        </>
                      )}
                      <span className="font-medium text-emerald-600">{state.offerCount}</span> selected offers will be delivered to your inbox
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Start New Session</h3>
                    <p className="text-gray-600 text-sm mt-1">Ready to try again with different parameters?</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
              onClick={() => navigate('/')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Start New Session
            </button>
            <button
              className="px-8 py-3 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
              onClick={() => navigate('/')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Home
            </button>
          </div>

          {/* Support Section */}
          <div className="mt-12 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 mb-4">
                Check out the technical documentation below or contact our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://docs.momentscience.com"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Documentation
                </a>
                <a
                  href="mailto:support@momentscience.com"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Sidebar */}
      <EmbeddedSidebar
        isOpen={showSidebar}
        onToggle={() => setShowSidebar(!showSidebar)}
        title="Technical Details"
        subtitle="API Integration Details"
      >
        <div className="h-full flex flex-col bg-gray-50">
          <div className="flex-1 p-6">
            
            <Tabs className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="webhook"
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                >
                  Webhook
                </TabsTrigger>
                <TabsTrigger 
                  value="wrap-api"
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                >
                  Wrap API
                </TabsTrigger>
              </TabsList>

              <TabsContent value="webhook" activeTab={activeTab}>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Webhook Status</h4>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${state?.wrapSessionSuccess ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                        <span className={`text-sm font-medium ${state?.wrapSessionSuccess ? 'text-green-700' : 'text-red-700'}`}>
                          {state?.wrapSessionSuccess
                            ? 'Webhook Delivered Successfully'
                            : 'Webhook Delivery Failed'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Webhook Payload</h4>
                      <button
                        onClick={() => {
                          copyToClipboard(JSON.stringify(getWebhookPayloadExample(state), null, 2));
                        }}
                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition-colors"
                      >
                        Copy JSON
                      </button>
                    </div>
                    <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto text-gray-700 max-h-64">
                      {JSON.stringify(getWebhookPayloadExample(state), null, 2)}
                    </pre>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Field Descriptions</h4>
                    <div className="space-y-2">
                      {webhookFieldDescriptions.map((field, index) => (
                        <div key={index} className="text-xs">
                          <span className="font-mono font-medium text-purple-600">{field.name}</span>
                          <span className="text-gray-600 ml-2">{field.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="wrap-api" activeTab={activeTab}>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Wrap Session API Call</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      This API call finalizes the user session and triggers the webhook delivery.
                    </p>

                    {state?.wrapSessionRequest ? (
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-sm font-medium text-gray-900">Endpoint</h5>
                          </div>
                          <div className="bg-gray-50 p-3 rounded border text-xs font-mono text-gray-700">
                            POST {state?.wrapSessionRequest?.endpoint}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-sm font-medium text-gray-900">cURL Command</h5>
                            <button
                              onClick={() => {
                                if (state?.wrapSessionRequest?.curl) {
                                  copyToClipboard(state.wrapSessionRequest.curl);
                                }
                              }}
                              className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition-colors"
                            >
                              Copy cURL
                            </button>
                          </div>
                          <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto text-gray-700 max-h-32">
                            {state?.wrapSessionRequest?.curl}
                          </pre>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Request Body</h5>
                          <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto text-gray-700 max-h-32">
                            {state?.wrapSessionRequest?.body && JSON.stringify(state?.wrapSessionRequest?.body, null, 2)}
                          </pre>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Response</h5>
                          <div className="bg-white border rounded p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-gray-600">Status: 200 OK</span>
                              <button
                                onClick={() => {
                                  if (state?.wrapSessionResponse) {
                                    copyToClipboard(JSON.stringify(state.wrapSessionResponse, null, 2));
                                  }
                                }}
                                className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded transition-colors"
                              >
                                Copy Response
                              </button>
                            </div>
                            <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto text-gray-700 max-h-32">
                              {state?.wrapSessionResponse && JSON.stringify(state?.wrapSessionResponse, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-500">No API call data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </EmbeddedSidebar>
    </div>
  )
}

export default ThankYouPage
