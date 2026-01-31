import prisma from "../configs/prisma.js";

export const requireAuthAndOrg = async (req, res, next) => {
  try {
    const auth = await req.auth();

    const userId = auth?.userId;
    const orgId = auth?.orgId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!orgId) {
      return res.status(403).json({ message: "No active organization" });
    }

    

    req.userId = userId;
    req.orgId = orgId;
    
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
   

