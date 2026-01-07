// src/docs/swagger/issue.docs.ts

/**
 * @swagger
 * components:
 *   schemas:
 *     Issue:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the issue
 *           example: "507f1f77bcf86cd799439015"
 *         key:
 *           type: string
 *           description: Human-readable issue key (PROJECT_KEY-number)
 *           example: "TMA-123"
 *         title:
 *           type: string
 *           description: Issue title/summary
 *           maxLength: 200
 *           example: "Implement user authentication"
 *         description:
 *           type: string
 *           description: Detailed description of the issue
 *           example: "Add JWT-based authentication system with login, logout, and token refresh"
 *         type:
 *           type: string
 *           enum: ["task", "story", "bug", "epic"]
 *           description: Type of issue
 *           example: "task"
 *         status:
 *           type: string
 *           enum: ["open", "in_progress", "resolved", "closed", "reopened"]
 *           description: Current status of the issue
 *           example: "in_progress"
 *         priority:
 *           type: string
 *           enum: ["low", "medium", "high", "critical"]
 *           description: Priority level
 *           example: "high"
 *         projectId:
 *           type: string
 *           description: ID of the project this issue belongs to
 *           example: "507f1f77bcf86cd799439012"
 *         sprintId:
 *           type: string
 *           description: ID of the sprint (if assigned)
 *           example: "507f1f77bcf86cd799439016"
 *         reporterId:
 *           type: string
 *           description: ID of the user who reported the issue
 *           example: "507f1f77bcf86cd799439013"
 *         assigneeId:
 *           type: string
 *           description: ID of the assigned user
 *           example: "507f1f77bcf86cd799439014"
 *         storyPoints:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           description: Story points for estimation
 *           example: 8
 *         labels:
 *           type: array
 *           description: Array of labels/tags
 *           items:
 *             type: string
 *           example: ["frontend", "authentication", "security"]
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Due date for the issue
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *         reporter:
 *           $ref: '#/components/schemas/UserInfo'
 *         assignee:
 *           $ref: '#/components/schemas/UserInfo'
 *
 *     CreateIssueRequest:
 *       type: object
 *       required:
 *         - title
 *         - type
 *         - projectId
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *           description: Issue title
 *           example: "Implement user authentication"
 *         description:
 *           type: string
 *           maxLength: 5000
 *           description: Detailed description
 *           example: "Add JWT-based authentication system"
 *         type:
 *           type: string
 *           enum: ["task", "story", "bug", "epic"]
 *           description: Issue type
 *           example: "task"
 *         priority:
 *           type: string
 *           enum: ["low", "medium", "high", "critical"]
 *           description: Priority level
 *           default: "medium"
 *           example: "high"
 *         projectId:
 *           type: string
 *           description: Project ID
 *           example: "507f1f77bcf86cd799439012"
 *         sprintId:
 *           type: string
 *           description: Sprint ID (optional)
 *           example: "507f1f77bcf86cd799439016"
 *         assigneeId:
 *           type: string
 *           description: Assignee user ID (optional)
 *           example: "507f1f77bcf86cd799439014"
 *         storyPoints:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           description: Story points
 *           example: 8
 *         labels:
 *           type: array
 *           items:
 *             type: string
 *           description: Labels/tags
 *           example: ["frontend", "authentication"]
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Due date
 *
 *     UpdateIssueRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *           description: Issue title
 *           example: "Updated: Implement user authentication"
 *         description:
 *           type: string
 *           maxLength: 5000
 *           description: Detailed description
 *           example: "Updated description with more details"
 *         type:
 *           type: string
 *           enum: ["task", "story", "bug", "epic"]
 *           description: Issue type
 *           example: "story"
 *         status:
 *           type: string
 *           enum: ["open", "in_progress", "resolved", "closed", "reopened"]
 *           description: Issue status
 *           example: "in_progress"
 *         priority:
 *           type: string
 *           enum: ["low", "medium", "high", "critical"]
 *           description: Priority level
 *           example: "critical"
 *         sprintId:
 *           type: string
 *           description: Sprint ID
 *           example: "507f1f77bcf86cd799439016"
 *         assigneeId:
 *           type: string
 *           description: Assignee user ID
 *           example: "507f1f77bcf86cd799439014"
 *         storyPoints:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           description: Story points
 *           example: 13
 *         labels:
 *           type: array
 *           items:
 *             type: string
 *           description: Labels/tags
 *           example: ["backend", "api", "security"]
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Due date
 */

