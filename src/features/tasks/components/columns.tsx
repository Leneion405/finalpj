"use client";

import { ArrowUpDown, MoreVertical } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { TaskActions } from "./task-actions";
import { TaskDate } from "./task-date";
import { PopulatedTask, TaskPriority, TaskStatus } from "../types";

const statusColorMap: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: "bg-gray-500",
  [TaskStatus.TODO]: "bg-blue-500",
  [TaskStatus.IN_PROGRESS]: "bg-yellow-500",
  [TaskStatus.IN_REVIEW]: "bg-purple-500",
  [TaskStatus.DONE]: "bg-green-500",
};

const priorityColorMap: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: "bg-green-500",
  [TaskPriority.MEDIUM]: "bg-yellow-500",
  [TaskPriority.HIGH]: "bg-red-500",
};

export const columns: ColumnDef<PopulatedTask>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Task Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const name = row.original.name;
      return <div className="font-medium">{name}</div>;
    },
  },
  {
    accessorKey: "project",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Project
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const project = row.original.project;
      if (!project) {
        return <span className="text-muted-foreground">No project</span>;
      }
      return (
        <div className="flex items-center gap-2">
          <ProjectAvatar name={project.name} image={project.imageUrl} className="size-6" />
          <span className="text-sm font-medium">{project.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "assignee",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Assignee
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const assignee = row.original.assignee;
      if (!assignee) {
        return <span className="text-muted-foreground">Unassigned</span>;
      }
      return (
        <div className="flex items-center gap-2">
          <MemberAvatar name={assignee.name} className="size-6" />
          <span className="text-sm">{assignee.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Due Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const dueDate = row.original.dueDate;
      if (!dueDate) {
        return <span className="text-muted-foreground">No due date</span>;
      }
      return <TaskDate value={dueDate} isDueDate={true} />;
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Priority
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const priority = row.original.priority as TaskPriority | undefined;
      switch (priority) {
        case TaskPriority.HIGH:
          return (
            <Badge variant="destructive" className={`${priorityColorMap[TaskPriority.HIGH]} text-white`}>
              HIGH
            </Badge>
          );
        case TaskPriority.MEDIUM:
          return (
            <Badge variant="secondary" className={`${priorityColorMap[TaskPriority.MEDIUM]} text-white`}>
              MEDIUM
            </Badge>
          );
        case TaskPriority.LOW:
          return (
            <Badge variant="outline" className={`${priorityColorMap[TaskPriority.LOW]} text-white border-0`}>
              LOW
            </Badge>
          );
        default:
          return (
            <Badge variant="outline">
              None
            </Badge>
          );
      }
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant="secondary" className={`${statusColorMap[status]} text-white`}>
          {snakeCaseToTitleCase(status)}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.$id;
      const projectId = row.original.projectId;
      
      return (
        <TaskActions id={id} projectId={projectId}>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </TaskActions>
      );
    },
  },
];
