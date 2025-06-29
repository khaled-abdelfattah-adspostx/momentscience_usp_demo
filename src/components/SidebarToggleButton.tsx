interface SidebarToggleButtonProps {
  isOpen: boolean
  onToggle: () => void
  position?: 'left' | 'right'
}

const SidebarToggleButton = ({ isOpen, onToggle, position = 'right' }: SidebarToggleButtonProps) => {
  if (isOpen) return null

  return (
    <button
      onClick={onToggle}
      className="sidebar-toggle-fab"
      style={{
        position: 'fixed',
        top: '50%',
        [position]: '1rem',
        transform: 'translateY(-50%)',
        width: '3rem',
        height: '3rem',
        background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
        border: 'none',
        borderRadius: '50%',
        color: 'white',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        transition: 'all 0.2s ease-out',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}
      title="Show Technical Dashboard"
    >
      <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>
  )
}

export default SidebarToggleButton
