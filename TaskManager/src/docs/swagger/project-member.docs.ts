// src/docs/swagger/project-member.docs.ts

/**
 * @swagger
 * components:
 *   schemas:
 *     ProjectMember:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the project member
 *           example: "507f1f77bcf86cd799439011"
 *         projectId:
 *           type: string
 *           description: ID of the project
 *           example: "507f1f77bcf86cd799439012"
 *         userId:
 *           type: string
 *           description: ID of the user
 *           example: "507f1f77bcf86cd799439013"
 *         role:
 *           type: string
 *           enum: ["owner", "admin", "member", "viewer"]
 *           description: Role of the member in the project
 *           example: "member"
 *         isPending:
 *           type: boolean
 *           description: Whether the membership is pending acceptance
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *         user:
 *           $ref: '#/components/schemas/UserInfo'
 *
 *     ProjectInvitation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the invitation
 *           example: "507f1f77bcf86cd799439015"
 *         projectId:
 *           type: string
 *           description: ID of the project
 *           example: "507f1f77bcf86cd799439012"
 *         inviterUserId:
 *           type: string
 *           description: ID of the user who sent the invitation
 *           example: "507f1f77bcf86cd799439013"
 *         inviteeEmail:
 *           type: string
 *           format: email
 *           description: Email of the invited user
 *           example: "user@example.com"
 *         role:
 *           type: string
 *           enum: ["admin", "member", "viewer"]
 *           description: Proposed role for the invited user
 *           example: "member"
 *         token:
 *           type: string
 *           description: Secure invitation token
 *           example: "abc123def456"
 *         status:
 *           type: string
 *           enum: ["pending", "accepted", "declined", "expired"]
 *           description: Status of the invitation
 *           example: "pending"
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Expiration timestamp
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *
 *     UserInfo:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "507f1f77bcf86cd799439013"
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         fullName:
 *           type: string
 *           example: "John Doe"
 *         avatar:
 *           type: string
 *           description: URL to user's avatar image
 *           example: "https://example.com/avatar.jpg"
 *
 *     InviteMemberRequest:
 *       type: object
 *       required:
 *         - email
 *         - role
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email of the user to invite
 *           example: "newmember@example.com"
 *         role:
 *           type: string
 *           enum: ["admin", "member", "viewer"]
 *           description: Role to assign to the invited user
 *           example: "member"
 *         message:
 *           type: string
 *           maxLength: 500
 *           description: Optional message to include in the invitation
 *           example: "Welcome to our project! Looking forward to working with you."
 *
 *     UpdateMemberRoleRequest:
 *       type: object
 *       required:
 *         - role
 *       properties:
 *         role:
 *           type: string
 *           enum: ["admin", "member", "viewer"]
 *           description: New role for the member
 *           example: "admin"
 *
 *     ProjectMemberStats:
 *       type: object
 *       properties:
 *         totalMembers:
 *           type: integer
 *           description: Total number of members
 *           example: 12
 *         pendingInvitations:
 *           type: integer
 *           description: Number of pending invitations
 *           example: 3
 *         roleBreakdown:
 *           type: object
 *           properties:
 *             owners:
 *               type: integer
 *               example: 1
 *             admins:
 *               type: integer
 *               example: 2
 *             members:
 *               type: integer
 *               example: 8
 *             viewers:
 *               type: integer
 *               example: 1
 *         recentActivity:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 example: "MEMBER_JOINED"
 *               userEmail:
 *                 type: string
 *                 example: "user@example.com"
 *               timestamp:
 *                 type: string
 *                 format: date-time
 */

