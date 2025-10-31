# Express TypeScript Starter API

A production-ready Express.js REST API with TypeScript, MongoDB, Redis, and comprehensive authentication.

## Features

- **TypeScript** - Full type safety with strict mode
- **Authentication** - JWT-based auth with access & refresh tokens
- **Email Verification** - Verify user emails with secure tokens
- **Password Reset** - Secure password reset flow
- **Account Management** - User deletion, admin lock/unlock
- **Security** - Rate limiting, Helmet, CORS, NoSQL injection protection
- **Caching** - Redis for sessions and token blacklisting
- **Testing** - Jest with Supertest for comprehensive test coverage
- **API Docs** - Interactive Swagger UI documentation
- **Docker** - Development and production Docker configurations

## Tech Stack

- Node.js + Express.js + TypeScript
- MongoDB + Mongoose
- Redis
- JWT Authentication
- Winston Logging
- Jest Testing
- Swagger/OpenAPI

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- MongoDB
- Redis

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/express-starter
cd express-starter

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start development server
npm run dev
```

API will be available at `http://localhost:8080`

Swagger docs at `http://localhost:8080/api-docs`

### Docker Development

```bash
# Start all services (MongoDB, Redis, App)
npm run docker:dev

# Or start only databases
npm run docker:up
npm run dev
```

## Environment Variables

```env
# Database
BACK_MONGODB_URI=mongodb://localhost:27017
BACK_MONGODB_NAME=your_db_name

# Authentication (min 32 characters)
BACK_SECRET=your-super-secret-jwt-key-min-32-chars

# Email (for verification & password reset)
BACK_EmailUser=your-email@gmail.com
BACK_EmailPass=your-app-password

# Frontend URL (for email links)
FRONT_URL=http://localhost:3000

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Optional
BACK_PORT=8080
NODE_ENV=development
```

## API Endpoints

### Authentication
```
POST   /auth/register              - Register new user
POST   /auth/login                 - Login user
POST   /auth/refresh               - Refresh access token
POST   /auth/logout                - Logout and blacklist tokens
GET    /auth/                      - Get current user
```

### Email Verification
```
POST   /auth/verify-email          - Verify email with token
POST   /auth/resend-verification   - Resend verification email
```

### Password Reset
```
POST   /auth/forgot-password       - Request password reset
POST   /auth/verify-reset-token    - Verify reset token
POST   /auth/reset-password        - Reset password
```

### Account Management
```
DELETE /auth/account               - Delete own account
GET    /auth/account/status        - Get account status
POST   /auth/admin/lock-account    - Lock user account (admin)
POST   /auth/admin/unlock-account  - Unlock user account (admin)
```

### Health Checks
```
GET    /health                     - Overall health status
GET    /health/ready               - Readiness probe
GET    /health/live                - Liveness probe
```

## Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm start                # Start production server

# Testing
npm test                 # Run all tests
npm run seed             # Seed database

# Docker
npm run docker:dev       # Start all services in Docker
npm run docker:up        # Start MongoDB & Redis only
npm run docker:down      # Stop all services

# Documentation
npm run swagger          # Generate API docs
npm run doc              # Generate TypeDoc
```

## Security Features

### Password Requirements
- Minimum 8 characters
- Uppercase, lowercase, number, and special character required

### Rate Limiting
- Auth endpoints: 5 requests per 15 minutes
- Token refresh: 10 requests per hour
- General API: 100 requests per 15 minutes

### JWT Security
- Access tokens: 15 minutes expiry
- Refresh tokens: 7 days expiry
- Token blacklisting on logout
- Secure httpOnly cookies

### Account Security
- Email verification required
- Password reset with expiring tokens
- Account lockout for suspicious activity
- Soft delete for user accounts

## Project Structure

```
src/
├── config/          # Configuration and environment
├── controller/      # Request handlers
├── db/              # Database models and seeds
├── middleware/      # Express middleware
├── routes/          # API routes
├── services/        # Business logic
├── test/            # Test files
├── types/           # TypeScript definitions
├── utils/           # Utility functions
└── app.ts           # Express app setup
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- accountManagement.test.ts
```

Tests include comprehensive coverage for:
- Authentication flow
- Email verification
- Password reset
- Account management (deletion, locking)

## Production Deployment

### Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure strong `BACK_SECRET` (min 32 chars)
- [ ] Set up production MongoDB with authentication
- [ ] Configure Redis with password
- [ ] Set allowed CORS origins
- [ ] Enable HTTPS
- [ ] Configure monitoring and logging
- [ ] Set up database backups

### Docker Production

```bash
# Build production image
docker build -t express-api:latest .

# Run container
docker run -d \
  -p 8080:8080 \
  -e NODE_ENV=production \
  -e BACK_MONGODB_URI=mongodb://your-host:27017 \
  -e BACK_SECRET=your-production-secret \
  express-api:latest
```

## License

ISC

## Author

Badla Moussaab

