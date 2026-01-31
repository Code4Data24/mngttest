import express from "express";
import { addMember, createProject, updateProject } from "../controllers/projectController.js";
import { requireAuthAndOrg } from "../middleware/authMiddleware.js";
import { requireWorkspaceAccess } from "../middleware/workspaceMiddleware.js";


const projectRouter = express.Router();

projectRouter.post(
  "/",
  requireAuthAndOrg,
  requireWorkspaceAccess({ roles: ["OWNER", "ADMIN"] }),
  createProject
);

projectRouter.put(
  "/",
  requireAuthAndOrg,
  requireWorkspaceAccess({ roles: ["OWNER", "ADMIN"] }),
  updateProject
);

projectRouter.post(
  "/:projectId/addMember",
  requireAuthAndOrg,
  requireWorkspaceAccess({ roles: ["OWNER", "ADMIN"] }),
  addMember
);

export default projectRouter;
