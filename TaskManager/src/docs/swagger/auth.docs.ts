// src/docs/swagger/auth.docs.ts

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the user
 *           example: "507f1f77bcf86cd799439013"
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john.doe@example.com"
 *         fullName:
 *           type: string
 *           description: User's full name
 *           example: "John Doe"
 *         avatar:
 *           type: string
 *           description: URL to user's avatar image
 *           example: "https://example.com/avatars/johndoe.jpg"
 *         role:
 *           type: string
 *           enum: ["user", "admin", "super_admin"]
 *           description: System role of the user
 *           example: "user"
 *         isEmailVerified:
 *           type: boolean
 *           description: Whether the user's email is verified
 *           example: true
 *
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           description: User's password
 *           example: "SecurePass123!"
 *
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - first_name
 *         - last_name
 *         - password
 *         - confirm_password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john.doe@example.com"
 *         first_name:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           description: User's first name
 *           example: "John"
 *         last_name:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           description: User's last name
 *           example: "Doe"
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           description: Password (must contain uppercase, lowercase, number, special character)
 *           example: "SecurePass123!"
 *         confirm_password:
 *           type: string
 *           format: password
 *           description: Password confirmation (must match password)
 *           example: "SecurePass123!"
 *
 *     VerifyOtpRequest:
 *       type: object
 *       required:
 *         - userId
 *         - otpCode
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the user to verify
 *           example: "507f1f77bcf86cd799439013"
 *         otpCode:
 *           type: string
 *           pattern: "^[0-9]{6}$"
 *           description: 6-digit OTP code
 *           example: "123456"
 *
 *     ResendOtpRequest:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the user to resend OTP to
 *           example: "507f1f77bcf86cd799439013"
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Login successful"
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             token:
 *               type: string
 *               description: JWT access token (also set as HTTP-only cookie)
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user account
 *     description: |
 *       Creates a new user account and sends an OTP verification email.
 *       The account will be in pending state until email is verified.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       200:
 *         description: Registration successful, OTP sent to email
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
 *                   example: "Registration successful. Please check your email for verification code."
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439013"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     fullName:
 *                       type: string
 *                       example: "John Doe"
 *                     message:
 *                       type: string
 *                       example: "Registration successful. Please check your email for verification code."
 *       400:
 *         description: Validation error or passwords don't match
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Validation failed"
 *               error:
 *                 code: "VALIDATION_ERROR"
 *                 details:
 *                   field: "password"
 *                   message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Email already registered"
 *               error:
 *                 code: "EMAIL_EXISTS"
 */

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and activate account
 *     description: Verifies the OTP code sent to user's email and activates their account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtpRequest'
 *     responses:
 *       200:
 *         description: OTP verified successfully, account activated
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
 *                   example: "Email verified successfully. Your account is now active."
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439013"
 *                     isEmailVerified:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Invalid or expired OTP code"
 *               error:
 *                 code: "INVALID_OTP"
 *       404:
 *         description: User not found
 *       429:
 *         description: Too many OTP attempts
 */

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     summary: Resend OTP verification code
 *     description: Resends OTP verification code to user's email. Limited to 5 requests per 15 minutes.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResendOtpRequest'
 *     responses:
 *       200:
 *         description: OTP resent successfully
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
 *                   example: "OTP resent successfully. Please check your email."
 *                 data:
 *                   type: object
 *                   properties:
 *                     otpExpiresAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:20:00Z"
 *       400:
 *         description: Account already verified or invalid user
 *       404:
 *         description: User not found
 *       429:
 *         description: Rate limit exceeded (5 requests per 15 minutes)
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: |
 *       Authenticates user with email and password. Returns JWT token and sets secure HTTP-only cookie.
 *       Account must be email-verified to login.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             description: Secure HTTP-only authentication cookie
 *             schema:
 *               type: string
 *               example: "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Lax; Max-Age=604800"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid credentials or unverified account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_credentials:
 *                 summary: Invalid email or password
 *                 value:
 *                   success: false
 *                   message: "Invalid email or password"
 *                   error:
 *                     code: "INVALID_CREDENTIALS"
 *               unverified_email:
 *                 summary: Email not verified
 *                 value:
 *                   success: false
 *                   message: "Please verify your email before logging in"
 *                   error:
 *                     code: "EMAIL_NOT_VERIFIED"
 *                     details:
 *                       userId: "507f1f77bcf86cd799439013"
 *       429:
 *         description: Too many login attempts (rate limited)
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User logout
 *     description: Logs out the user by clearing the authentication cookie
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         headers:
 *           Set-Cookie:
 *             description: Clears the authentication cookie
 *             schema:
 *               type: string
 *               example: "token=; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
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
 *                   example: "Logged out successfully"
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieves the profile information of the currently authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
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
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh authentication token
 *     description: |
 *       Refreshes the JWT token using the existing authentication cookie.
 *       Extends the session and updates the cookie expiration.
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         headers:
 *           Set-Cookie:
 *             description: Updated authentication cookie with new expiration
 *             schema:
 *               type: string
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
 *                   example: "Token refreshed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: New JWT token
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       description: New token expiration time
 *       401:
 *         description: Invalid or expired refresh token
 */
