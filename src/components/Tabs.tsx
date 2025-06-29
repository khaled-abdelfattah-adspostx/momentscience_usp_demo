import type { ReactNode } from 'react'
import './TabsFallback.css'

interface TabsProps {
  children: ReactNode
  className?: string
}

interface TabsListProps {
  children: ReactNode
  className?: string
}

interface TabsTriggerProps {
  children: ReactNode
  value: string
  activeTab: string
  onTabChange: (value: string) => void
  className?: string
}

interface TabsContentProps {
  children: ReactNode
  value: string
  activeTab: string
  className?: string
}

export const Tabs = ({ children, className = '' }: TabsProps) => {
  return (
    <div className={`tabs ${className}`} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  )
}

export const TabsList = ({ children, className = '' }: TabsListProps) => {
  return (
    <div 
      className={`flex bg-gray-100 p-1.5 rounded-lg tabs-list ${className}`}
      style={{ display: 'flex', background: '#f1f5f9', padding: '0.375rem', borderRadius: '0.75rem', marginBottom: '1rem', flexShrink: 0, border: '1px solid #e2e8f0' }}
    >
      {children}
    </div>
  )
}

export const TabsTrigger = ({ children, value, activeTab, onTabChange, className = '' }: TabsTriggerProps) => {
  const isActive = activeTab === value

  return (
    <button
      className={`
        flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 tabs-trigger
        ${isActive ? 'active' : ''}
        ${className}
      `}
      style={{
        flex: 1,
        padding: '0.5rem 0.75rem',
        fontSize: '0.875rem',
        fontWeight: 500,
        borderRadius: '0.375rem',
        transition: 'background-color 0.2s, color 0.2s, box-shadow 0.2s',
        border: 'none',
        cursor: 'pointer',
        background: isActive ? 'white' : 'transparent',
        boxShadow: isActive ? '0 2px 4px rgba(0, 0, 0, 0.05)' : 'none',
        color: isActive ? '#2563eb' : '#64748b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
      }}
      onClick={() => onTabChange(value)}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'white'
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
          e.currentTarget.style.color = '#111827'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'none'
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.color = '#4b5563'
        }
      }}
    >
      {children}
    </button>
  )
}

export const TabsContent = ({ children, value, activeTab, className = '' }: TabsContentProps) => {
  if (activeTab !== value) return null

  return (
    <div className={`tab-content ${className}`} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  )
}