/**
 * @swagger
 * /api/issues:
 *   get:
 *     summary: Get issues with filtering and pagination
 *     description: Retrieves issues with various filtering options. User must have access to the projects.
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter by project ID
 *       - in: query
 *         name: sprintId
 *         schema:
 *           type: string
 *         description: Filter by sprint ID
 *       - in: query
 *         name: assigneeId
 *         schema:
 *           type: string
 *         description: Filter by assignee
 *       - in: query
 *         name: reporterId
 *         schema:
 *           type: string
 *         description: Filter by reporter
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ["open", "in_progress", "resolved", "closed", "reopened"]
 *         description: Filter by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: ["task", "story", "bug", "epic"]
 *         description: Filter by type
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: ["low", "medium", "high", "critical"]
 *         description: Filter by priority
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
 *       - in: query
 *         name: labels
 *         schema:
 *           type: string
 *         description: Filter by labels (comma-separated)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: ["createdAt", "updatedAt", "priority", "dueDate", "key"]
 *           default: "createdAt"
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: ["asc", "desc"]
 *           default: "desc"
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Issues retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Issues retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     issues:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Issue'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *
 *   post:
 *     summary: Create a new issue
 *     description: Creates a new issue in a project. User must be a project member.
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateIssueRequest'
 *     responses:
 *       201:
 *         description: Issue created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Issue created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Issue'
 *       400:
 *         description: Bad request (validation error)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a project member)
 *       404:
 *         description: Project or sprint not found
 */

/**
 * @swagger
 * /api/issues/{issueId}:
 *   get:
 *     summary: Get a specific issue by ID
 *     description: Retrieves details of a specific issue. User must have access to the project.
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: issueId
 *         required: true
 *         schema:
 *           type: string
 *         description: Issue ID
 *         example: "507f1f77bcf86cd799439015"
 *     responses:
 *       200:
 *         description: Issue retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Issue retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Issue'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (no access to project)
 *       404:
 *         description: Issue not found
 *
 *   put:
 *     summary: Update an issue
 *     description: Updates issue details. User must be a project member with appropriate permissions.
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: issueId
 *         required: true
 *         schema:
 *           type: string
 *         description: Issue ID
 *         example: "507f1f77bcf86cd799439015"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateIssueRequest'
 *     responses:
 *       200:
 *         description: Issue updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Issue updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Issue'
 *       400:
 *         description: Bad request (validation error)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Issue not found
 *
 *   delete:
 *     summary: Delete an issue
 *     description: Permanently deletes an issue. Requires Owner or Admin role in the project.
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: issueId
 *         required: true
 *         schema:
 *           type: string
 *         description: Issue ID
 *         example: "507f1f77bcf86cd799439015"
 *     responses:
 *       200:
 *         description: Issue deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Issue deleted successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Issue not found
 */

/**
 * @swagger
 * /api/issues/key/{issueKey}:
 *   get:
 *     summary: Get an issue by its key
 *     description: Retrieves an issue using its human-readable key (e.g., TMA-123). User must have access to the project.
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: issueKey
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[A-Z][A-Z0-9]{2,9}-[0-9]+$"
 *         description: Issue key (PROJECT_KEY-number)
 *         example: "TMA-123"
 *     responses:
 *       200:
 *         description: Issue retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Issue retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Issue'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (no access to project)
 *       404:
 *         description: Issue not found
 */

/**
 * @swagger
 * /api/projects/{projectId}/issues:
 *   get:
 *     summary: Get all issues for a specific project
 *     description: Retrieves all issues belonging to a specific project with filtering options.
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *         example: "507f1f77bcf86cd799439012"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ["open", "in_progress", "resolved", "closed", "reopened"]
 *         description: Filter by status
 *       - in: query
 *         name: assigneeId
 *         schema:
 *           type: string
 *         description: Filter by assignee
 *       - in: query
 *         name: sprintId
 *         schema:
 *           type: string
 *         description: Filter by sprint
 *     responses:
 *       200:
 *         description: Issues retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Project issues retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     issues:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Issue'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a project member)
 *       404:
 *         description: Project not found
 */
