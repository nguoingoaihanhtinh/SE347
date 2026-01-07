# TaskManager - Agile/Scrum Project Management System

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6.0 or higher)
- npm or yarn

### Installation

1. **Clone and install dependencies:**

```bash
cd TaskManager
npm install
```

2. **Set up environment variables:**

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Run database migrations:**

```bash
# For fresh setup
npm run migrate:init

# For existing databases with schema updates
npm run migrate:update
```

4. **Start the development server:**

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`
API Documentation: `http://localhost:3000/api-docs`

## 📋 Database Migration

### Available Migration Commands

- **`npm run migrate:init`** - Initial database setup with all collections
- **`npm run migrate:update`** - Update existing database with new schema changes
- **`npm run migrate:run`** - Alternative runner using JavaScript

### Migration Details

The migration system handles:

- ✅ **Schema validation** for all collections
- ✅ **Index creation** for optimal performance
- ✅ **Field migrations** (renaming, type changes)
- ✅ **Data transformation** for existing records
- ✅ **Migration tracking** to prevent duplicate runs

### New Collections Added:

- **`users`** - Enhanced user model with email verification, roles, and preferences
- **`otp_tokens`** - OTP verification system for secure authentication
- **`project_invitations`** - Member invitation system with expiration

### Updated Collections:

- **`projects`** - Added description field
- **`project_columns`** - Added description, color, and issueIds fields
- **`sprints`** - Migrated dateStarted/dateEnded → startDate/endDate, added status
- **`issues`** - Migrated storyPoint → storyPoints, added labels, status defaults
- **`activities`** - Enhanced action types and validation

## 🏗️ System Architecture

### Core Features Implemented

#### 1. Authentication & User Management

- **JWT Authentication** with HTTP-only cookies
- **OTP Email Verification** for registration
- **Google SMTP** integration for email services
- **Role-based access** (user, admin, super_admin)
- **User profiles** with avatars

#### 2. Project Management

- **Project CRUD** operations with validation
- **Access control** (public/private projects)
- **Project types** (Scrum/Kanban methodologies)
- **Automatic setup** with default columns

#### 3. Team Collaboration

- **Member invitations** via email with tokens
- **Role management** (Owner → Admin → Member → Viewer)
- **Permission-based access** control
- **Team management** within projects

#### 4. Kanban Board System

- **Dynamic columns** with drag-and-drop support
- **Custom column** creation, reordering, deletion
- **Issue management** across columns
- **Visual customization** (colors, descriptions)

#### 5. Issue Tracking

- **Multi-type issues** (Task, Bug, Story, Epic)
- **Priority levels** (Low, Medium, High, Critical)
- **Status tracking** (Open, In Progress, Resolved, Closed)
- **Story points** for estimation
- **Labels/tags** for categorization
- **Due dates** and completion tracking

#### 6. Sprint Management

- **Sprint lifecycle** (Planning → Active → Completed)
- **Sprint goals** and duration tracking
- **Issue assignment** to sprints
- **Sprint statistics** and reporting

#### 7. Activity Logging

- **Comprehensive audit trails** for all actions
- **Change tracking** with old/new value comparison
- **Project-level activity** feeds
- **Issue-level activity** history

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration with OTP
- `POST /api/auth/verify-otp` - Email verification
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - Secure logout
- `GET /api/auth/me` - Current user profile

### Users

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/avatar` - Upload avatar

### Projects

- `POST /api/projects` - Create project
- `GET /api/projects` - List user projects
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/statistics` - Project statistics

### Project Members

- `POST /api/projects/:id/members/invite` - Invite member
- `GET /api/projects/:id/members` - List members
- `PUT /api/projects/:id/members/:userId/role` - Update member role
- `DELETE /api/projects/:id/members/:userId` - Remove member
- `POST /api/projects/invitations/:token/accept` - Accept invitation

### Project Columns (Kanban)

