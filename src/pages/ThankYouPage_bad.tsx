import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './ThankYouPage.css'

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

const ThankYouPageNew: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)

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

  const handleStartNewSession = () => {
    navigate('/')
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const webhookPayload = {
    session_id: state.sessionId,
    offer_count: state.offerCount,
    total_amount: state.totalAmount,
    selected_offers: state.selectedOffers,
    timestamp: new Date().toISOString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Main Container */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6 animate-scale-in">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 animate-slide-in-up">
            Thank You!
          </h1>
          <p className="text-xl text-gray-600 animate-slide-in-up">
            Your selections have been processed successfully
          </p>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-white rounded-full shadow-md">
            <span className="text-sm text-gray-500 mr-2">Session ID:</span>
            <span className="font-mono text-sm font-medium text-gray-900">{state.sessionId}</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          
          {/* Order Summary Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Total Value</span>
                <span className="text-2xl font-bold text-green-600">{state.totalAmount}</span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Offers Selected</span>
                <div className="flex items-center">
                  <span className="text-xl font-bold text-gray-900 mr-2">{state.offerCount}</span>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Status</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-green-600 font-semibold">Complete</span>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">What's Next?</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Webhook Notification</h3>
                  <p className="text-gray-600 text-sm">Your server receives the selection data automatically</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <span className="text-green-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email Delivery</h3>
                  <p className="text-gray-600 text-sm">Selected offers will be delivered to your inbox</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <span className="text-purple-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Ready for More?</h3>
                  <p className="text-gray-600 text-sm">Start a new session anytime</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={handleStartNewSession}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Start New Session
          </button>
          
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {showTechnicalDetails ? 'Hide' : 'Show'} Technical Details
          </button>
        </div>

        {/* Technical Details Section */}
        {showTechnicalDetails && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 animate-slide-in-up">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Technical Integration Details
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Webhook Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Webhook Payload</h4>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">JSON Response</span>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(webhookPayload, null, 2))}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="text-xs text-gray-700 overflow-x-auto max-h-64">
                    {JSON.stringify(webhookPayload, null, 2)}
                  </pre>
                </div>
              </div>

              {/* API Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">API Information</h4>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <h5 className="font-medium text-gray-900 mb-2">Endpoint</h5>
                    <code className="text-sm text-gray-700">{state.wrapSessionRequest?.endpoint || '/api/wrap-session'}</code>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <h5 className="font-medium text-gray-900 mb-2">Status</h5>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${state.wrapSessionSuccess ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`text-sm font-medium ${state.wrapSessionSuccess ? 'text-green-700' : 'text-red-700'}`}>
                        {state.wrapSessionSuccess ? 'Success' : 'Failed'}
                      </span>
                    </div>
                  </div>
                  
                  {state.wrapSessionRequest?.curl && (
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium text-gray-900">cURL Command</h5>
                        <button
                          onClick={() => copyToClipboard(state.wrapSessionRequest!.curl)}
                          className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                      <pre className="text-xs text-gray-700 overflow-x-auto">
                        {state.wrapSessionRequest.curl}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Support Footer */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h3>
            <p className="text-gray-600 mb-6">
              Questions about integration or need technical support?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://docs.momentscience.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Documentation
              </a>
              <a
                href="mailto:support@momentscience.com"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
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
  )
}

export default ThankYouPageNew
