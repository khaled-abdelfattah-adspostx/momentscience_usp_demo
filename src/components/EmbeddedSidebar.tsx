import type { ReactNode } from 'react'
import './EmbeddedSidebarFallback.css'

interface EmbeddedSidebarProps {
  isOpen: boolean
  onToggle: () => void
  title: string
  subtitle?: string
  children: ReactNode
  position?: 'left' | 'right'
}

const EmbeddedSidebar = ({ 
  isOpen, 
  onToggle, 
  title, 
  subtitle, 
  children, 
  position = 'right' 
}: EmbeddedSidebarProps) => {
  console.log('🔧 EmbeddedSidebar render:', { isOpen, title, position })

  return (
    <div 
      className={`embedded-sidebar ${isOpen ? 'open' : 'closed'} ${position}`}
      style={{
        width: isOpen ? '480px' : '0px',
        minWidth: isOpen ? '480px' : '0px',
        maxWidth: isOpen ? '480px' : '0px',
        height: '100vh',
        minHeight: '100vh',
        position: 'fixed',
        top: 0,
        right: 0,
        background: 'white',
        borderLeft: position === 'right' ? (isOpen ? '1px solid #e5e7eb' : 'none') : 'none',
        borderRight: position === 'left' ? (isOpen ? '1px solid #e5e7eb' : 'none') : 'none',
        transition: 'width 0.3s ease-out, min-width 0.3s ease-out, max-width 0.3s ease-out',
        overflow: 'hidden',
        boxShadow: isOpen ? (position === 'right' ? '-2px 0 10px rgba(0, 0, 0, 0.1)' : '2px 0 10px rgba(0, 0, 0, 0.1)') : 'none',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000
      }}
    >
      {isOpen && (
        <>
          {/* Header */}
          <div 
            className="embedded-sidebar-header"
            style={{ 
              padding: '1rem 1.5rem', 
              borderBottom: '1px solid #e5e7eb', 
              background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', 
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ flex: 1 }}>
              <h2 style={{ color: 'white', fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
                {title}
              </h2>
              {subtitle && (
                <p style={{ color: '#dbeafe', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onToggle}
              className="embedded-sidebar-toggle"
              style={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                border: 'none', 
                color: 'white', 
                padding: '0.5rem', 
                borderRadius: '0.5rem', 
                cursor: 'pointer',
                marginLeft: '1rem',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
              }}
              title="Hide Technical Panel"
            >
              <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={position === 'right' ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
              </svg>
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Hide</span>
            </button>
          </div>

          {/* Content */}
          <div 
            className="embedded-sidebar-content"
            style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}
          >
            {children}
          </div>
        </>
      )}
    </div>
  )
}

export default EmbeddedSidebar
