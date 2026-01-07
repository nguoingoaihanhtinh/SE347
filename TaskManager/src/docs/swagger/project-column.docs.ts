// src/docs/swagger/project-column.docs.ts

/**
 * @swagger
 * components:
 *   schemas:
 *     ProjectColumn:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the column
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           description: Name of the column
 *           maxLength: 50
 *           example: "To Do"
 *         description:
 *           type: string
 *           description: Optional description of the column
 *           maxLength: 200
 *           example: "Tasks that need to be done"
 *         color:
 *           type: string
 *           description: Hex color code for the column
 *           pattern: "^#[0-9A-Fa-f]{6}$"
 *           example: "#6B7280"
 *         projectId:
 *           type: string
 *           description: ID of the project this column belongs to
 *           example: "507f1f77bcf86cd799439012"
 *         order:
 *           type: integer
 *           description: Display order of the column
 *           minimum: 1
 *           example: 1
 *         issueIds:
 *           type: array
 *           description: Array of issue IDs in this column
 *           items:
 *             type: string
 *           example: ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *
 *     ProjectColumnWithStats:
 *       allOf:
 *         - $ref: '#/components/schemas/ProjectColumn'
 *         - type: object
 *           properties:
 *             issueCount:
 *               type: integer
 *               description: Number of issues in this column
 *               example: 5
 *
 *     CreateColumnRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           description: Name of the column
 *           example: "In Progress"
 *         description:
 *           type: string
 *           maxLength: 200
 *           description: Optional description
 *           example: "Tasks currently being worked on"
 *         color:
 *           type: string
 *           pattern: "^#[0-9A-Fa-f]{6}$"
 *           description: Hex color code
 *           example: "#3B82F6"
 *
 *     UpdateColumnRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           description: Name of the column
 *           example: "Code Review"
 *         description:
 *           type: string
 *           maxLength: 200
 *           description: Optional description
 *           example: "Tasks ready for code review"
 *         color:
 *           type: string
 *           pattern: "^#[0-9A-Fa-f]{6}$"
 *           description: Hex color code
 *           example: "#F59E0B"
 *
 *     ReorderColumnsRequest:
 *       type: object
 *       required:
 *         - columnOrders
 *       properties:
 *         columnOrders:
 *           type: array
 *           minItems: 1
 *           description: Array of column ID and order pairs
 *           items:
 *             type: object
 *             required:
 *               - columnId
 *               - order
 *             properties:
 *               columnId:
 *                 type: string
 *                 description: Column ID
 *                 example: "507f1f77bcf86cd799439011"
 *               order:
 *                 type: integer
 *                 minimum: 1
 *                 description: New order position
 *                 example: 2
 *
 *     ManageIssueRequest:
 *       type: object
 *       required:
 *         - issueId
 *       properties:
 *         issueId:
 *           type: string
 *           description: ID of the issue to manage
 *           example: "507f1f77bcf86cd799439015"
 */

/**
 * @swagger
 * /api/projects/{projectId}/columns:
 *   post:
 *     summary: Create a new column in a project
 *     description: Creates a new column in the specified project. Requires Owner or Admin role.
 *     tags: [Project Columns]
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
 *             $ref: '#/components/schemas/CreateColumnRequest'
 *     responses:
 *       201:
 *         description: Column created successfully
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
 *                   example: "Column created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ProjectColumn'
 *       400:
 *         description: Bad request (validation error, duplicate name, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Project not found
 *
 *   get:
 *     summary: Get all columns for a project
 *     description: Retrieves all columns for the specified project. All project members can access.
 *     tags: [Project Columns]
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
 *         name: withStats
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Include issue count statistics
 *         example: "true"
 *     responses:
 *       200:
 *         description: Columns retrieved successfully
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
 *                   example: "Columns retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     oneOf:
 *                       - $ref: '#/components/schemas/ProjectColumn'
 *                       - $ref: '#/components/schemas/ProjectColumnWithStats'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a project member)
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /api/columns/{columnId}:
 *   get:
 *     summary: Get a specific column by ID
 *     description: Retrieves details of a specific column. All project members can access.
 *     tags: [Project Columns]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: columnId
 *         required: true
 *         schema:
 *           type: string
 *         description: Column ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Column retrieved successfully
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
 *                   example: "Column retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ProjectColumn'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a project member)
 *       404:
 *         description: Column not found
 *
 *   put:
 *     summary: Update a column
 *     description: Updates column properties. Requires Owner or Admin role.
 *     tags: [Project Columns]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: columnId
 *         required: true
 *         schema:
 *           type: string
 *         description: Column ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateColumnRequest'
 *     responses:
 *       200:
 *         description: Column updated successfully
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
 *                   example: "Column updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ProjectColumn'
 *       400:
 *         description: Bad request (validation error, duplicate name, etc.)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Column not found
 *
 *   delete:
 *     summary: Delete a column
 *     description: Deletes a column. Cannot delete if it contains issues. Requires Owner or Admin role.
 *     tags: [Project Columns]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: columnId
 *         required: true
 *         schema:
 *           type: string
 *         description: Column ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Column deleted successfully
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
 *                   example: "Column deleted successfully"
 *       400:
 *         description: Bad request (column contains issues)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Column not found
 */

/**
 * @swagger
 * /api/projects/{projectId}/columns/reorder:
 *   put:
 *     summary: Reorder columns in a project
 *     description: Updates the display order of columns in a project. Requires Owner or Admin role.
 *     tags: [Project Columns]
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
 *             $ref: '#/components/schemas/ReorderColumnsRequest'
 *           example:
 *             columnOrders:
 *               - columnId: "507f1f77bcf86cd799439011"
 *                 order: 2
 *               - columnId: "507f1f77bcf86cd799439013"
 *                 order: 1
 *     responses:
 *       200:
 *         description: Columns reordered successfully
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
 *                   example: "Columns reordered successfully"
 *       400:
 *         description: Bad request (validation error, invalid order sequence)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Project or column not found
 */

/**
 * @swagger
 * /api/columns/{columnId}/issues:
 *   post:
 *     summary: Add an issue to a column
 *     description: Assigns an issue to a column. Requires Owner, Admin, or Member role.
 *     tags: [Project Columns]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: columnId
 *         required: true
 *         schema:
 *           type: string
 *         description: Column ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ManageIssueRequest'
 *     responses:
 *       200:
 *         description: Issue added to column successfully
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
 *                   example: "Issue added to column successfully"
 *       400:
 *         description: Bad request (issue doesn't belong to project)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Column or issue not found
 *
 *   delete:
 *     summary: Remove an issue from a column
 *     description: Removes an issue from a column. Requires Owner, Admin, or Member role.
 *     tags: [Project Columns]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: columnId
 *         required: true
 *         schema:
 *           type: string
 *         description: Column ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ManageIssueRequest'
 *     responses:
 *       200:
 *         description: Issue removed from column successfully
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
 *                   example: "Issue removed from column successfully"
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Column or issue not found
 */

/**
 * @swagger
 * /api/projects/{projectId}/columns/initialize:
 *   post:
 *     summary: Initialize default columns for a project
 *     description: Creates the default set of columns (To Do, In Progress, Review, Done) for a new project. Requires Owner or Admin role.
 *     tags: [Project Columns]
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
 *       201:
 *         description: Default columns created successfully
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
 *                   example: "Default columns created successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProjectColumn'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Project not found
 */
