import { z } from "zod";
import { TaskStatus, TaskPriority } from "./types";

export const createTaskSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  status: z.nativeEnum(TaskStatus, { required_error: "Required" }),
  workspaceId: z.string().trim().min(1, "Required"),
  projectId: z.string().trim().min(1, "Required"),
  startDate: z.coerce.date().default(() => new Date()), // only ONE startDate
  dueDate: z.coerce.date().optional(), // dueDate should usually be optional
  assigneeId: z.string().trim().min(1, "Required").optional(), // often optional, adjust if not
  description: z.string().optional(),
  dependencyIds: z.array(z.string()).optional(), 
  priority: z.nativeEnum(TaskPriority).optional().default(TaskPriority.LOW),
});
