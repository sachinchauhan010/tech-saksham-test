# Tech Saksham - Complete Functionality Documentation

## Overview

Tech Saksham is a comprehensive event management and citizen engagement platform built with Next.js 16, React 19, TypeScript, and MongoDB. The platform facilitates event registration, management, Q&A sessions, and digital ID generation with QR codes.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **State Management**: Redux Toolkit
- **UI Components**: shadcn/ui (Radix UI based)
- **Authentication**: JWT tokens with refresh mechanism
- **Form Handling**: React Hook Form
- **PDF Generation**: jsPDF, html-to-image
- **QR Code Generation**: qrcode, qrcode.react
- **Notifications**: Sonner, React Toastify
- **Email Service**: Nodemailer
- **OTP Service**: Custom implementation

### Project Structure
```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (35 endpoints)
│   ├── admin/             # Admin dashboard pages (15 pages)
│   ├── event/             # Event-related pages
│   ├── questions/         # Q&A system pages
│   └── auth/              # Authentication pages
├── components/            # React components (84 components)
│   ├── ui/               # shadcn/ui components
│   ├── admin/            # Admin-specific components
│   ├── event/            # Event components
│   ├── questions/        # Q&A components
│   └── home/             # Landing page components
├── lib/                  # Utility libraries
│   ├── models/          # Mongoose models
│   ├── auth.ts          # Authentication utilities
│   ├── db.ts            # Database connection
│   └── validations.ts   # Form validation schemas
├── types/               # TypeScript type definitions
├── redux/               # Redux store configuration
└── hooks/               # Custom React hooks
```

## 🎯 Core Features

### 1. User Management System

#### User Roles & Permissions
- **USER**: Regular event participants
- **ADMIN**: Event managers with full access
- **SUPER_ADMIN**: System administrators
- **ORGANIZER**: Event organizers
- **DELEGATE**: Event delegates
- **GUEST**: Temporary access users

#### Role-Based Work & Features

##### SUPER_ADMIN
**Primary Responsibilities:**
- System configuration and maintenance
- Global user management across all roles
- Platform-wide analytics and reporting
- Security and compliance monitoring
- Database management and backups
- Third-party integrations configuration

**Access & Permissions:**
- Full system access to all modules and features
- Create, modify, delete any user account
- Access to system logs and audit trails
- Configure platform-wide settings and policies
- Manage authentication and authorization rules
- Override any user restrictions or permissions

**Dashboard Features:**
- System health monitoring and alerts
- User activity analytics across all roles
- Event performance metrics and trends
- Security incident monitoring and response
- Resource utilization and performance metrics
- Integration status and third-party service health

**Key Workflows:**
- User role assignment and permission management
- System backup and recovery procedures
- Security audit and compliance reporting
- Platform scaling and performance optimization
- Emergency response and system recovery

##### ADMIN
**Primary Responsibilities:**
- Event creation, management, and moderation
- User management for participants and delegates
- Certificate and ID card issuance
- Q&A moderation and content management
- Event analytics and reporting
- Speaker and session management

**Access & Permissions:**
- Full CRUD operations on events
- Manage USER, DELEGATE, and GUEST accounts
- Issue certificates and ID cards
- Moderate Q&A content and user interactions
- Access event analytics and participant data
- Configure event-specific settings

**Dashboard Features:**
- Event creation wizard and management interface
- User registration analytics and demographics
- Q&A engagement metrics and moderation tools
- Certificate issuance tracking and templates
- Event performance dashboards and reports
- Speaker and session scheduling tools

**Key Workflows:**
- Event lifecycle management (Draft → Published → Ongoing → Completed)
- User registration approval and management
- Certificate template customization and bulk issuance
- Q&A moderation and content approval
- Event analytics generation and distribution

##### ORGANIZER
**Primary Responsibilities:**
- Create and manage assigned events
- Coordinate speakers and sessions
- Manage event participants and registrations
- Handle event logistics and scheduling
- Generate event-specific reports
- Communicate with participants

**Access & Permissions:**
- Create and edit own events only
- Manage speakers and sessions for assigned events
- View and manage event participants
- Generate event-specific certificates and IDs
- Access event analytics and participant data
- Communicate with registered participants

**Dashboard Features:**
- Event creation and management interface
- Speaker and session scheduling tools
- Participant management and communication
- Event-specific analytics and reporting
- Resource allocation and logistics management
- Timeline and milestone tracking

