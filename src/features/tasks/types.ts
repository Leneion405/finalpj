// src/features/tasks/types.ts
import { Models } from "node-appwrite";

export enum TaskStatus {
  BACKLOG = "BACKLOG",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE",
}
export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export interface Task extends Models.Document {
  // Required
  name: string;
  status: TaskStatus;
  projectId: string;
  workspaceId: string;
  position: number;
  description?: string;
  assigneeId?: string;
  startDate?: string; // ISO date string format
  dueDate?: string;   // ISO date string format
  dependencyIds?: string[];
  priority?: TaskPriority;
}

export interface TaskWithProject extends Task {
  project: {
    name: string;
    // Add other project fields if needed
  };
}
