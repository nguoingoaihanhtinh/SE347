// src/routes/project-column.route.ts
import express from "express";
import { authenticate } from "@/middlewares/auth.middleware";
import projectColumnHandler from "@/handlers/project-column.handler";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route POST /api/projects/:projectId/columns
 * @desc Create a new column in a project
 * @access Private (Owner, Admin)
 */
router.post("/:projectId/columns", projectColumnHandler.createColumn);

/**
 * @route GET /api/projects/:projectId/columns
 * @desc Get all columns for a project
 * @access Private (All project members)
 * @query withStats - Include issue count statistics
 */
router.get("/:projectId/columns", projectColumnHandler.getProjectColumns);

/**
 * @route GET /api/columns/:columnId
 * @desc Get a specific column by ID
 * @access Private (All project members)
 */
router.get("/columns/:columnId", projectColumnHandler.getColumnById);

/**
 * @route PUT /api/columns/:columnId
 * @desc Update a column
 * @access Private (Owner, Admin)
 */
router.put("/columns/:columnId", projectColumnHandler.updateColumn);

/**
 * @route PUT /api/projects/:projectId/columns/reorder
 * @desc Reorder columns in a project
 * @access Private (Owner, Admin)
 */
router.put("/:projectId/columns/reorder", projectColumnHandler.reorderColumns);

/**
 * @route DELETE /api/columns/:columnId
 * @desc Delete a column
 * @access Private (Owner, Admin)
 */
router.delete("/columns/:columnId", projectColumnHandler.deleteColumn);

/**
 * @route POST /api/columns/:columnId/issues
 * @desc Add an issue to a column
 * @access Private (Owner, Admin, Member)
 */
router.post("/columns/:columnId/issues", projectColumnHandler.addIssueToColumn);

/**
 * @route DELETE /api/columns/:columnId/issues
 * @desc Remove an issue from a column
 * @access Private (Owner, Admin, Member)
 */
router.delete("/columns/:columnId/issues", projectColumnHandler.removeIssueFromColumn);

/**
 * @route POST /api/projects/:projectId/columns/initialize
 * @desc Initialize default columns for a new project
 * @access Private (Owner, Admin)
 */
router.post("/:projectId/columns/initialize", projectColumnHandler.initializeDefaultColumns);

export default router;