**Key Workflows:**
- Event planning and execution coordination
- Speaker management and session scheduling
- Participant communication and engagement
- Event logistics and resource management
- Post-event analysis and reporting

##### DELEGATE
**Primary Responsibilities:**
- Participate in assigned events
- Engage in Q&A sessions and discussions
- Download certificates and ID cards
- Provide feedback and ratings
- Network with other participants
- Access event resources and materials

**Access & Permissions:**
- Register for available events
- Participate in event Q&A sessions
- Download personal certificates and ID cards
- View event schedules and resources
- Submit questions and vote in polls
- Access personal event history

**Dashboard Features:**
- Personal event calendar and schedule
- Q&A participation interface with voting
- Certificate and ID card download center
- Event resource library and materials
- Personal profile and achievement tracking
- Communication and messaging center

**Key Workflows:**
- Event registration and confirmation
- Active participation in Q&A sessions
- Certificate and ID card collection
- Feedback submission and ratings
- Networking and collaboration activities

##### GUEST
**Primary Responsibilities:**
- Limited access to specific events
- View event information and schedules
- Basic participation in selected activities
- Temporary ID card access
- Limited Q&A viewing capabilities

**Access & Permissions:**
- View assigned event details only
- Limited Q&A viewing (no participation)
- Download temporary ID cards only
- Access basic event information
- No certificate access or issuance
- Time-limited access based on event duration

**Dashboard Features:**
- Event information viewer
- Basic schedule and agenda access
- Temporary ID card download
- Limited resource access
- Event contact information
- Basic help and support access

**Key Workflows:**
- Event information browsing
- Temporary access verification
- Limited participation in event activities
- ID card collection for event access
- Basic support and assistance requests

##### USER
**Primary Responsibilities:**
- Browse and register for public events
- Participate actively in Q&A sessions
- Manage personal profile and preferences
- Download certificates and ID cards
- Provide event feedback and ratings
- Engage with event community

**Access & Permissions:**
- Browse and register for public events
- Full participation in Q&A with voting
- Download personal certificates and ID cards
- Manage personal profile and settings
- Submit questions and engage in discussions
- Access event resources and materials

**Dashboard Features:**
- Event discovery and registration interface
- Personal event calendar and reminders
- Q&A participation with real-time updates
- Certificate and ID card management
- Personal profile and achievement tracking
- Event history and participation records

**Key Workflows:**
- Event discovery and registration process
- Active Q&A participation and engagement
- Certificate and ID card collection
- Profile management and preference settings
- Feedback submission and community engagement

#### User Registration & Authentication
- **Multi-step Registration**:
  - Basic information (name, email, phone, department)
  - OTP verification (email/SMS)
  - Password setup
  - Auto-generated User ID format: `GOV-YYYY-XXXX`

- **Authentication Features**:
  - JWT-based authentication with refresh tokens
  - Session management with secure cookies
  - Password reset via OTP
  - QR code login support
  - Remember me functionality

#### User Profile Management
- Profile viewing and editing
- Event application history
- Certificate management
- ID card generation

### 2. Event Management System

#### Event Creation & Management
- **Event Details**:
  - Title, description, short description
  - Category (conference, workshop, seminar, social)
  - Format (in-person, virtual, hybrid)
  - Banner image and gallery
  - Event dates and registration periods
  - Location details or virtual links
  - Sessions with speakers and schedules
  - Tags and featured status

- **Event Status Workflow**:
  - Draft → Published → Ongoing → Completed/Cancelled
  - Status-based access control
  - Automated status transitions

#### Event Registration
- **Application Process**:
  - Event browsing with filtering
  - One-click event application
  - Application confirmation dialogs
  - Application removal functionality
  - Registration deadline management

- **Registration Features**:
  - Real-time availability checking
  - Duplicate prevention
  - Event capacity management
  - Registration confirmation emails

#### Event Sessions
- **Session Management**:
  - Multiple sessions per event
  - Speaker profiles and bios
  - Room/venue assignments
  - Time scheduling
  - Virtual meeting links
  - Session tags and tracks

### 3. Q&A System

#### Live Questions Platform
- **Question Submission**:
  - Real-time question posting
  - Character limits (10-200 chars)
  - Question editing capabilities
  - Status management (active, answered, removed)

- **Voting System**:
  - Upvote/downvote functionality
  - Vote tracking per user
  - Anti-duplicate voting (localStorage + server validation)
  - Real-time vote counting
  - Vote count validation (minimum 0)

