// src/docs/swagger/sprint.docs.ts

/**
 * @swagger
 * components:
 *   schemas:
 *     Sprint:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the sprint
 *           example: "507f1f77bcf86cd799439016"
 *         name:
 *           type: string
 *           description: Name of the sprint
 *           maxLength: 100
 *           example: "Sprint 1 - Authentication"
 *         goal:
 *           type: string
 *           description: Sprint goal/objective
 *           maxLength: 500
 *           example: "Implement complete user authentication system"
 *         projectId:
 *           type: string
 *           description: ID of the project this sprint belongs to
 *           example: "507f1f77bcf86cd799439012"
 *         dateStarted:
 *           type: string
 *           format: date-time
 *           description: Sprint start date
 *         dateEnded:
 *           type: string
 *           format: date-time
 *           description: Sprint end date
 *         status:
 *           type: string
 *           enum: ["planning", "active", "completed", "cancelled"]
 *           description: Current status of the sprint
 *           example: "active"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *         issues:
 *           type: array
 *           description: Issues assigned to this sprint
 *           items:
 *             $ref: '#/components/schemas/Issue'
 *
 *     CreateSprintRequest:
 *       type: object
 *       required:
 *         - name
 *         - projectId
 *         - startDate
 *         - endDate
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Sprint name
 *           example: "Sprint 1 - Authentication"
 *         goal:
 *           type: string
 *           maxLength: 500
 *           description: Sprint goal
 *           example: "Implement complete user authentication system"
 *         projectId:
 *           type: string
 *           description: Project ID
 *           example: "507f1f77bcf86cd799439012"
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Sprint start date
 *           example: "2024-01-15T09:00:00Z"
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Sprint end date
 *           example: "2024-01-29T18:00:00Z"
 *
 *     UpdateSprintRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Sprint name
 *           example: "Updated Sprint Name"
 *         goal:
 *           type: string
 *           maxLength: 500
 *           description: Sprint goal
 *           example: "Updated sprint objective"
 *         dateStarted:
 *           type: string
 *           format: date-time
 *           description: Sprint start date
 *         dateEnded:
 *           type: string
 *           format: date-time
 *           description: Sprint end date
 *         status:
 *           type: string
 *           enum: ["planning", "active", "completed", "cancelled"]
 *           description: Sprint status
 *           example: "completed"
 *
 *     SprintStats:
 *       type: object
 *       properties:
 *         totalIssues:
 *           type: integer
 *           description: Total issues in the sprint
 *           example: 15
 *         completedIssues:
 *           type: integer
 *           description: Completed issues
 *           example: 12
 *         inProgressIssues:
 *           type: integer
 *           description: Issues in progress
 *           example: 2
 *         openIssues:
 *           type: integer
 *           description: Open issues
 *           example: 1
 *         totalStoryPoints:
 *           type: integer
 *           description: Total story points
 *           example: 89
 *         completedStoryPoints:
 *           type: integer
 *           description: Completed story points
 *           example: 72
 *         completionPercentage:
 *           type: number
 *           format: float
 *           description: Completion percentage
 *           example: 80.9
 *         velocity:
 *           type: number
 *           format: float
 *           description: Sprint velocity (story points per day)
 *           example: 6.2
 *         burndownData:
 *           type: array
 *           description: Daily burndown data
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               remainingPoints:
 *                 type: integer
 *               idealRemaining:
 *                 type: integer
 */

