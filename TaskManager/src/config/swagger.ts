import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TaskManager API Documentation",
      version: "1.0.0",
      description: `
        Comprehensive API documentation for TaskManager - An Agile/Scrum Project Management System.
        
        ## Features
        - **Authentication**: JWT-based auth with OTP verification
        - **Project Management**: Full CRUD with role-based permissions  
        - **Team Collaboration**: Invite members, manage roles, real-time updates
        - **Kanban Boards**: Customizable columns with drag-and-drop support
        - **Sprint Management**: Scrum methodology with burndown tracking
        - **Issue Tracking**: Tasks, bugs, stories with assignments and priorities
        - **Email Notifications**: Automated invites and status updates
        - **Activity Logging**: Complete audit trail of all actions
        
        ## Authentication
        All endpoints (except public ones) require authentication via:
        - **Bearer Token**: \`Authorization: Bearer <jwt_token>\`
        - **Cookie**: Secure HTTP-only cookie (automatically set on login)
        
        ## Roles & Permissions
        - **Owner**: Full project control, cannot be removed
        - **Admin**: Manage project, members, sprints, issues  
        - **Member**: Create/update issues, participate in sprints
        - **Viewer**: Read-only access to project data
        
        ## Rate Limiting
        - **General**: 100 requests per minute
        - **Authentication**: 10 requests per minute
        - **OTP**: 5 requests per 15 minutes
      `,
      contact: {
        name: "TaskManager Support",
        email: "support@taskmanager.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://api.taskmanager.com",
        description: "Production server",
      },
    ],
    tags: [
      {
        name: "Authentication",
        description: "User authentication and authorization endpoints",
      },
      {
        name: "Users",
        description: "User profile and account management",
      },
      {
        name: "Projects",
        description: "Project creation and management",
      },
      {
        name: "Project Members",
        description: "Team member management and invitations",
      },
      {
        name: "Project Columns",
        description: "Kanban board column management",
      },
      {
        name: "Sprints",
        description: "Sprint planning and management",
      },
      {
        name: "Issues",
        description: "Task, bug, and story management",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token in the format: Bearer <token>",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
          description: "Authentication via secure HTTP-only cookie",
        },
      },
      schemas: {
        // Common schemas used across multiple endpoints
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error message describing what went wrong",
            },
            error: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  example: "VALIDATION_ERROR",
                },
                details: {
                  type: "object",
                  description: "Additional error details",
                },
              },
            },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            currentPage: {
              type: "integer",
              example: 1,
            },
            totalPages: {
              type: "integer",
              example: 5,
            },
            totalItems: {
              type: "integer",
              example: 95,
            },
            itemsPerPage: {
              type: "integer",
              example: 20,
            },
            hasNextPage: {
              type: "boolean",
              example: true,
            },
            hasPreviousPage: {
              type: "boolean",
              example: false,
            },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Operation completed successfully",
            },
            data: {
              type: "object",
              description: "Response data (varies by endpoint)",
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Authentication required or token invalid",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                message: "Unauthorized access",
                error: {
                  code: "UNAUTHORIZED",
                },
              },
            },
          },
        },
        ForbiddenError: {
          description: "Insufficient permissions for this operation",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                message: "Forbidden - insufficient permissions",
                error: {
                  code: "FORBIDDEN",
                },
              },
            },
          },
        },
        NotFoundError: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                message: "Resource not found",
                error: {
                  code: "NOT_FOUND",
                },
              },
            },
          },
        },
        ValidationError: {
          description: "Request validation failed",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                message: "Validation failed",
                error: {
                  code: "VALIDATION_ERROR",
                  details: {
                    field: "email",
                    message: "Valid email is required",
                  },
                },
              },
            },
          },
        },
      },
      parameters: {
        ProjectIdParam: {
          in: "path",
          name: "projectId",
          required: true,
          schema: {
            type: "string",
          },
          description: "Unique identifier for the project",
          example: "507f1f77bcf86cd799439012",
        },
        PageParam: {
          in: "query",
          name: "page",
          schema: {
            type: "integer",
            minimum: 1,
            default: 1,
          },
          description: "Page number for pagination",
        },
        LimitParam: {
          in: "query",
          name: "limit",
          schema: {
            type: "integer",
            minimum: 1,
            maximum: 100,
            default: 20,
          },
          description: "Number of items per page",
        },
      },
    },
  },
  apis: [
    "./src/docs/swagger/*.docs.ts",
    "./src/docs/swagger/*.ts",
    "./src/handlers/*.ts", // Include inline documentation from handlers
    "./src/routes/*.ts", // Include inline documentation from routes
  ],
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
