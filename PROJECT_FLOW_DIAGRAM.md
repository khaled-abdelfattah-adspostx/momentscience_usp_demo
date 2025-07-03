# MomentScience USP Demo - Complete Flow Diagram

## Application Flow Overview

```mermaid
flowchart TD
    A[User Visits Application] --> B[Enter Credentials]
    B --> C{Use Demo Mode?}
    C -->|Yes| D[Auto-fill Demo Credentials]
    C -->|No| E[Enter API Key & Publisher ID]
    
    D --> F[Validate Credentials]
    E --> F
    F --> G{Credentials Valid?}
    G -->|No| H[Show Error Message]
    G -->|Yes| I[Save Session Data]
    H --> B
    
    I --> J[Load Offers Page]
    J --> K[Fetch Available Offers]
    K --> L{Offers Retrieved?}
    L -->|No| M[Show Error & Retry]
    L -->|Yes| N[Display Offers Grid]
    M --> K
    
    N --> O{Check USP All Offers Setting}
    O -->|Enabled| P[Auto-select All Offers]
    O -->|Disabled| Q[Show Unselected Offers]
    
    P --> R[Update Selection State]
    Q --> R
    R --> S[User Review & Interaction]
    
    S --> T{User Action}
    T -->|Select Individual Offer| U[Toggle Offer Selection]
    T -->|Select All Offers| V[Bulk Select All]
    T -->|Deselect All Offers| W[Bulk Deselect All]
    T -->|View Session Details| X[Show Technical Info]
    T -->|Proceed to Payment| Y[Initiate Checkout]
    
    U --> Z[Update Selection State]
    V --> Z
    W --> Z
    Z --> S
    X --> S
    
    Y --> AA{Any Offers Selected?}
    AA -->|No| AB[Show Selection Required]
    AA -->|Yes| AC[Process Payment]
    AB --> S
    
    AC --> AD[Simulate Payment Processing]
    AD --> AE[Call Wrap Session API]
    AE --> AF{Wrap Session Success?}
    AF -->|No| AG[Show Payment Error]
    AF -->|Yes| AH[Navigate to Confirmation]
    AG --> S
    
    AH --> AI[Display Order Summary]
    AI --> AJ[Show Success Message]
    AJ --> AK{View Technical Details?}
    AK -->|Yes| AL[Show API Logs & Webhook Info]
    AK -->|No| AM[Basic Confirmation View]
    
    AL --> AN[Display Request/Response Data]
    AN --> AO[Show Webhook Payload]
    AO --> AP[Provide Copy Functions]
    
    AM --> AQ[Start New Session Option]
    AP --> AQ
    AQ --> A
    
    style A fill:#e3f2fd
    style B fill:#f3e5f5
    style N fill:#e8f5e8
    style O fill:#fff3e0
    style P fill:#ffebee
    style AC fill:#f1f8e9
    style AI fill:#fce4ec
```

## API Integration Flow

```mermaid
sequenceDiagram
    participant U as User
    participant HP as HomePage
    participant SP as SelectPerksPage
    participant API as MomentScience API
    participant TP as ThankYouPage
    participant WH as Webhook Endpoint

    U->>HP: Enter credentials
    HP->>HP: Validate form
    HP->>SP: Navigate with session data
    SP->>API: POST /native/v2/offers.json
    API-->>SP: Return offers + session_id
    SP->>SP: Auto-select all offers
    
    loop User Interactions
        U->>SP: Select/Unselect offers
        SP->>API: POST /usp/{sessionId}/{campaignId}/{action}.json
        API-->>SP: Confirm selection
    end
    
    U->>SP: Click Secure Payment
    SP->>SP: Simulate payment processing
    SP->>API: POST /usp/session/{sessionId}.json (wrap)
    API-->>SP: Wrap session response
    SP->>TP: Navigate with results
    TP->>TP: Display order summary
    TP->>TP: Show technical details
    
    Note over API,WH: After wrap session, webhook is sent
    API->>WH: POST webhook payload with selected offers
```

## Component Architecture

```mermaid
graph LR
    A[App.tsx] --> B[HomePage]
    A --> C[SelectPerksPage]
    A --> D[ThankYouPage]
    
    C --> E[EmbeddedSidebar]
    C --> F[SidebarToggleButton]
    C --> G[Tabs Component]
    C --> H[LogComponents]
    
    E --> I[SessionDetails]
    E --> J[LogEntry]
    H --> K[EmptyState]
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
```

