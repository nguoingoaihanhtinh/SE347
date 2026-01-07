# TaskManager API Documentation

## 📚 **Complete API Reference**

Your TaskManager backend now has **comprehensive Swagger documentation** available at:

- **Development**: http://localhost:3000/api-docs
- **Production**: https://api.taskmanager.com/api-docs

## 🔧 **API Overview**

### **Authentication**

- **JWT-based** with secure HTTP-only cookies
- **OTP email verification** for new accounts
- **Rate limiting** on sensitive endpoints

### **Available Endpoints**

#### **🔐 Authentication** (`/api/auth`)

- `POST /register` - Register new user (sends OTP email)
- `POST /verify-otp` - Verify email with OTP code
- `POST /resend-otp` - Resend verification code
- `POST /login` - User login (returns JWT + sets cookie)
- `POST /logout` - User logout
- `GET /me` - Get current user profile
- `POST /refresh` - Refresh authentication token

#### **👥 Users** (`/api/users`)

- `GET /users` - Search users (for invitations)
- `GET /users/{userId}` - Get user profile by ID
- `GET /users/profile` - Get own profile
- `PUT /users/profile` - Update own profile
- `POST /users/change-password` - Change password
- `POST /users/upload-avatar` - Upload avatar image
- `DELETE /users/delete-avatar` - Remove avatar
- `POST /users/deactivate-account` - Soft delete account

#### **📁 Projects** (`/api/projects`)

- `GET /projects` - List user's projects
- `POST /projects` - Create new project (auto-creates columns)
- `GET /projects/{projectId}` - Get project details
- `PUT /projects/{projectId}` - Update project
- `DELETE /projects/{projectId}` - Delete project
- `GET /projects/{projectId}/stats` - Project statistics
- `GET /projects/key/{projectKey}` - Get project by key

#### **👨‍💼 Project Members** (`/api/project-members`, `/api/projects`)

- `POST /projects/{projectId}/members/invite` - Invite user via email
- `POST /projects/invitations/{token}/accept` - Accept invitation
- `POST /projects/invitations/{token}/decline` - Decline invitation
- `GET /projects/{projectId}/members` - List project members
- `PUT /projects/{projectId}/members/{memberId}/role` - Update member role
- `DELETE /projects/{projectId}/members/{memberId}` - Remove member
- `POST /projects/{projectId}/leave` - Leave project
- `GET /projects/{projectId}/members/stats` - Member statistics
- `GET /projects/{projectId}/invitations` - List pending invitations

#### **📋 Project Columns** (`/api/projects`)

- `POST /projects/{projectId}/columns` - Create column
- `GET /projects/{projectId}/columns` - List columns (optional stats)
- `GET /columns/{columnId}` - Get column details
- `PUT /columns/{columnId}` - Update column
- `PUT /projects/{projectId}/columns/reorder` - Reorder columns
- `DELETE /columns/{columnId}` - Delete column
- `POST /columns/{columnId}/issues` - Add issue to column
- `DELETE /columns/{columnId}/issues` - Remove issue from column
- `POST /projects/{projectId}/columns/initialize` - Create default columns

#### **🏃‍♂️ Sprints** (`/api/sprints`)

- `GET /sprints` - List sprints with filters
- `POST /sprints` - Create new sprint
- `GET /sprints/{sprintId}` - Get sprint details
- `PUT /sprints/{sprintId}` - Update sprint
- `DELETE /sprints/{sprintId}` - Delete sprint
- `GET /projects/{projectId}/sprints` - List project sprints
- `POST /sprints/{sprintId}/start` - Start sprint
- `POST /sprints/{sprintId}/complete` - Complete sprint
- `GET /sprints/{sprintId}/stats` - Sprint statistics & burndown

#### **🎫 Issues** (`/api/issues`)

- `GET /issues` - List/search issues with filters
- `POST /issues` - Create new issue
- `GET /issues/{issueId}` - Get issue details
- `PUT /issues/{issueId}` - Update issue
- `DELETE /issues/{issueId}` - Delete issue
- `GET /issues/key/{issueKey}` - Get issue by key (e.g., "TMA-123")
- `GET /projects/{projectId}/issues` - List project issues

## 🛡️ **Authentication Guide**

### **For Frontend Implementation:**

