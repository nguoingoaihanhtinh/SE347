/**
 * @swagger
 * tags:
 *   name: Test
 *   description: Test endpoints to check API status
 */

/**
 * @swagger
 * /api/test/status:
 *   get:
 *     summary: Get API status
 *     tags: [Test]
 *     description: Check if the API is up and running
 *     responses:
 *       200:
 *         description: API is working properly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 message:
 *                   type: string
 *                   example: "API is working properly"
 */
