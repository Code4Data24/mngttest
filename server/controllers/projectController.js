import prisma from "../configs/prisma.js";


export const createProject = async (req, res) => {
    try {
        const { name, description, status, priority, start_date, end_date } = req.body;

        if (!name) return res.status(400).json({ message: "Project name is required" });

        
        const result = await prisma.$transaction(async (tx) => {
            const newProject = await tx.project.create({
                data: {
                    workspaceId: req.workspace.id,
                    name,
                    description,
                    status,
                    priority,
                    start_date: start_date ? new Date(start_date) : null,
                    end_date: end_date ? new Date(end_date) : null,
                    ownerId: req.userId,
                },
            });

            await tx.projectMember.create({
                data: {
                    projectId: newProject.id,
                    userId: req.userId,
                },
            });

            return newProject;
        });

        res.status(201).json({ project: result });
    } catch (error) {
        console.error("Create Project Error:", error);
        res.status(500).json({ message: "Failed to create project" });
    }
};


export const updateProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { name, description, status, priority, progress } = req.body;

        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                workspaceId: req.workspace.id,
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

        const updated = await prisma.project.update({
            where: { id: projectId },
            data: {
                name,
                description,
                status,
                priority,
                progress,
            },
        });

        res.json({ project: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update project" });
    }
};


export const addMember = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { email } = req.body;

        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                workspaceId: req.workspace.id,
            },
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (project.team_lead !== req.userId && req.workspaceRole !== "OWNER") {
            return res.status(403).json({ message: "Only lead or owner can add members" });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const exists = await prisma.projectMember.findFirst({
            where: { projectId, userId: user.id },
        });

        if (exists) {
            return res.status(400).json({ message: "User already a member" });
        }

        const member = await prisma.projectMember.create({
            data: {
                projectId,
                userId: user.id,
            },
        });

        res.json({ member });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to add member" });
    }
};
