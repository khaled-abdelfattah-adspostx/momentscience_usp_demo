import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './ThankYouPage.css'

interface ThankYouState {
  sessionId: string
  selectedOffers: string[]
  offerCount: number
  totalAmount: string
}

const ThankYouPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [state] = useState<ThankYouState | null>(location.state as ThankYouState)

  useEffect(() => {
    // If no state is passed, redirect to home
    if (!state) {
      navigate('/')
    }
  }, [state, navigate])

  if (!state) {
    return null
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  const handleNewOrder = () => {
    navigate('/')
  }

  return (
    <div className="thank-you-page">
      <div className="container">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-animation">
            <div className="checkmark-circle">
              <div className="checkmark">✓</div>
            </div>
          </div>
          <h1 className="success-title">Payment Successful!</h1>
          <p className="success-subtitle">Thank you for your purchase. Your order has been confirmed.</p>
          <div className="order-confirmation">
            <span className="confirmation-label">Session ID:</span>
            <span className="confirmation-number">#{state.sessionId}</span>
          </div>
        </div>

        {/* Order Summary */}
        <div className="success-summary">
          <div className="summary-card">
            <h3>📦 Order Summary</h3>
            <div className="summary-details">
              <div className="summary-row">
                <span className="summary-label">Amount Paid:</span>
                <span className="summary-value">{state.totalAmount}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Session ID:</span>
                <span className="summary-value session-id">{state.sessionId}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Bonus Offers Selected:</span>
                <span className="summary-value">{state.offerCount} offers</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Date:</span>
                <span className="summary-value">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="next-steps-card">
            <h3>🎉 What's Next?</h3>
            <div className="next-steps-list">
              <div className="next-step">
                <div className="step-icon">📧</div>
                <div className="step-content">
                  <h4>Check Your Email</h4>
                  <p>Order confirmation and account details are on their way</p>
                </div>
              </div>
              <div className="next-step">
                <div className="step-icon">🚀</div>
                <div className="step-content">
                  <h4>Access Your Account</h4>
                  <p>Start using your new subscription immediately</p>
                </div>
              </div>
              {state.offerCount > 0 && (
                <div className="next-step">
                  <div className="step-icon">🎁</div>
                  <div className="step-content">
                    <h4>Enjoy Your Bonus Offers</h4>
                    <p>{state.offerCount} selected offers will be delivered to your inbox</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="success-actions">
          <button onClick={handleBackToHome} className="secondary-button">
            ← Back to Home
          </button>
          <button onClick={handleNewOrder} className="primary-button">
            Start New Order
          </button>
        </div>

        {/* Support Information */}
        <div className="support-info">
          <p>
            Need help? Contact our support team at{' '}
            <a href="mailto:support@example.com">support@example.com</a> or call{' '}
            <a href="tel:+1234567890">+1 (234) 567-890</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ThankYouPage