- `POST /api/projects/:id/columns` - Create column
- `GET /api/projects/:id/columns` - List columns
- `PUT /api/projects/:id/columns/:columnId` - Update column
- `DELETE /api/projects/:id/columns/:columnId` - Delete column
- `PUT /api/projects/:id/columns/reorder` - Reorder columns

### Issues

- `POST /api/projects/:id/issues` - Create issue
- `GET /api/projects/:id/issues` - List issues with filters
- `GET /api/issues/:id` - Get issue details
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue

### Sprints

- `POST /api/projects/:id/sprints` - Create sprint
- `GET /api/projects/:id/sprints` - List sprints
- `PUT /api/sprints/:id` - Update sprint
- `DELETE /api/sprints/:id` - Delete sprint

## 📊 Database Schema

### Key Collections

#### Users

```javascript
{
  email: String (unique, validated),
  fullName: String (2-100 chars),
  passwordHash: String,
  avatar: String (optional),
  role: Enum["user", "admin", "super_admin"],
  isEmailVerified: Boolean,
  bio: String (optional, max 500),
  timezone: String (optional),
  language: Enum (optional),
  notifications: Object (preferences),
  isActive: Boolean,
  lastLoginAt: Date (optional),
  deactivatedAt: Date (optional)
}
```

#### Projects

```javascript
{
  name: String,
  key: String (unique, 3-10 chars, uppercase),
  description: String (optional, max 1000),
  access: Enum["public", "private"],
  type: Enum["scrum", "kanban"],
  ownerId: ObjectId
}
```

#### Issues

```javascript
{
  title: String,
  key: String (unique per project),
  description: String (optional, max 5000),
  type: Enum["task", "story", "bug", "epic"],
  status: Enum["open", "in_progress", "resolved", "closed", "reopened"],
  priority: Enum["low", "medium", "high", "critical"],
  projectId: ObjectId,
  sprintId: ObjectId (optional),
  reporterId: ObjectId,
  assigneeId: ObjectId (optional),
  storyPoints: Number (0-100, optional),
  labels: Array[String] (optional),
  dueDate: Date (optional)
}
```

## 🛡️ Security Features

- **JWT tokens** with secure HTTP-only cookies
- **Password hashing** with bcrypt
- **Rate limiting** on authentication endpoints
- **Input validation** with Zod schemas
- **XSS protection** via sanitization
- **CORS configuration** for frontend integration
- **Environment-based** configuration

## 📧 Email System

Configured with Google SMTP for:

- **Registration OTP** verification
- **Project invitations** with secure tokens
- **Password reset** (ready for implementation)
- **Activity notifications** (ready for implementation)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts
```

## 🐳 Docker Support

```bash
# Build and run with Docker
npm run docker:build
npm run docker:run

# Using Docker Compose
npm run docker:compose:up
```

## 📝 Development Notes

### File Structure

```
TaskManager/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── dtos/           # Data transfer objects
│   ├── handlers/       # Business logic handlers
│   ├── middlewares/    # Express middlewares
│   ├── models/         # Database models
│   ├── repositories/   # Data access layer
│   ├── routes/         # API routes
│   ├── services/       # Business services
│   ├── utils/          # Utility functions
│   └── docs/           # API documentation
├── scripts/            # Migration and utility scripts
└── __tests__/          # Test files
```

### Environment Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/taskmanager

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE_TIME=24h

# Email (Google SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Server
PORT=3000
NODE_ENV=development
```

## 🚀 Next Steps

Ready for implementation:

- **Comment system** for issues
- **Search and filtering** enhancements
- **Admin dashboard** with analytics
- **Soft delete** with 30-day retention
- **Real-time notifications** via WebSockets
- **File attachments** for issues
- **Advanced reporting** and charts

## 📚 API Documentation

Complete Swagger documentation available at `/api-docs` when the server is running.

The API follows RESTful conventions with:

- **Consistent error responses**
- **Pagination support**
- **Query parameter filtering**
- **Comprehensive validation**
- **Detailed response schemas**

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

---

**Built with Express.js, MongoDB, TypeScript, and ❤️**
