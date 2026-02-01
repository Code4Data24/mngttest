import express from "express";
import { createTask, deleteTask, updateTask } from "../controllers/taskController.js";
import { requireAuthAndOrg } from "../middleware/authMiddleware.js";
import { requireWorkspaceAccess } from "../middleware/workspaceMiddleware.js";


const taskRouter = express.Router({ mergeParams: true });

taskRouter.post(
  "/:projectId",
  requireAuthAndOrg,
  requireWorkspaceAccess(),
  createTask
);

taskRouter.put(
  "/:taskId",
  requireAuthAndOrg,
  requireWorkspaceAccess(),
  updateTask
);

taskRouter.delete(
  "/:taskId",
  requireAuthAndOrg,
  requireWorkspaceAccess(),
  deleteTask
);


export default taskRouter;