/**
 * @swagger
 * /api/projects/{projectId}/members/invite:
 *   post:
 *     summary: Invite a user to join the project
 *     description: Sends an email invitation to a user to join the project with the specified role. Requires Owner or Admin role.
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
 *             $ref: '#/components/schemas/InviteMemberRequest'
 *     responses:
 *       200:
 *         description: Invitation sent successfully
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
 *                   example: "Invitation sent successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     invitationId:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439015"
 *                     inviteeEmail:
 *                       type: string
 *                       example: "newmember@example.com"
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request (user already a member, invalid email, etc.)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /api/projects/invitations/{token}/accept:
 *   post:
 *     summary: Accept a project invitation
 *     description: Accepts an invitation to join a project using the invitation token. User must be authenticated.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Invitation token from the email
 *         example: "abc123def456ghi789"
 *     responses:
 *       200:
 *         description: Invitation accepted successfully
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
 *                   example: "Successfully joined the project"
 *                 data:
 *                   type: object
 *                   properties:
 *                     projectId:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439012"
 *                     role:
 *                       type: string
 *                       example: "member"
 *       400:
 *         description: Bad request (invalid token, invitation expired, etc.)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invitation not found
 */

/**
 * @swagger
 * /api/projects/invitations/{token}/decline:
 *   post:
 *     summary: Decline a project invitation
 *     description: Declines an invitation to join a project using the invitation token.
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Invitation token from the email
 *         example: "abc123def456ghi789"
 *     responses:
 *       200:
 *         description: Invitation declined successfully
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
 *                   example: "Invitation declined"
 *       400:
 *         description: Bad request (invalid token, invitation expired, etc.)
 *       404:
 *         description: Invitation not found
 */

/**
 * @swagger
 * /api/projects/{projectId}/members:
 *   get:
 *     summary: Get all members of a project
 *     description: Retrieves a list of all project members with their roles and user information. All project members can access.
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
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of members per page
 *       - in: query
 *         name: role
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["owner", "admin", "member", "viewer"]
 *         description: Filter by role
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Search by user name or email
 *     responses:
 *       200:
 *         description: Members retrieved successfully
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
 *                   example: "Members retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     members:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProjectMember'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a project member)
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /api/projects/{projectId}/members/{memberId}/role:
 *   put:
 *     summary: Update a member's role
 *     description: Updates the role of a project member. Requires Owner role, or Admin role (cannot promote to Owner).
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
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member ID (user ID)
 *         example: "507f1f77bcf86cd799439013"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMemberRoleRequest'
 *     responses:
 *       200:
 *         description: Member role updated successfully
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
 *                   example: "Member role updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ProjectMember'
 *       400:
 *         description: Bad request (invalid role, cannot demote owner, etc.)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Project or member not found
 */

/**
 * @swagger
 * /api/projects/{projectId}/members/{memberId}:
 *   delete:
 *     summary: Remove a member from the project
 *     description: Removes a member from the project. Requires Owner role, or Admin role (cannot remove Owner). Members can remove themselves.
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
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member ID (user ID)
 *         example: "507f1f77bcf86cd799439013"
 *     responses:
 *       200:
 *         description: Member removed successfully
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
 *                   example: "Member removed from project successfully"
 *       400:
 *         description: Bad request (cannot remove owner, etc.)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Project or member not found
 */

/**
 * @swagger
 * /api/projects/{projectId}/leave:
 *   post:
 *     summary: Leave a project
 *     description: Allows the current user to leave the project. Project owners cannot leave unless they transfer ownership first.
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
 *         description: Left project successfully
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
 *                   example: "Successfully left the project"
 *       400:
 *         description: Bad request (owner cannot leave, etc.)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a project member)
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /api/projects/{projectId}/members/stats:
 *   get:
 *     summary: Get project member statistics
 *     description: Retrieves statistics about project members including role breakdown and recent activity. Requires Owner or Admin role.
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
 *                   $ref: '#/components/schemas/ProjectMemberStats'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /api/projects/{projectId}/invitations:
 *   get:
 *     summary: Get pending invitations for a project
 *     description: Retrieves all pending invitations for the project. Requires Owner or Admin role.
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
 *         description: Invitations retrieved successfully
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
 *                   example: "Invitations retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProjectInvitation'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Project not found
 */
