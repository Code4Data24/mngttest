import prisma from "../configs/prisma.js";
import { inngest } from "../inngest/index.js";


export const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, type, status, priority, assigneeId, due_date } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }

  
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        workspaceId: req.workspace.id,
      },
      include: {
        members: true,
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

  
    if (
      req.workspaceRole !== "OWNER" &&
      req.workspaceRole !== "ADMIN" &&
      project.team_lead !== req.userId
    ) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

   
    if (
      assigneeId &&
      !project.members.some((m) => m.userId === assigneeId)
    ) {
      return res.status(400).json({ message: "Assignee is not part of this project" });
    }

    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        type,
        status,
        priority,
        assigneeId,
        due_date: due_date ? new Date(due_date) : null,
      },
      include: {
        assignee: true,
      },
    });

   
    if (assigneeId) {
      await inngest.send({
        name: "app/task.assigned",
        data: { taskId: task.id },
      });
    }

    res.status(201).json({ task });
  } catch (error) {
    console.error("Create Task Error:", error);
    res.status(500).json({ message: "Failed to create task" });
  }
};


export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          workspaceId: req.workspace.id,
        },
      },
      include: {
        project: true,
      },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (
      req.workspaceRole !== "OWNER" &&
      req.workspaceRole !== "ADMIN" &&
      task.project.team_lead !== req.userId
    ) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: req.body,
    });

    res.json({ task: updated });
  } catch (error) {
    console.error("Update Task Error:", error);
    res.status(500).json({ message: "Failed to update task" });
  }
};


export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          workspaceId: req.workspace.id,
        },
      },
      include: {
        project: true,
      },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (
      req.workspaceRole !== "OWNER" &&
      req.workspaceRole !== "ADMIN" &&
      task.project.team_lead !== req.userId
    ) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    await prisma.task.delete({ where: { id: taskId } });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete Task Error:", error);
    res.status(500).json({ message: "Failed to delete task" });
  }
};
