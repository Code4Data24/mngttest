import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";
import sendEmail from "../configs/nodemailer.js";

export const inngest = new Inngest({ id: "project-management" });



const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.create({
      data: {
        id: data.id,
        email: data?.email_addresses[0]?.email_address,
        name: `${data?.first_name ?? ""} ${data?.last_name ?? ""}`.trim(),
        image: data?.image_url ?? "",
      },
    });
  }
);

const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await prisma.user.delete({ where: { id: event.data.id } });
  }
);

const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.update({
      where: { id: data.id },
      data: {
        email: data?.email_addresses[0]?.email_address,
        name: `${data?.first_name ?? ""} ${data?.last_name ?? ""}`.trim(),
        image: data?.image_url ?? "",
      },
    });
  }
);



const createDefaultWorkspace = inngest.createFunction(
  { id: "create-default-workspace-on-org-created" },
  { event: "clerk/organization.created" },
  async ({ event }) => {
    const org = event.data;

    const existing = await prisma.workspace.findFirst({
      where: { organizationId: org.id },
      select: { id: true },
    });

    if (existing) return;

    const workspace = await prisma.workspace.create({
      data: {
        organizationId: org.id,
        name: `${org.name} Workspace`,
        slug: `${org.slug}-default`,
        ownerId: org.created_by,
        image_url: org.image_url ?? "",
      },
    });

    await prisma.workspaceMember.create({
      data: {
        userId: org.created_by,
        workspaceId: workspace.id,
        role: "OWNER",
      },
    });
  }
);



const deleteOrgWorkspaces = inngest.createFunction(
  { id: "delete-workspaces-on-org-deleted" },
  { event: "clerk/organization.deleted" },
  async ({ event }) => {
    await prisma.workspace.deleteMany({
      where: { organizationId: event.data.id },
    });
  }
);



const sendBookingConfirmationEmail = inngest.createFunction(
  { id: "send-task-assignment-mail" },
  { event: "app/task.assigned" },
  async ({ event, step }) => {
    const { taskId, origin } = event.data;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignee: true, project: true },
    });

    if (!task) return;

    await sendEmail({
      to: task.assignee.email,
      subject: `New Task Assignment in ${task.project.name}`,
      body: `<p>You have been assigned: <b>${task.title}</b></p>`,
    });

    await step.sleepUntil("wait-for-due-date", task.due_date);

    const refreshed = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (refreshed && refreshed.status !== "DONE") {
      await sendEmail({
        to: task.assignee.email,
        subject: `Reminder: ${task.title}`,
        body: `<p>Your task is still pending.</p>`,
      });
    }
  }
);



export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  createDefaultWorkspace,
  deleteOrgWorkspaces,
  sendBookingConfirmationEmail,
];