## State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Initial
    Initial --> LoadingCredentials: User enters homepage
    LoadingCredentials --> ValidCredentials: Form validation passes
    LoadingCredentials --> InvalidCredentials: Form validation fails
    InvalidCredentials --> LoadingCredentials: User corrects input
    
    ValidCredentials --> FetchingOffers: Navigate to SelectPerks
    FetchingOffers --> OffersLoaded: API success
    FetchingOffers --> OffersError: API error
    OffersError --> FetchingOffers: Retry
    
    OffersLoaded --> AutoSelecting: Auto-select enabled
    OffersLoaded --> UserInteraction: Auto-select disabled
    AutoSelecting --> UserInteraction: Auto-select complete
    
    UserInteraction --> SelectingOffer: User clicks offer
    UserInteraction --> BulkSelection: User clicks bulk action
    UserInteraction --> PaymentProcessing: User clicks payment
    UserInteraction --> ViewingDetails: User requests session details
    
    SelectingOffer --> UserInteraction: Selection complete
    BulkSelection --> UserInteraction: Bulk action complete
    ViewingDetails --> UserInteraction: Details loaded
    
    PaymentProcessing --> WrappingSession: Payment simulation complete
    WrappingSession --> PaymentSuccess: Wrap session success
    WrappingSession --> PaymentError: Wrap session error
    PaymentError --> UserInteraction: Show error
    
    PaymentSuccess --> ThankYouDisplay: Navigate to thank you
    ThankYouDisplay --> [*]: Start new session
```

## Technical Integration Details

```mermaid
flowchart LR
    A[Payment Button Click] --> B[Set Payment Processing State]
    B --> C[Show Technical Sidebar]
    C --> D[Switch to API Logs Tab]
    D --> E[Simulate Payment Delay]
    E --> F[Execute Wrap Session API]
    
    F --> G[Create Webhook Payload]
    G --> H[Generate Field Descriptions]
    H --> I[Store API Request Details]
    I --> J[Store API Response Data]
    J --> K[Store cURL Commands]
    K --> L[Navigate to Thank You Page]
    
    L --> M[Display Order Summary]
    M --> N[Show Process Flow]
    N --> O[Display API Details]
    O --> P[Show Webhook Structure]
    P --> Q[Provide Copy Functionality]
    Q --> R[Show Field Documentation]
```

## Error Handling Flow

```mermaid
flowchart TD
    A[API Call] --> B{Success?}
    B -->|Yes| C[Update UI State]
    B -->|No| D[Catch Error]
    D --> E[Log Error Details]
    E --> F[Update Error State]
    F --> G[Show Error UI]
    G --> H[Provide Retry Option]
    H --> I{User Retries?}
    I -->|Yes| A
    I -->|No| J[Stay on Error State]
    
    C --> K[Add to Logs]
    K --> L[Update Technical Sidebar]
```

## Data Flow Structure

```mermaid
graph TD
    A[Session Data] --> B[API Key]
    A --> C[Publisher User ID]
    A --> D[Demo Mode Flag]
    
    E[Offers Response] --> F[Offers Array]
    E --> G[Session ID]
    E --> H[Settings Object]
    
    I[Selection State] --> J[Selected Offers Set]
    I --> K[Selection Logs Array]
    I --> L[Session Details Logs]
    
    M[Payment State] --> N[Processing Flag]
    M --> O[Wrap Session Request]
    M --> P[Wrap Session Response]
    M --> Q[Webhook Payload]
    M --> R[Field Descriptions]
```

## Key Features Overview

### Authentication & Session Management
- Demo credential auto-fill
- Form validation with error handling
- Session data persistence in localStorage
- Secure API key management

### Offer Management
- Dynamic offer fetching from API
- Auto-selection capability
- Individual and bulk selection
- Real-time selection state updates

### Technical Integration
- Comprehensive API logging
- Request/response tracking
- cURL command generation
- Error handling and retry mechanisms

### Payment Processing
- Simulated payment flow
- Wrap session API integration
- Webhook payload generation
- Technical details documentation

### Developer Experience
- Embedded technical sidebar
- Real-time API monitoring
- Copy-to-clipboard functionality
- Detailed field documentation