/**
 * @swagger
 * /api/sprints:
 *   get:
 *     summary: Get sprints with filtering and pagination
 *     description: Retrieves sprints across projects the user has access to, with filtering options.
 *     tags: [Sprints]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: ["planning", "active", "completed", "cancelled"]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in sprint name and goal
 *     responses:
 *       200:
 *         description: Sprints retrieved successfully
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
 *                   example: "Sprints retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sprints:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Sprint'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *
 *   post:
 *     summary: Create a new sprint
 *     description: Creates a new sprint in a project. Requires Owner or Admin role.
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSprintRequest'
 *     responses:
 *       201:
 *         description: Sprint created successfully
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
 *                   example: "Sprint created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Sprint'
 *       400:
 *         description: Bad request (validation error, date conflicts, etc.)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /api/sprints/{sprintId}:
 *   get:
 *     summary: Get a specific sprint by ID
 *     description: Retrieves details of a specific sprint including associated issues. User must have access to the project.
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: sprintId
 *         required: true
 *         schema:
 *           type: string
 *         description: Sprint ID
 *         example: "507f1f77bcf86cd799439016"
 *     responses:
 *       200:
 *         description: Sprint retrieved successfully
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
 *                   example: "Sprint retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Sprint'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (no access to project)
 *       404:
 *         description: Sprint not found
 *
 *   put:
 *     summary: Update a sprint
 *     description: Updates sprint details. Requires Owner or Admin role in the project.
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: sprintId
 *         required: true
 *         schema:
 *           type: string
 *         description: Sprint ID
 *         example: "507f1f77bcf86cd799439016"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSprintRequest'
 *     responses:
 *       200:
 *         description: Sprint updated successfully
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
 *                   example: "Sprint updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Sprint'
 *       400:
 *         description: Bad request (validation error, cannot modify active sprint, etc.)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Sprint not found
 *
 *   delete:
 *     summary: Delete a sprint
 *     description: Permanently deletes a sprint. Cannot delete active or completed sprints. Requires Owner or Admin role.
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: sprintId
 *         required: true
 *         schema:
 *           type: string
 *         description: Sprint ID
 *         example: "507f1f77bcf86cd799439016"
 *     responses:
 *       200:
 *         description: Sprint deleted successfully
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
 *                   example: "Sprint deleted successfully"
 *       400:
 *         description: Bad request (cannot delete active/completed sprint)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Sprint not found
 */

/**
 * @swagger
 * /api/projects/{projectId}/sprints:
 *   get:
 *     summary: Get all sprints for a specific project
 *     description: Retrieves all sprints belonging to a specific project. All project members can access.
 *     tags: [Sprints]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: ["planning", "active", "completed", "cancelled"]
 *         description: Filter by status
 *       - in: query
 *         name: includeIssues
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include issues in the response
 *     responses:
 *       200:
 *         description: Project sprints retrieved successfully
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
 *                   example: "Project sprints retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sprint'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a project member)
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /api/sprints/{sprintId}/start:
 *   post:
 *     summary: Start a sprint
 *     description: Changes sprint status to 'active'. Only one sprint can be active per project. Requires Owner or Admin role.
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: sprintId
 *         required: true
 *         schema:
 *           type: string
 *         description: Sprint ID
 *         example: "507f1f77bcf86cd799439016"
 *     responses:
 *       200:
 *         description: Sprint started successfully
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
 *                   example: "Sprint started successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Sprint'
 *       400:
 *         description: Bad request (sprint already active, another sprint active, etc.)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Sprint not found
 */

/**
 * @swagger
 * /api/sprints/{sprintId}/complete:
 *   post:
 *     summary: Complete a sprint
 *     description: Changes sprint status to 'completed' and optionally moves incomplete issues to backlog. Requires Owner or Admin role.
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: sprintId
 *         required: true
 *         schema:
 *           type: string
 *         description: Sprint ID
 *         example: "507f1f77bcf86cd799439016"
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               moveIncompleteToBacklog:
 *                 type: boolean
 *                 description: Whether to move incomplete issues to backlog
 *                 default: true
 *                 example: true
 *     responses:
 *       200:
 *         description: Sprint completed successfully
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
 *                   example: "Sprint completed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sprint:
 *                       $ref: '#/components/schemas/Sprint'
 *                     movedIssues:
 *                       type: integer
 *                       description: Number of issues moved to backlog
 *                       example: 3
 *       400:
 *         description: Bad request (sprint not active, etc.)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Sprint not found
 */

/**
 * @swagger
 * /api/sprints/{sprintId}/stats:
 *   get:
 *     summary: Get sprint statistics and progress
 *     description: Retrieves comprehensive statistics for the sprint including burndown data. All project members can access.
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: sprintId
 *         required: true
 *         schema:
 *           type: string
 *         description: Sprint ID
 *         example: "507f1f77bcf86cd799439016"
 *     responses:
 *       200:
 *         description: Sprint statistics retrieved successfully
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
 *                   example: "Sprint statistics retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SprintStats'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (no access to project)
 *       404:
 *         description: Sprint not found
 */
