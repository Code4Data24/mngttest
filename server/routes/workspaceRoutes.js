import express from "express";
import { getUserWorkspaces } from "../controllers/workspaceController.js";
import { requireAuthAndOrg } from "../middleware/authMiddleware.js";


const workspaceRouter = express.Router();



workspaceRouter.get("/", getUserWorkspaces);


export default workspaceRouter;
