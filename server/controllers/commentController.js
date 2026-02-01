import prisma from "../configs/prisma.js";


export const addComment = async (req, res) => {
  try {
    const { userId } = req;
    const { taskId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }

   
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          workspaceId: req.workspace.id,
        },
      },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comment = await prisma.comment.create({
      data: {
        taskId,
        content,
        userId,
      },
      include: {
        user: true,
      },
    });

    res.json({ comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add comment" });
  }
};


export const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;

  
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          workspaceId: req.workspace.id,
        },
      },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });

    res.json({ comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};