- **Question Management**:
  - Sort by popularity and time
  - Question filtering by status
  - Admin moderation capabilities
  - Bulk question management

#### Q&A Features
- **Live Updates**: Auto-refresh every 5 seconds
- **Access Control**: Event-specific Q&A access
- **User Authentication**: Required for participation
- **Question Analytics**: Vote statistics and trends

### 4. Digital ID System

#### ID Card Generation
- **ID Types**:
  - Guest ID Cards
  - Organizer ID Cards
  - Delegate ID Cards

- **ID Features**:
  - Professional design with organization branding
  - QR code integration for verification
  - User photo integration
  - Event-specific details
  - Batch PDF generation
  - Individual ID download

#### QR Code System
- **QR Code Types**:
  - User verification QR codes
  - Event check-in QR codes
  - Certificate verification QR codes

- **QR Features**:
  - Secure token-based verification
  - Expiration management
  - Mobile scanning support
  - Offline verification capability

### 5. Certificate System

#### Certificate Management
- **Certificate Types**:
  - Event participation certificates
  - Achievement certificates
  - Organizational certificates

- **Certificate Features**:
  - Template customization
  - Digital signatures
  - QR code verification
  - PDF generation
  - Email delivery
  - Certificate tracking

#### Certificate Settings
- **Admin Configuration**:
  - Template selection
  - Signature management
  - Issuing authority setup
  - Automated issuance rules

### 6. Admin Dashboard

#### Dashboard Overview
- **Analytics & Statistics**:
  - User registration metrics
  - Event participation data
  - Q&A engagement statistics
  - System performance metrics

- **Quick Actions**:
  - Event creation shortcuts
  - User management links
  - System status indicators

#### User Management
- **User Operations**:
  - User search and filtering
  - Role assignment and modification
  - User status management
  - Bulk user operations
  - User analytics and reports

#### Event Management
- **Event Operations**:
  - CRUD operations for events
  - Event status management
  - Session scheduling
  - Speaker management
  - Event analytics

#### Content Moderation
- **Q&A Moderation**:
  - Question review and approval
  - Inappropriate content filtering
  - User reporting management
  - Bulk content operations

## 🔐 Security Features

### Authentication Security
- **JWT Implementation**:
  - Access tokens (15-minute expiry)
  - Refresh tokens (7-day expiry)
  - Secure token storage
  - Token rotation on refresh

- **Password Security**:
  - bcrypt password hashing
  - Minimum password requirements
  - Password reset via OTP
  - Rate limiting on auth attempts

### Data Protection
- **Input Validation**:
  - Zod schema validation
  - XSS prevention
  - SQL injection prevention
  - File upload security

- **Access Control**:
  - Role-based permissions
  - Route protection middleware
  - API endpoint authentication
  - Resource-level access control

### Session Security
- **Session Management**:
  - Secure cookie configuration
  - Session timeout handling
  - Concurrent session limits
  - Logout from all devices

## 📱 User Interface Features

### Responsive Design
- **Mobile-First Approach**:
  - Optimized for all screen sizes
  - Touch-friendly interactions
  - Progressive enhancement
  - Offline capability support

### Component System
- **shadcn/ui Integration**:
  - 50+ reusable components
  - Consistent design system
  - Accessibility compliance
  - Theme customization

### User Experience
- **Interactive Elements**:
  - Smooth animations and transitions
  - Loading states and skeletons
  - Error boundary handling
  - Toast notifications
  - Confirmation dialogs

## 🔄 API Architecture

### API Endpoints (35 total)

#### Authentication APIs (8 endpoints)
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `POST /api/register` - User registration
- `POST /api/forgot-password` - Password reset request
- `POST /api/reset-password` - Password reset confirmation
- `POST /api/send-otp` - OTP generation
- `POST /api/verify-otp` - OTP verification
- `POST /api/qr-login` - QR code login

