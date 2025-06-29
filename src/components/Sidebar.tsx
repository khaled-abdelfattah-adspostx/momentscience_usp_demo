import { useEffect, useRef } from 'react'
import './SidebarFallback.css'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  width?: 'sm' | 'md' | 'lg' | 'xl'
  position?: 'left' | 'right'
}

const Sidebar = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  children, 
  width = 'lg',
  position = 'right' 
}: SidebarProps) => {
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Debug logging
  console.log('🔧 Sidebar render:', { isOpen, title, width, position })

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      // Don't prevent body scrolling - let main content remain scrollable
      // document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      // Restore body scrolling
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const getWidth = () => {
    switch (width) {
      case 'sm': return '320px'
      case 'md': return '384px' 
      case 'lg': return '512px'
      case 'xl': return '640px'
      default: return '512px'
    }
  }

  if (!isOpen) {
    console.log('🔧 Sidebar not rendering - isOpen is false')
    return null
  }

  console.log('🔧 Sidebar IS rendering - creating sidebar')

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: position === 'right' ? 'flex-end' : 'flex-start'
      }}
      onClick={onClose}
    >
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        style={{
          width: getWidth(),
          height: '100vh',
          background: 'white',
          boxShadow: position === 'right' ? '-2px 0 10px rgba(0, 0, 0, 0.1)' : '2px 0 10px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : position === 'right' ? 'translateX(100%)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
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
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'white', 
              padding: '0.5rem', 
              borderRadius: '0.5rem', 
              cursor: 'pointer',
              marginLeft: '1rem',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none'
            }}
          >
            <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Sidebar
