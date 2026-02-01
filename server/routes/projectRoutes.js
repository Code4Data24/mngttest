import express from "express";
import { addMember, createProject, updateProject } from "../controllers/projectController.js";
import { requireAuthAndOrg } from "../middleware/authMiddleware.js";
import { requireWorkspaceAccess } from "../middleware/workspaceMiddleware.js";


const projectRouter = express.Router({ mergeParams: true });

projectRouter.post(
  "/",
  requireWorkspaceAccess({ roles: ["OWNER", "ADMIN"] }),
  createProject
);
  

projectRouter.put(
  "/:projectId",
  requireWorkspaceAccess({ roles: ["OWNER", "ADMIN"] }),
  updateProject
);
 

projectRouter.post(
  "/:projectId/addMember",
  requireWorkspaceAccess({ roles: ["OWNER", "ADMIN"] }),
  addMember
);
  
export default projectRouter;