#### Admin APIs (13 endpoints)
- `POST /api/admin/login` - Admin authentication
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/check` - Admin session validation
- `GET /api/admin/users` - User management
- `POST /api/admin/register` - Admin registration
- `GET /api/admin/manage-event` - Event listing
- `POST /api/admin/manage-event` - Event creation
- `PUT /api/admin/manage-event/[id]` - Event update
- `DELETE /api/admin/manage-event/[id]` - Event deletion
- `GET /api/admin/manage-admin` - Admin management
- `POST /api/admin/manage-admin` - Admin creation
- `PUT /api/admin/manage-admin/[adminId]` - Admin update
- `DELETE /api/admin/manage-admin/[adminId]` - Admin deletion

#### Event APIs (3 endpoints)
- `GET /api/event` - Event listing
- `GET /api/event/[id]` - Event details
- `POST /api/event/[id]/apply` - Event application
- `DELETE /api/event/[id]/apply` - Application removal

#### Q&A APIs (5 endpoints)
- `GET /api/delegate/questions` - Question listing
- `POST /api/delegate/questions` - Question creation
- `POST /api/delegate/questions/[id]/increment` - Vote increment
- `PUT /api/delegate/questions/[id]/increment` - Vote decrement
- `PUT /api/delegate/questions/[id]/edit` - Question editing
- `DELETE /api/delegate/questions/[id]` - Question deletion
- `PUT /api/delegate/questions/[id]/status` - Status management

#### Utility APIs (6 endpoints)
- `GET /api/auth/me` - Current user info
- `POST /api/auth/refresh` - Token refresh
- `GET /api/auth/user-info` - User profile
- `POST /api/upload` - File upload
- `POST /api/qr/generate` - QR code generation
- `GET /api/users` - User listing

### API Features
- **RESTful Design**: Standard HTTP methods and status codes
- **Error Handling**: Consistent error responses
- **Validation**: Request/response validation
- **Rate Limiting**: API protection
- **CORS**: Cross-origin resource sharing
- **Logging**: Request/response logging

## 🗄️ Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  userId: "GOV-2024-1234",           // Auto-generated unique ID
  name: "John Doe",
  email: "john@example.com",
  phone: "1234567890",
  department: "Information Technology",
  password: "hashed_password",
  role: "user|admin|super_admin|organizer|delegate|guest",
  eventApplied: [{                   // For regular users
    eventCode: "EVT785",
    appliedDate: Date
  }],
  managedEvents: [{                  // For admin users
    eventCode: "EVT785",
    title: "Tech Conference 2024"
  }],
  createdAt: Date
}
```

### Event Collection
```javascript
{
  _id: ObjectId,
  eventCode: "EVT785",               // Unique event identifier
  title: "Tech Conference 2024",
  slug: "tech-conference-2024",
  description: "Full event description...",
  shortDescription: "Brief overview...",
  category: "conference|workshop|seminar|social",
  bannerImage: "https://...",
  gallery: ["https://...", ...],
  startDate: Date,
  endDate: Date,
  registrationOpenDate: Date,
  registrationCloseDate: Date,
  format: "in-person|virtual|hybrid",
  location: {
    venueName: "Convention Center",
    address: "123 Main St",
    city: "New York",
    mapLink: "https://maps.google.com/..."
  },
  virtualLink: "https://zoom.us/...",
  organizer: [ObjectId],             // Reference to User collection
  sessions: [{
    title: "Opening Keynote",
    description: "Session description...",
    startTime: Date,
    endTime: Date,
    location: {
      room: "Main Hall",
      venue: "Convention Center"
    },
    speakers: [{
      name: "Dr. Jane Smith",
      bio: "Speaker bio...",
      photo: "https://..."
    }],
    tags: ["keynote", "ai", "future"]
  }],
  status: "draft|published|ongoing|completed|cancelled",
  tags: ["technology", "innovation", "networking"],
  isFeatured: true,
  idcard: "guest|organizer|delegate",
  createdAt: Date,
  updatedAt: Date
}
```

### Question Collection
```javascript
{
  _id: ObjectId,
  eventId: ObjectId,                 // Reference to Event
  userId: ObjectId,                 // Reference to User
  text: "What is the future of AI?",
  upVotes: 15,
  createdAt: Date,
  status: "active|answered|removed|pending",
  replies: ["Reply text..."]
}
```

### Certificate Settings Collection
```javascript
{
  _id: ObjectId,
  templateName: "Participation Certificate",
  templateContent: "HTML template...",
  signatureData: {
    name: "Director",
    title: "Tech Saksham",
    signatureImage: "base64_image"
  },
  issuingAuthority: "Tech Saksham Organization",
  validityPeriod: "lifetime",
  createdAt: Date
}
```

## 🎨 UI/UX Features

