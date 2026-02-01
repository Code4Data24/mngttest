import prisma from "../configs/prisma.js";

import prisma from "../configs/prisma.js";

export const getUserWorkspaces = async (req, res) => {
  try {
    const userId = req.userId;
    const orgId = req.orgId;

   
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      await prisma.user.create({
        data: {
          id: userId,
          email: null,
          name: "Pending User",
          image: "",
        },
      });
    }

    const workspaces = await prisma.workspace.findMany({
      where: {
        organizationId: orgId,
        members: { some: { userId } },
      },
      include: {
        members: { include: { user: true } },
        projects: {
          include: {
            tasks: {
              include: {
                assignee: true,
                comments: { include: { user: true } },
              },
            },
            members: { include: { user: true } },
          },
        },
        owner: true,
      },
    });

    res.json({ workspaces });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.code || error.message });
  }
};
