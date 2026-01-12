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
 *           example: "507f1f77bcf86cd799439016"
 *         name:
 *           type: string
 *           maxLength: 100
 *           example: "Sprint 1 - Authentication"
 *         goal:
 *           type: string
 *           maxLength: 500
 *           example: "Implement complete user authentication system"
 *         projectId:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         dateStarted:
 *           type: string
 *           format: date-time
 *         dateEnded:
 *           type: string
 *           format: date-time
 *         duration:
 *           type: integer
 *           description: Duration in days
 *           example: 14
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateSprintRequest:
 *       type: object
 *       required:
 *         - name
 *         - projectId
 *         - dateStarted
 *         - dateEnded
 *         - goal
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: "Sprint 1"
 *         goal:
 *           type: string
 *           maxLength: 500
 *           example: "Build auth module"
 *         projectId:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         dateStarted:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T00:00:00Z"
 *         dateEnded:
 *           type: string
 *           format: date-time
 *           example: "2024-01-29T00:00:00Z"
 *
 *     UpdateSprintRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 100
 *         goal:
 *           type: string
 *           maxLength: 500
 *         dateStarted:
 *           type: string
 *           format: date-time
 *         dateEnded:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/sprints:
 *   get:
 *     summary: Get sprints by project ID
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Filter by project ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sprint'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *
 *   post:
 *     summary: Create a new sprint
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
 *         description: Sprint created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Sprint'
 */

/**
 * @swagger
 * /api/sprints/{sprintId}:
 *   get:
 *     summary: Get sprint by ID
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
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Sprint'
 *
 *   put:
 *     summary: Update sprint
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSprintRequest'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Sprint'
 *
 *   delete:
 *     summary: Delete sprint
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
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 */

/**
 * @swagger
 * /api/projects/{projectId}/sprints:
 *   get:
 *     summary: Get all sprints for a project
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
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sprint'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
