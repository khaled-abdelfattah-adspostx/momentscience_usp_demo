import React from 'react'

const TestThankYouPage: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)', 
      padding: '1rem' 
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Success Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '80px', 
            height: '80px', 
            backgroundColor: '#10b981', 
            borderRadius: '50%', 
            marginBottom: '1.5rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            <svg style={{ width: '40px', height: '40px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            marginBottom: '1rem' 
          }}>
            Thank You!
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: '#6b7280', 
            marginBottom: '1.5rem' 
          }}>
            Your selections have been processed successfully
          </p>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            padding: '0.75rem 1.5rem', 
            backgroundColor: 'white', 
            borderRadius: '9999px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280', marginRight: '0.5rem' }}>Session ID:</span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>demo-session-123</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '2rem', 
          marginBottom: '2rem' 
        }}>
          
          {/* Order Summary Card */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '1.5rem', 
            boxShadow: '0 25px 50px rgba(0,0,0,0.1)', 
            padding: '2rem', 
            border: '1px solid #f3f4f6' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                backgroundColor: '#3b82f6', 
                borderRadius: '1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginRight: '1rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}>
                <svg style={{ width: '28px', height: '28px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' }}>Order Summary</h2>
            </div>
            
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '1rem 0', 
                borderBottom: '2px solid #f3f4f6' 
              }}>
                <span style={{ fontSize: '1.125rem', color: '#6b7280', fontWeight: '500' }}>Total Value</span>
                <span style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#10b981' }}>$39.97</span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '1rem 0', 
                borderBottom: '2px solid #f3f4f6' 
              }}>
                <span style={{ fontSize: '1.125rem', color: '#6b7280', fontWeight: '500' }}>Offers Selected</span>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginRight: '0.75rem' }}>2</span>
                  <div style={{ width: '1rem', height: '1rem', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '1rem 0' 
              }}>
                <span style={{ fontSize: '1.125rem', color: '#6b7280', fontWeight: '500' }}>Status</span>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: '0.75rem', 
                    height: '0.75rem', 
                    backgroundColor: '#10b981', 
                    borderRadius: '50%', 
                    marginRight: '0.75rem' 
                  }}></div>
                  <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.125rem' }}>Complete</span>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next Card */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '1.5rem', 
            boxShadow: '0 25px 50px rgba(0,0,0,0.1)', 
            padding: '2rem', 
            border: '1px solid #f3f4f6' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                backgroundColor: '#8b5cf6', 
                borderRadius: '1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginRight: '1rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}>
                <svg style={{ width: '28px', height: '28px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' }}>What's Next?</h2>
            </div>
            
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ 
                  width: '2.5rem', 
                  height: '2.5rem', 
                  backgroundColor: '#dbeafe', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginRight: '1rem',
                  marginTop: '0.25rem'
                }}>
                  <span style={{ color: '#2563eb', fontWeight: 'bold' }}>1</span>
                </div>
                <div>
                  <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem', fontSize: '1.125rem' }}>Webhook Notification</h3>
                  <p style={{ color: '#6b7280' }}>Your server receives the selection data automatically</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ 
                  width: '2.5rem', 
                  height: '2.5rem', 
                  backgroundColor: '#dcfce7', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginRight: '1rem',
                  marginTop: '0.25rem'
                }}>
                  <span style={{ color: '#16a34a', fontWeight: 'bold' }}>2</span>
                </div>
                <div>
                  <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem', fontSize: '1.125rem' }}>Email Delivery</h3>
                  <p style={{ color: '#6b7280' }}>Selected offers will be delivered to your inbox</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: '2.5rem', 
                  height: '2.5rem', 
                  backgroundColor: '#f3e8ff', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginRight: '1rem',
                  marginTop: '0.25rem'
                }}>
                  <span style={{ color: '#9333ea', fontWeight: 'bold' }}>3</span>
                </div>
                <div>
                  <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem', fontSize: '1.125rem' }}>Ready for More?</h3>
                  <p style={{ color: '#6b7280' }}>Start a new session anytime</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.5rem', 
          justifyContent: 'center', 
          marginBottom: '2rem' 
        }}>
          <button style={{ 
            padding: '1rem 2.5rem', 
            background: 'linear-gradient(135deg, #2563eb 0%, #9333ea 100%)', 
            color: 'white', 
            fontWeight: 'bold', 
            borderRadius: '1rem', 
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
            border: 'none',
            fontSize: '1.125rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg style={{ width: '1.5rem', height: '1.5rem', marginRight: '0.75rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Start New Session
          </button>
        </div>

      </div>
    </div>
  )
}

export default TestThankYouPage
