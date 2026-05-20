# Citizen Engagement Platform

A comprehensive government civic engagement platform built with Next.js 16, MongoDB, and React. This application enables citizen registration, ID card generation with QR codes, and community-driven question management.

## Features

### 🎫 Citizen Registration & ID Cards
- Simple registration form with Name, Email (10-digit phone), and Department
- Automatic ID generation in GOV-YYYY-XXXX format
- Professional digital ID cards with QR codes
- Batch PDF export of all ID cards

### 💬 Community Questions
- Public question submission and voting system
- Questions sorted by popularity (vote count)
- Vote tracking to prevent duplicate votes (localStorage)
- Real-time vote counting

### 🛡️ Admin Dashboard
- Secure admin authentication with session management
- User management with search and pagination
- Question monitoring and statistics
- Protected admin routes

### 📱 Responsive Design
- Mobile-first design approach
- Works seamlessly on all devices
- Government-style clean aesthetic
- Light theme with blue accents

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Form Handling**: React Hook Form, Zod validation
- **UI Components**: shadcn/ui
- **QR Codes**: qrcode.react
- **PDF Export**: html2pdf.js
- **Toasts**: Sonner

## Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm
- MongoDB instance (Atlas or self-hosted)

### Installation

1. **Clone and setup the project:**
```bash
git clone <repository-url>
cd citizen-engagement
pnpm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mydb

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Session Secret (use a strong random string)
SESSION_TOKEN_SECRET=your-random-secret-key
```

3. **Run the development server:**
```bash
pnpm dev
```

4. **Open in browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Public Pages

- **Home** (`/`): Landing page with feature overview and navigation
- **Register** (`/register`): Citizen registration form
- **Questions** (`/questions`): Public question listing and submission
- **ID Cards** (`/id-cards`): View citizen ID cards and export to PDF

### Admin Pages

- **Admin Login** (`/admin/login`): Secure admin authentication
  - Default credentials: `admin` / `admin123`
- **Admin Dashboard** (`/admin/dashboard`): User and question management

## API Routes

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/check` - Check authentication status

### Users
- `POST /api/register` - Register new citizen
- `GET /api/users` - Get users with pagination and search

### Questions
- `GET /api/questions` - Get all questions sorted by votes
- `POST /api/questions` - Create new question
- `POST /api/questions/[id]/increment` - Increment question vote count

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  userId: "GOV-2024-1234",
  name: "John Doe",
  email: "john@example.com",
  phone: "5551234567",
  department: "Public Works",
  createdAt: Date
}
```

### Questions Collection
```javascript
{
  _id: ObjectId,
  text: "How can we improve public transportation?",
  count: 15,
  createdAt: Date,
  replies: []
}
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `ADMIN_USERNAME` | Admin login username | `admin` |
| `ADMIN_PASSWORD` | Admin login password | `securepassword123` |
| `SESSION_TOKEN_SECRET` | Secret for session signing | `random-32-char-string` |

## Development

### Project Structure
```
├── app/
│   ├── api/              # API routes
│   ├── admin/            # Admin pages
│   ├── register/         # Registration page
│   ├── questions/        # Questions page
│   ├── id-cards/         # ID cards page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # shadcn/ui components
│   └── id-card.tsx       # ID card component
├── lib/
│   ├── db.ts             # MongoDB connection
│   └── auth.ts           # Admin auth utilities
└── public/               # Static assets
```

### Styling

The application uses Tailwind CSS with a custom color scheme optimized for government applications:
- **Primary**: Blue (#2563eb) for actions and highlights
- **Background**: Off-white (#fafafa) for clean appearance
- **Text**: Dark gray for readability

Colors can be customized in `app/globals.css` using CSS variables.

## Security Notes

### Important for Production

1. **Change Default Credentials**: Update ADMIN_USERNAME and ADMIN_PASSWORD
2. **Use Strong Session Secret**: Generate a secure random string for SESSION_TOKEN_SECRET
3. **Enable HTTPS**: Set secure cookie flag in production
4. **Validate Input**: All inputs are validated with Zod schemas
5. **Rate Limiting**: Consider adding rate limiting for API routes
6. **CORS**: Adjust CORS policies as needed for your deployment

## Troubleshooting

### MongoDB Connection Issues
- Verify MONGODB_URI is correct
- Check if IP whitelist includes your server
- Ensure network connectivity to MongoDB instance

### Admin Login Not Working
- Verify ADMIN_USERNAME and ADMIN_PASSWORD in .env.local
- Clear browser cookies and try again
- Check browser console for error messages

### PDF Export Fails
- Ensure html2pdf.js is properly installed
- Check browser console for JavaScript errors
- Verify sufficient browser memory for large exports

## Deployment

### Deploy to Vercel

1. Push code to GitHub repository
2. Connect repository in Vercel dashboard
3. Add environment variables in Vercel settings
4. Deploy - Vercel will build and deploy automatically

### Deploy to Other Platforms

Ensure your hosting platform supports:
- Node.js 18+
- Environment variable configuration
- Outbound connections to MongoDB

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or contributions, please open an issue in the repository.
