import prisma from "../configs/prisma.js";

export const requireWorkspaceAccess = ({ roles } = {}) => {
  return async (req, res, next) => {
    try {
      const userId = req.userId;
      const orgId = req.orgId;
      const { workspaceId } = req.params;

      if (!workspaceId) {
        return res.status(400).json({ message: "Workspace ID missing" });
      }

      const membership = await prisma.workspaceMember.findFirst({
        where: {
          userId,
          workspaceId,
          workspace: {
            organizationId: orgId,
          },
        },
        include: {
          workspace: true,
        },
      });

      if (!membership) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (roles && !roles.includes(membership.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

    
      req.workspace = membership.workspace;
      req.workspaceRole = membership.role;

      next();
    } catch (error) {
      console.error("Workspace middleware error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};
