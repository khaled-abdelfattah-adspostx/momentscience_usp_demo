import type { ReactNode } from 'react'

interface SimpleSidebarProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

const SimpleSidebar = ({ isOpen, onClose, children }: SimpleSidebarProps) => {
  console.log('🔧 SimpleSidebar render:', { isOpen })

  if (!isOpen) {
    console.log('🔧 SimpleSidebar not rendering - isOpen is false')
    return null
  }

  console.log('🔧 SimpleSidebar IS rendering')

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '500px',
          height: '100vh',
          background: 'white',
          boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '1rem',
            background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
            🔧 Technical Dashboard (Simple)
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem'
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: '1rem', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default SimpleSidebar
