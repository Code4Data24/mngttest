import express from "express";
import { createTask, deleteTask, updateTask } from "../controllers/taskController.js";
import { requireAuthAndOrg } from "../middleware/authMiddleware.js";
import { requireWorkspaceAccess } from "../middleware/workspaceMiddleware.js";


const taskRouter = express.Router();

taskRouter.post(
    "/",
    requireAuthAndOrg,
    requireWorkspaceAccess(),
    createTask
);

taskRouter.put(
    "/:id",
    requireAuthAndOrg,
    requireWorkspaceAccess(),
    updateTask
);

taskRouter.post(
    "/delete",
    requireAuthAndOrg,
    requireWorkspaceAccess(),
    deleteTask
);


export default taskRouter;
