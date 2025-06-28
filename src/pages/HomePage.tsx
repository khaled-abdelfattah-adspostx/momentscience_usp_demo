import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './HomePage.css'

interface FormData {
  apiKey: string
  pubUserId: string
}

const HomePage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>({
    apiKey: '',
    pubUserId: ''
  })
  const [useDemoCredentials, setUseDemoCredentials] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const demoCredentials = {
    apiKey: 'd3468440-4124-45e2-a0ff-13d8f89bec42',
    pubUserId: 'MomentScienceUSPDemo'
  }

  useEffect(() => {
    if (useDemoCredentials) {
      setFormData(demoCredentials)
      setErrors({})
    } else {
      setFormData({ apiKey: '', pubUserId: '' })
    }
  }, [useDemoCredentials])

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (!useDemoCredentials) {
      setFormData(prev => ({ ...prev, [field]: value }))
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }))
      }
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}
    
    if (!useDemoCredentials) {
      if (!formData.apiKey.trim()) {
        newErrors.apiKey = 'API Key is required'
      }
      if (!formData.pubUserId.trim()) {
        newErrors.pubUserId = 'pub_user_id is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleStartSession = () => {
    if (validateForm()) {
      // Create session data object
      const sessionData = {
        apiKey: formData.apiKey,
        pubUserId: formData.pubUserId,
        useDemoCredentials: useDemoCredentials
      }
      
      // Save to localStorage as a single object
      localStorage.setItem('sessionData', JSON.stringify(sessionData))
      
      // Navigate to select perks page
      navigate('/select-perks')
    }
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content-wrapper">
          <div className="hero-content">
            <div className="logo-container">
              <img 
                src="https://images.archbee.com/ELjiwjWcrv0a1IejQFFAF/aZWjr4Hs72CU0KtgsTNte_image-11.png" 
                alt="MomentScience"
                className="logo"
              />
            </div>
            <h1 className="hero-title">
              User Selected Perks Demo
            </h1>
            <p className="hero-subtitle">
              Experience personalized offer selection during the pre-checkout phase
            </p>
          </div>

          {/* Credentials Form - Inline with hero */}
          <div className="hero-form">
            <div className="form-container">
              <h2 className="form-title">Get Started</h2>
              <form className="form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label htmlFor="apiKey" className="label">
                    API Key
                  </label>
                  <input
                    type="text"
                    id="apiKey"
                    className={`input ${errors.apiKey ? 'input-error' : ''}`}
                    value={formData.apiKey}
                    onChange={(e) => handleInputChange('apiKey', e.target.value)}
                    disabled={useDemoCredentials}
                    placeholder="Enter your API key"
                  />
                  {errors.apiKey && <span className="error-message">{errors.apiKey}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="pubUserId" className="label">
                    Publisher User ID
                  </label>
                  <input
                    type="text"
                    id="pubUserId"
                    className={`input ${errors.pubUserId ? 'input-error' : ''}`}
                    value={formData.pubUserId}
                    onChange={(e) => handleInputChange('pubUserId', e.target.value)}
                    disabled={useDemoCredentials}
                    placeholder="Enter your pub_user_id"
                  />
                  {errors.pubUserId && <span className="error-message">{errors.pubUserId}</span>}
                </div>

                <div className="demo-toggle">
                  <label className="toggle-container">
                    <input
                      type="checkbox"
                      className="toggle-input"
                      checked={useDemoCredentials}
                      onChange={(e) => setUseDemoCredentials(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">Use demo credentials</span>
                  </label>
                </div>

                <button
                  type="button"
                  className="start-button"
                  onClick={handleStartSession}
                >
                  <span className="button-text">Start Demo</span>
                  <span className="button-icon">→</span>
                </button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <div className="scroll-arrow">↓</div>
          <span className="scroll-text">Scroll to explore API details</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="container">
          
          {/* API Integration Overview */}
          <div className="api-integration-section">
            <h2 className="section-title">API Integration Overview</h2>
            <p className="section-description">
              This demo showcases real-time integration with MomentScience APIs for User Selected Perks functionality.
            </p>
            
            <div className="api-endpoints-grid">
              <div className="api-endpoint-card">
                <h4>📋 Offers API</h4>
                <div className="endpoint-details">
                  <code>POST /native/v2/offers.json</code>
                  <p>Fetches available offers based on user targeting and placement configuration</p>
                  <ul>
                    <li>Real-time offer retrieval</li>
                    <li>Country and demographic targeting</li>
                    <li>Session ID generation</li>
                  </ul>
                </div>
              </div>

              <div className="api-endpoint-card">
                <h4>✅ Selection API</h4>
                <div className="endpoint-details">
                  <code>POST /sdk/v4/usp/{'{sessionId}'}/{'{campaignId}'}/select.json</code>
                  <p>Records when users select specific offers for follow-up delivery</p>
                  <ul>
                    <li>Individual offer selection tracking</li>
                    <li>Bearer token authentication</li>
                    <li>Real-time selection logging</li>
                  </ul>
                </div>
              </div>

              <div className="api-endpoint-card">
                <h4>❌ Unselect API</h4>
                <div className="endpoint-details">
                  <code>POST /sdk/v4/usp/{'{sessionId}'}/{'{campaignId}'}/unselect.json</code>
                  <p>Records when users deselect previously selected offers</p>
                  <ul>
                    <li>Selection state management</li>
                    <li>User preference tracking</li>
                    <li>Dynamic offer management</li>
                  </ul>
                </div>
              </div>

              <div className="api-endpoint-card">
                <h4>⚙️ Session Management</h4>
                <div className="endpoint-details">
                  <code>PUT /sdk/v4/usp/session/{'{sessionId}'}.json</code>
                  <p>Updates session with bulk selection/unselection operations</p>
                  <ul>
                    <li>Bulk selection updates</li>
                    <li>Session state persistence</li>
                    <li>Campaign grouping</li>
                  </ul>
                </div>
              </div>

              <div className="api-endpoint-card">
                <h4>📊 Session Details</h4>
                <div className="endpoint-details">
                  <code>GET /sdk/v4/usp/session/{'{sessionId}'}.json</code>
                  <p>Retrieves current session state and selected offers</p>
                  <ul>
                    <li>Session state inspection</li>
                    <li>Selected campaigns list</li>
                    <li>Debugging and validation</li>
                  </ul>
                </div>
              </div>

              <div className="api-endpoint-card">
                <h4>🔒 Wrap Session</h4>
                <div className="endpoint-details">
                  <code>POST /sdk/v4/usp/session/{'{sessionId}'}.json</code>
                  <p>Finalizes the session and triggers offer delivery workflows</p>
                  <ul>
                    <li>Session completion</li>
                    <li>Webhook trigger initiation</li>
                    <li>Follow-up workflow activation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* USP Information Section */}
          <div className="info-section">
            <div className="info-content">
              <h2 className="section-title">What is User Selected Perks (USP)?</h2>
              <p className="section-description">
                USP enables users to choose personalized offers during the pre-checkout phase, 
                while they are still actively engaged on the publisher's website or app. This approach 
                improves engagement and relevance by allowing users to select offers before completing 
                a transaction, rather than after.
              </p>
              
              <div className="benefits-grid">
                <div className="benefit-card">
                  <div className="benefit-icon">🎯</div>
                  <h3>Personalized Selection</h3>
                  <p>Users choose offers most relevant to their interests</p>
                </div>
                <div className="benefit-card">
                  <div className="benefit-icon">⚡</div>
                  <h3>Critical Moments</h3>
                  <p>Drives engagement during key conversion points</p>
                </div>
                <div className="benefit-card">
                  <div className="benefit-icon">📧</div>
                  <h3>Follow-up Delivery</h3>
                  <p>Offers delivered via email, SMS, or other channels</p>
                </div>
                <div className="benefit-card">
                  <div className="benefit-icon">🛡️</div>
                  <h3>Non-disruptive</h3>
                  <p>Keeps the experience native and seamless</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default HomePage
