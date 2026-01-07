// src/docs/swagger/project.docs.ts

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the project
 *           example: "507f1f77bcf86cd799439012"
 *         name:
 *           type: string
 *           description: Name of the project
 *           maxLength: 100
 *           example: "TaskManager Web App"
 *         key:
 *           type: string
 *           description: Unique project key (used for issue keys)
 *           pattern: "^[A-Z][A-Z0-9]{2,9}$"
 *           example: "TMA"
 *         access:
 *           type: string
 *           enum: ["public", "private"]
 *           description: Project access level
 *           example: "private"
 *         type:
 *           type: string
 *           enum: ["scrum", "kanban"]
 *           description: Project methodology type
 *           example: "scrum"
 *         ownerId:
 *           type: string
 *           description: ID of the project owner
 *           example: "507f1f77bcf86cd799439013"
 *         description:
 *           type: string
 *           description: Project description
 *           maxLength: 1000
 *           example: "A comprehensive task management system built with modern technologies"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *
 *     CreateProjectRequest:
 *       type: object
 *       required:
 *         - name
 *         - key
 *         - type
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Name of the project
 *           example: "TaskManager Web App"
 *         key:
 *           type: string
 *           pattern: "^[A-Z][A-Z0-9]{2,9}$"
 *           description: Unique project key (3-10 characters, starts with letter)
 *           example: "TMA"
 *         description:
 *           type: string
 *           maxLength: 1000
 *           description: Project description
 *           example: "A comprehensive task management system"
 *         type:
 *           type: string
 *           enum: ["scrum", "kanban"]
 *           description: Project methodology
 *           example: "scrum"
 *         access:
 *           type: string
 *           enum: ["public", "private"]
 *           description: Project access level
 *           default: "private"
 *           example: "private"
 *
 *     UpdateProjectRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Name of the project
 *           example: "Updated Project Name"
 *         key:
 *           type: string
 *           pattern: "^[A-Z][A-Z0-9]{2,9}$"
 *           description: Project key
 *           example: "UPN"
 *         description:
 *           type: string
 *           maxLength: 1000
 *           description: Project description
 *           example: "Updated project description"
 *         type:
 *           type: string
 *           enum: ["scrum", "kanban"]
 *           description: Project methodology
 *           example: "kanban"
 *         access:
 *           type: string
 *           enum: ["public", "private"]
 *           description: Project access level
 *           example: "public"
 *
 *     ProjectStats:
 *       type: object
 *       properties:
 *         totalIssues:
 *           type: integer
 *           example: 45
 *         issuesByStatus:
 *           type: object
 *           properties:
 *             open:
 *               type: integer
 *               example: 20
 *             inProgress:
 *               type: integer
 *               example: 15
 *             resolved:
 *               type: integer
 *               example: 10
 *         issuesByType:
 *           type: object
 *           properties:
 *             task:
 *               type: integer
 *               example: 25
 *             bug:
 *               type: integer
 *               example: 15
 *             story:
 *               type: integer
 *               example: 5
 *         totalSprints:
 *           type: integer
 *           example: 8
 *         activeSprints:
 *           type: integer
 *           example: 1
 *         totalMembers:
 *           type: integer
 *           example: 12
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects for the current user
 *     description: Retrieves all projects where the current user is a member
 *     tags: [Projects]
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
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of projects per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search projects by name or key
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: ["scrum", "kanban"]
 *         description: Filter by project type
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
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
 *                   example: "Projects retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     projects:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Project'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *
 *   post:
 *     summary: Create a new project
 *     description: Creates a new project with the current user as owner. Automatically creates default columns.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectRequest'
 *     responses:
 *       201:
 *         description: Project created successfully
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
 *                   example: "Project created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       400:
 *         description: Bad request (validation error, duplicate key, etc.)
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/projects/{projectId}:
 *   get:
 *     summary: Get a specific project by ID
 *     description: Retrieves details of a specific project. User must be a project member.
 *     tags: [Projects]
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
 *     responses:
 *       200:
 *         description: Project retrieved successfully
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
 *                   example: "Project retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a project member)
 *       404:
 *         description: Project not found
 *
 *   put:
 *     summary: Update a project
 *     description: Updates project details. Requires Owner or Admin role.
 *     tags: [Projects]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProjectRequest'
 *     responses:
 *       200:
 *         description: Project updated successfully
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
 *                   example: "Project updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       400:
 *         description: Bad request (validation error, duplicate key, etc.)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Project not found
 *
 *   delete:
 *     summary: Delete a project
 *     description: Permanently deletes a project and all associated data. Only the project owner can perform this action.
 *     tags: [Projects]
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
 *     responses:
 *       200:
 *         description: Project deleted successfully
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
 *                   example: "Project deleted successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (only owner can delete)
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /api/projects/{projectId}/stats:
 *   get:
 *     summary: Get project statistics
 *     description: Retrieves comprehensive statistics for the project including issues, sprints, and members. All project members can access.
 *     tags: [Projects]
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
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                   example: "Statistics retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ProjectStats'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a project member)
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /api/projects/key/{projectKey}:
 *   get:
 *     summary: Get a project by its key
 *     description: Retrieves a project using its unique key instead of ID. User must be a project member.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectKey
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[A-Z][A-Z0-9]{2,9}$"
 *         description: Project key
 *         example: "TMA"
 *     responses:
 *       200:
 *         description: Project retrieved successfully
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
 *                   example: "Project retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a project member)
 *       404:
 *         description: Project not found
 */
