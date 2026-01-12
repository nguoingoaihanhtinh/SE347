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
 *           example: "507f1f77bcf86cd799439015"
 *         key:
 *           type: string
 *           example: "PROJ-1"
 *         title:
 *           type: string
 *           maxLength: 200
 *           example: "Fix login bug"
 *         summary:
 *           type: string
 *           maxLength: 500
 *           example: "User cannot log in with correct credentials"
 *         description:
 *           type: string
 *           maxLength: 5000
 *           example: "Details about the bug..."
 *         storyPoint:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           example: 5
 *         type:
 *           type: string
 *           enum: ["task", "story", "bug", "epic"]
 *           example: "bug"
 *         priority:
 *           type: string
 *           enum: ["low", "medium", "high", "critical"]
 *           example: "high"
 *         projectId:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         sprintId:
 *           type: string
 *           nullable: true
 *         columnId:
 *           type: string

 *         assigneeId:
 *           type: string
 *           nullable: true
 *         dueDateFrom:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         dueDateTo:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         completedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateIssueRequest:
 *       type: object
 *       required:
 *         - title
 *         - projectId
 *         - columnId
 *         - reporterId
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *         summary:
 *           type: string
 *           maxLength: 500
 *         description:
 *           type: string
 *           maxLength: 5000
 *         storyPoint:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *         type:
 *           type: string
 *           enum: ["task", "story", "bug", "epic"]
 *         priority:
 *           type: string
 *           enum: ["low", "medium", "high", "critical"]
 *         projectId:
 *           type: string
 *         sprintId:
 *           type: string
 *         columnId:
 *           type: string
 *         assigneeId:
 *           type: string
 *         dueDateFrom:
 *           type: string
 *           format: date-time
 *         dueDateTo:
 *           type: string
 *           format: date-time
 *
 *     UpdateIssueRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         summary:
 *           type: string
 *         description:
 *           type: string
 *         storyPoint:
 *           type: integer
 *         type:
 *           type: string
 *           enum: ["task", "story", "bug", "epic"]
 *         priority:
 *           type: string
 *           enum: ["low", "medium", "high", "critical"]
 *         sprintId:
 *           type: string
 *         columnId:
 *           type: string
 *         assigneeId:
 *           type: string
 *         dueDateFrom:
 *           type: string
 *           format: date-time
 *         dueDateTo:
 *           type: string
 *           format: date-time
 *         completedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/issues:
 *   get:
 *     summary: Get issues by projectId or columnId
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *       - in: query
 *         name: columnId
 *         schema:
 *           type: string
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
 *                     $ref: '#/components/schemas/Issue'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *
 *   post:
 *     summary: Create issue
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
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 issue:
 *                   $ref: '#/components/schemas/Issue'
 */

/**
 * @swagger
 * /api/issues/{issueId}:
 *   get:
 *     summary: Get issue by ID
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
 *                 issue:
 *                   $ref: '#/components/schemas/Issue'
 *
 *   put:
 *     summary: Update issue
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
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateIssueRequest'
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
 *                 issue:
 *                   $ref: '#/components/schemas/Issue'
 *
 *   delete:
 *     summary: Delete issue
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
 * /api/projects/{projectId}/issues:
 *   get:
 *     summary: Get all issues for a project
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
 *                     $ref: '#/components/schemas/Issue'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
