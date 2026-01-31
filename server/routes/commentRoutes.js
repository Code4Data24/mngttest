import express from "express";
import { addComment, getTaskComments } from "../controllers/commentController.js";
import { requireAuthAndOrg } from "../middleware/authMiddleware.js";
import { requireWorkspaceAccess } from "../middleware/workspaceMiddleware.js";


const commentRouter = express.Router();

commentRouter.post(
  "/",
  requireAuthAndOrg,
  requireWorkspaceAccess(),
  addComment
);

commentRouter.get(
  "/:taskId",
  requireAuthAndOrg,
  requireWorkspaceAccess(),
  getTaskComments
);


export default commentRouter;