```javascript
// 1. Login (sets HTTP-only cookie automatically)
const loginResponse = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include", // Important for cookies
  body: JSON.stringify({ email, password }),
});

// 2. All subsequent requests (cookie sent automatically)
const projectsResponse = await fetch("/api/projects", {
  credentials: "include", // Always include for auth
});

// 3. Alternative: Bearer token (if you prefer)
const response = await fetch("/api/projects", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### **Role-Based Access:**

- **Owner**: Full project control
- **Admin**: Manage project, members, sprints, issues
- **Member**: Create/update issues, move between columns
- **Viewer**: Read-only access

## 🎯 **Key Features for Frontend**

### **1. Real-time Kanban Board**

```javascript
// Get columns with issue counts
const columns = await fetch("/api/projects/PROJECT_ID/columns?withStats=true");

// Move issue between columns
await fetch("/api/columns/COLUMN_ID/issues", {
  method: "POST",
  body: JSON.stringify({ issueId: "ISSUE_ID" }),
});
```

### **2. Team Management**

```javascript
// Invite member
await fetch("/api/projects/PROJECT_ID/members/invite", {
  method: "POST",
  body: JSON.stringify({
    email: "user@example.com",
    role: "member",
    message: "Welcome to our project!",
  }),
});

// Update role
await fetch("/api/projects/PROJECT_ID/members/USER_ID/role", {
  method: "PUT",
  body: JSON.stringify({ role: "admin" }),
});
```

### **3. Sprint Management**

```javascript
// Get sprint with burndown data
const sprint = await fetch("/api/sprints/SPRINT_ID/stats");

// Start sprint
await fetch("/api/sprints/SPRINT_ID/start", { method: "POST" });

// Complete sprint
await fetch("/api/sprints/SPRINT_ID/complete", {
  method: "POST",
  body: JSON.stringify({ moveIncompleteToBacklog: true }),
});
```

### **4. Advanced Search & Filtering**

```javascript
// Search issues with multiple filters
const issues = await fetch(
  "/api/issues?" +
    new URLSearchParams({
      projectId: "PROJECT_ID",
      status: "in_progress",
      assigneeId: "USER_ID",
      priority: "high",
      search: "authentication",
      labels: "frontend,security",
      sortBy: "priority",
      sortOrder: "desc",
    })
);
```

## ⚡ **Quick Start for Frontend**

### **1. Project Creation Flow**

```javascript
// Create project (automatically creates default columns)
const project = await createProject({
  name: "My App",
  key: "APP",
  type: "scrum",
  description: "Mobile app project",
});

// Columns "To Do", "In Progress", "Review", "Done" are auto-created!
```

### **2. Issue Management**

```javascript
// Create issue with full validation
const issue = await createIssue({
  title: "Implement login",
  type: "task",
  priority: "high",
  projectId: "PROJECT_ID",
  assigneeId: "USER_ID",
  storyPoints: 8,
  labels: ["frontend", "authentication"],
});

// Issue automatically gets key like "APP-1"
```

### **3. Error Handling**

```javascript
// All endpoints return consistent error format
try {
  const response = await fetch("/api/projects", { credentials: "include" });
  const data = await response.json();

  if (!data.success) {
    // Handle error
    console.error(data.message, data.error);
  }
} catch (error) {
  // Network error
  console.error("API Error:", error);
}
```

## 🧪 **Testing the APIs**

### **Using Swagger UI:**

1. Go to http://localhost:3000/api-docs
2. Click "Authorize" and enter your JWT token
3. Test any endpoint interactively

### **Using Postman/Insomnia:**

1. Import the OpenAPI spec from `/api-docs/swagger.json`
2. Set up authentication (Bearer token or Cookie)
3. Test all endpoints with real data

## 📊 **Response Formats**

### **Success Response:**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    /* response data */
  }
}
```

### **Error Response:**

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": {
      /* additional error info */
    }
  }
}
```

### **Paginated Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      /* array of results */
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 95,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

## 🎨 **Frontend Integration Tips**

### **1. State Management**

- Use the consistent API response format for error handling
- Implement optimistic updates for better UX
- Cache frequently accessed data (projects, user profile)

### **2. Real-time Features**

- Poll `/api/projects/{id}/columns?withStats=true` for live updates
- Use `/api/sprints/{id}/stats` for burndown charts
- Implement WebSocket later for real-time collaboration

### **3. Offline Support**

- Cache critical data in localStorage/IndexedDB
- Queue API calls when offline
- Sync when connection is restored

The API is now **production-ready** with comprehensive documentation, validation, error handling, and security features! 🚀
