import express from "express";
import { addComment, getTaskComments } from "../controllers/commentController.js";
import { requireAuthAndOrg } from "../middleware/authMiddleware.js";
import { requireWorkspaceAccess } from "../middleware/workspaceMiddleware.js";


const commentRouter = express.Router({ mergeParams: true });

commentRouter.get(
  "/:taskId",
  requireAuthAndOrg,
  requireWorkspaceAccess(),
  getTaskComments
);

commentRouter.post(
  "/:taskId",
  requireAuthAndOrg,
  requireWorkspaceAccess(),
  addComment
);

export default commentRouter;
