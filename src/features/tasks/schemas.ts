// src/features/tasks/schemas.ts
import { z } from "zod";

import { TaskStatus } from "./types";

export const createTaskSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  status: z.nativeEnum(TaskStatus, { required_error: "Required" }),
  workspaceId: z.string().trim().min(1, "Required"),
  projectId: z.string().trim().min(1, "Required"),
  startDate: z.coerce.date().default(() => new Date()), 
  dueDate: z.coerce.date(),
  startDate: z.coerce.date().default(() => new Date()), // Add this line with default to current date
  assigneeId: z.string().trim().min(1, "Required"),
  description: z.string().optional(),
});
