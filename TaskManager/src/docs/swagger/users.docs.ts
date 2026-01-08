// src/docs/swagger/users.docs.ts

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         fullName:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: User's full name
 *           example: "John Smith"
 *         avatar:
 *           type: string
 *           description: Avatar image URL
 *           example: "https://example.com/avatars/newavatar.jpg"
 *         notifications:
 *           type: object
 *           description: Notification preferences
 *           properties:
 *             email:
 *               type: boolean
 *               example: true
 *             push:
 *               type: boolean
 *               example: false
 *             projectUpdates:
 *               type: boolean
 *               example: true
 *             issueAssignments:
 *               type: boolean
 *               example: true
 *         role:
 *           type: string
 *           enum: ["user", "admin", "super_admin"]
 *           description: System role (admin-only)
 *           example: "admin"
 *
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *         - confirmPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           format: password
 *           description: Current password for verification
 *           example: "CurrentPass123!"
 *         newPassword:
 *           type: string
 *           format: password
 *           minLength: 8
 *           description: New password (must contain uppercase, lowercase, number, special char)
 *           example: "NewSecurePass456!"
 *         confirmPassword:
 *           type: string
 *           format: password
 *           description: Confirmation of new password
 *           example: "NewSecurePass456!"
 *
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "507f1f77bcf86cd799439013"
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *         fullName:
 *           type: string
 *           example: "John Doe"
 *         avatar:
 *           type: string
 *           nullable: true
 *           example: "https://example.com/avatar.jpg"
 *         role:
 *           type: string
 *           enum: ["user", "admin", "super_admin"]
 *           example: "user"
 *         isEmailVerified:
 *           type: boolean
 *           example: true
 *         notifications:
 *           type: object
 *           nullable: true
 *           properties:
 *             email:
 *               type: boolean
 *             push:
 *               type: boolean
 *             projectUpdates:
 *               type: boolean
 *             issueAssignments:
 *               type: boolean
 *         isActive:
 *           type: boolean
 *           example: true
 *         lastLoginAt:
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
 *     UserSearchResult:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "507f1f77bcf86cd799439013"
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *         fullName:
 *           type: string
 *           example: "John Doe"
 *         avatar:
 *           type: string
 *           nullable: true
 *           example: "https://example.com/avatar.jpg"
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Search and list users
 *     description: |
 *       Search for users by name or email. Useful for project member invitations.
 *       Returns basic user information without sensitive data.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search term for user's name or email
 *         example: "john"
 *       - in: query
 *         name: exclude
 *         schema:
 *           type: string
 *         description: Comma-separated list of user IDs to exclude from results
 *         example: "507f1f77bcf86cd799439013,507f1f77bcf86cd799439014"
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Users found successfully
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
 *                   example: "Users retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserSearchResult'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Invalid search parameters
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Get user profile by ID
 *     description: Retrieves detailed profile information for a specific user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "507f1f77bcf86cd799439013"
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
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
 *                   example: "User profile retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get own user profile
 *     description: Retrieves the complete profile of the authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
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
 *                   example: "Profile retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 *   put:
 *     summary: Update own user profile
 *     description: Updates the profile of the authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: "Profile updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Change user password
 *     description: |
 *       Changes the password for the currently authenticated user.
 *       Requires current password for verification.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *                   example: "Password changed successfully"
 *       400:
 *         description: |
 *           Password change failed. Possible reasons:
 *           - Current password is incorrect
 *           - New password doesn't meet security requirements
 *           - New password confirmation doesn't match
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               wrong_current_password:
 *                 summary: Current password is incorrect
 *                 value:
 *                   success: false
 *                   message: "Current password is incorrect"
 *                   error:
 *                     code: "INVALID_CURRENT_PASSWORD"
 *               weak_password:
 *                 summary: New password doesn't meet requirements
 *                 value:
 *                   success: false
 *                   message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
 *                   error:
 *                     code: "WEAK_PASSWORD"
 *               password_mismatch:
 *                 summary: Password confirmation doesn't match
 *                 value:
 *                   success: false
 *                   message: "New password and confirmation don't match"
 *                   error:
 *                     code: "PASSWORD_MISMATCH"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         description: Too many password change attempts (rate limited)
 */

/**
 * @swagger
 * /api/users/upload-avatar:
 *   post:
 *     summary: Upload user avatar image
 *     description: |
 *       Uploads and sets a new avatar image for the current user.
 *       Supports JPEG, PNG, and WebP formats. Maximum file size: 5MB.
 *       Image will be automatically resized to 256x256 pixels.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image file (JPEG, PNG, or WebP, max 5MB)
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
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
 *                   example: "Avatar uploaded successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     avatarUrl:
 *                       type: string
 *                       description: URL of the uploaded avatar
 *                       example: "https://cdn.taskmanager.com/avatars/507f1f77bcf86cd799439013.jpg"
 *       400:
 *         description: |
 *           Upload failed. Possible reasons:
 *           - No file provided
 *           - Invalid file format
 *           - File too large
 *           - Invalid image dimensions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               no_file:
 *                 summary: No file provided
 *                 value:
 *                   success: false
 *                   message: "No avatar file provided"
 *                   error:
 *                     code: "NO_FILE"
 *               invalid_format:
 *                 summary: Invalid file format
 *                 value:
 *                   success: false
 *                   message: "Avatar must be JPEG, PNG, or WebP format"
 *                   error:
 *                     code: "INVALID_FORMAT"
 *               file_too_large:
 *                 summary: File too large
 *                 value:
 *                   success: false
 *                   message: "Avatar file size must be less than 5MB"
 *                   error:
 *                     code: "FILE_TOO_LARGE"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/users/delete-avatar:
 *   delete:
 *     summary: Delete user avatar
 *     description: Removes the current user's avatar image and sets it back to default
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Avatar deleted successfully
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
 *                   example: "Avatar deleted successfully"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/users/deactivate-account:
 *   post:
 *     summary: Deactivate user account
 *     description: |
 *       Deactivates the current user's account. This is a soft delete operation.
 *       The account will be hidden from searches and removed from projects,
 *       but data is retained for 30 days for potential recovery.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - reason
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Current password for verification
 *                 example: "CurrentPassword123!"
 *               reason:
 *                 type: string
 *                 enum: ["not_using", "privacy_concerns", "found_alternative", "temporary_break", "other"]
 *                 description: Reason for deactivation
 *                 example: "temporary_break"
 *               feedback:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Optional feedback about the service
 *                 example: "Great service, just taking a break from project management"
 *     responses:
 *       200:
 *         description: Account deactivated successfully
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
 *                   example: "Account deactivated successfully. You have 30 days to reactivate if you change your mind."
 *                 data:
 *                   type: object
 *                   properties:
 *                     deactivatedAt:
 *                       type: string
 *                       format: date-time
 *                     reactivationDeadline:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Incorrect password or validation error
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
