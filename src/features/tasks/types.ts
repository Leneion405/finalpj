import { Models } from "node-appwrite";

export enum TaskStatus {
  BACKLOG = "BACKLOG",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE",
}

export interface Task extends Models.Document {
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId?: string;
  projectId: string;
  workspaceId: string;
  startDate?: string; // ISO date string format
  dueDate?: string; // ISO date string format
}

export interface TaskWithProject extends Task {
  project: {
    name: string;
  };
}