### Design System
- **Color Palette**:
  - Primary: Blue (#2563eb)
  - Secondary: Purple (#7c3aed)
  - Success: Green (#10b981)
  - Warning: Orange (#f59e0b)
  - Error: Red (#ef4444)
  - Neutral: Gray shades (#f8fafc to #1e293b)

- **Typography**:
  - Font Family: Inter (system-ui fallback)
  - Headings: Bold weights (600-800)
  - Body: Regular weights (400-500)
  - Responsive sizing (rem units)

### Component Features
- **Interactive Elements**:
  - Hover states and transitions
  - Loading animations
  - Skeleton screens
  - Progress indicators
  - Tooltips and popovers

- **Form Components**:
  - Real-time validation
  - Error messaging
  - Accessibility labels
  - Keyboard navigation
  - Mobile optimization

### Layout Features
- **Responsive Grid**:
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3-4 columns
  - Large screens: Max-width containers

- **Navigation**:
  - Sticky headers
  - Breadcrumb navigation
  - Sidebar navigation (admin)
  - Mobile hamburger menu

## 📊 Analytics & Reporting

### User Analytics
- Registration metrics
- User engagement statistics
- Role distribution
- Activity timelines

### Event Analytics
- Event participation rates
- Registration trends
- Popular event categories
- Attendance patterns

### Q&A Analytics
- Question submission rates
- Voting patterns
- Engagement metrics
- Popular topics

### System Analytics
- API usage statistics
- Error rate monitoring
- Performance metrics
- User session data

## 🔧 Configuration & Settings

### Environment Variables
```env
# Database
MONGODB_URI=mongodb+srv://...

# Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
SESSION_TOKEN_SECRET=your-secret-key

# Email Service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### System Configuration
- **Database Settings**:
  - Connection pooling
  - Index optimization
  - Backup strategies
  - Performance tuning

- **Security Settings**:
  - JWT token expiration
  - Rate limiting thresholds
  - CORS policies
  - SSL configuration

## 🚀 Performance Features

### Frontend Optimization
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching Strategy**: Browser and CDN caching
- **Lazy Loading**: Component and route lazy loading

### Backend Optimization
- **Database Indexing**: Optimized query performance
- **API Caching**: Redis integration potential
- **Connection Pooling**: Database connection management
- **Compression**: Gzip response compression

### Monitoring & Logging
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Response time tracking
- **User Analytics**: Behavior tracking
- **System Health**: Uptime monitoring

## 🔄 Integration Features

### Third-Party Integrations
- **Email Service**: Nodemailer with SMTP
- **SMS Service**: OTP delivery integration
- **File Storage**: Cloud storage integration
- **Payment Gateway**: Event payment processing (future)

### API Integrations
- **Google Maps**: Location services
- **Calendar APIs**: Event synchronization
- **Social Media**: Event sharing
- **Analytics**: Google Analytics integration

## 📱 Mobile Features

### Mobile Optimization
- **Responsive Design**: Mobile-first approach
- **Touch Gestures**: Swipe, tap, pinch interactions
- **Mobile Navigation**: Bottom navigation, hamburger menu
- **Performance**: Optimized for mobile networks

### Progressive Web App
- **Service Worker**: Offline functionality
- **Web App Manifest**: Installable PWA
- **Push Notifications**: Event reminders
- **Background Sync**: Data synchronization

## 🔒 Compliance & Standards

### Data Protection
- **GDPR Compliance**: User data protection
- **Data Retention**: Automatic cleanup policies
- **Privacy Policy**: Transparent data usage
- **Cookie Consent**: User consent management

### Accessibility
- **WCAG 2.1**: Level AA compliance
- **Screen Reader**: Semantic HTML structure
- **Keyboard Navigation**: Full keyboard access
- **Color Contrast**: Accessibility standards

### Security Standards
- **OWASP Guidelines**: Security best practices
- **HTTPS Enforcement**: Secure communication
- **Input Validation**: Comprehensive validation
- **Security Headers**: HTTP security headers

## 🎯 Future Enhancements

### Planned Features
- **Mobile Apps**: Native iOS/Android applications
- **Video Streaming**: Live event streaming
- **AI Integration**: Smart recommendations
- **Blockchain**: Certificate verification
- **IoT Integration**: Check-in kiosks

### Scalability Plans
- **Microservices**: Service decomposition
- **Load Balancing**: Traffic distribution
- **CDN Integration**: Global content delivery
- **Database Sharding**: Horizontal scaling

---

This documentation provides a comprehensive overview of all functionality available in the Tech Saksham platform. Each feature is designed to work seamlessly with others to provide a complete event management and citizen engagement solution.
