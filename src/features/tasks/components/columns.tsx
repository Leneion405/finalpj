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

import { Task, TaskPriority } from "../types";

export const columns: ColumnDef<Task>[] = [
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
      return <p className="line-clamp-1">{name}</p>;
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
      return (
        <div className="flex items-center gap-x-2 text-sm font-medium">
          <ProjectAvatar
            className="size-6"
            name={project.name}
            image={project.imageUrl}
          />
          <p className="line-clamp-1">{project.name}</p>
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
      return (
        <div className="flex items-center gap-x-2 text-sm font-medium">
          <MemberAvatar
            className="size-6"
            fallbackClassName="text-xs"
            name={assignee.name}
          />
          <p className="line-clamp-1">{assignee.name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Start Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const startDate = row.original.startDate;
      if (!startDate) {
        return <span className="text-xs text-muted-foreground">No start date</span>;
      }
      return <TaskDate value={startDate} className="text-xs" />;
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
        return <span className="text-xs text-muted-foreground">No due date</span>;
      }
      return <TaskDate value={dueDate} className="text-xs" isDueDate={true} />;
    },
  },
  // Priority Column
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
      const priority = row.original.priority;
      
      const getPriorityBadge = (priority?: TaskPriority) => {
        switch (priority) {
          case TaskPriority.HIGH:
            return (
              <Badge className="bg-red-500 text-white hover:bg-red-600 text-xs">
                HIGH
              </Badge>
            );
          case TaskPriority.MEDIUM:
            return (
              <Badge className="bg-yellow-500 text-white hover:bg-yellow-600 text-xs">
                MEDIUM
              </Badge>
            );
          case TaskPriority.LOW:
          default:
            return (
              <Badge className="bg-gray-500 text-white hover:bg-gray-600 text-xs">
                LOW
              </Badge>
            );
        }
      };

      return getPriorityBadge(priority);
    },
    sortingFn: (rowA, rowB, columnId) => {
      const priorityOrder = {
        [TaskPriority.HIGH]: 3,
        [TaskPriority.MEDIUM]: 2,
        [TaskPriority.LOW]: 1,
      };
      
      const aPriority = priorityOrder[rowA.original.priority || TaskPriority.LOW];
      const bPriority = priorityOrder[rowB.original.priority || TaskPriority.LOW];
      
      return aPriority - bPriority;
    },
  },
  // Dependencies Column
  {
    accessorKey: "dependencyIds",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Dependencies
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const dependencyIds = row.original.dependencyIds;
      
      if (!dependencyIds || dependencyIds.length === 0) {
        return <span className="text-xs text-muted-foreground">No dependencies</span>;
      }

      return (
        <div className="flex flex-wrap gap-1">
          {dependencyIds.slice(0, 2).map((depId) => (
            <Badge key={depId} variant="outline" className="text-xs">
              Task-{depId.slice(-3)}
            </Badge>
          ))}
          {dependencyIds.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{dependencyIds.length - 2} more
            </Badge>
          )}
        </div>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const aDeps = rowA.original.dependencyIds?.length || 0;
      const bDeps = rowB.original.dependencyIds?.length || 0;
      return aDeps - bDeps;
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
      return <Badge variant={status}>{snakeCaseToTitleCase(status)}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.$id;
      const projectId = row.original.projectId;
      return (
        <TaskActions id={id} projectId={projectId}>
          <Button variant="ghost" className="size-8 p-0">
            <MoreVertical className="size-4" />
          </Button>
        </TaskActions>
      );
    },
  },
];
