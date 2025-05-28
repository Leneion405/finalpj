"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DottedSeparator } from "@/components/dotted-separator";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { differenceInDays, format } from "date-fns";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-task-modal";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { Task, TaskPriority } from "@/features/tasks/types";
import { cn } from "@/lib/utils";
import { snakeCaseToTitleCase } from "@/lib/utils";

interface RecentTasksProps {
  data: Task[];
  total: number;
}

export const RecentTasks = ({ data, total }: RecentTasksProps) => {
  const workspaceId = useWorkspaceId();
  const { open: createTask } = useCreateTaskModal();

  // Use the exact same logic as TaskDate component
  const getDueDateColor = (dueDate: string | undefined) => {
    if (!dueDate) return "text-muted-foreground";
    
    const today = new Date();
    const date = new Date(dueDate);
    const diffInDays = differenceInDays(date, today);

    let textColor = "text-muted-foreground"; // Default color

    // Apply the exact same logic as TaskDate component
    if (diffInDays <= 3) {
      textColor = "text-red-500";  // Red if due in 3 days or less
    } else if (diffInDays <= 7) {
      textColor = "text-orange-500";  // Orange if due in 7 days or less
    } else if (diffInDays <= 14) {
      textColor = "text-yellow-500";  // Yellow if due in 14 days or less
    }
    // For future dates (>14 days), keep default text-muted-foreground

    return textColor;
  };

  // Get priority badge with colored background and white text
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

  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <p className="text-lg font-semibold">Recent Tasks</p>
            <Badge variant="secondary">({total} total)</Badge>
          </div>
          <Button variant="muted" size="icon" onClick={createTask}>
            <PlusIcon className="size-4 text-neutral-400" />
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <ul className="flex flex-col gap-y-4">
          {data.length === 0 ? (
            <li className="text-sm text-muted-foreground text-center">
              No recent tasks found
            </li>
          ) : (
            data.map((task) => {
              return (
                <li key={task.$id}>
                  <Link href={`/workspaces/${workspaceId}/tasks/${task.$id}`}>
                    <Card className="shadow-none rounded-lg hover:opacity-75 transition">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          {/* Left side - Task info */}
                          <div className="flex flex-col gap-y-1 flex-1">
                            {/* Task ID */}
                            <p className="text-sm text-muted-foreground font-mono">
                              Task-{task.$id.slice(-3)}
                            </p>
                            
                            {/* Task Name */}
                            <p className="text-lg font-medium">{task.name}</p>
                            
                            {/* Due Date with exact TaskDate styling */}
                            <div className="flex items-center gap-x-2">
                              <CalendarIcon className={cn("size-3", getDueDateColor(task.dueDate))} />
                              <div className={cn(getDueDateColor(task.dueDate))}>
                                <span className="text-sm font-medium truncate">
                                  Due: {task.dueDate 
                                    ? format(new Date(task.dueDate), "PPP")
                                    : "No due date"}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Right side - Priority, Status Badge, then Avatar */}
                          <div className="flex items-center gap-x-2">
                            {/* Priority Badge - First (colored) */}
                            {getPriorityBadge(task.priority)}
                            
                            {/* Status Badge - Second */}
                            <Badge variant={task.status}>
                              {snakeCaseToTitleCase(task.status)}
                            </Badge>
                            
                            {/* Member Avatar - Third */}
                            {task.assigneeId && (task as any).assignee ? (
                              <MemberAvatar
                                name={(task as any).assignee.name}
                                className="size-8"
                                fallbackClassName="text-sm"
                              />
                            ) : (
                              <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">?</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              );
            })
          )}
        </ul>
        <Button variant="muted" className="mt-4 w-full" asChild>
          <Link href={`/workspaces/${workspaceId}/tasks`}>Show All</Link>
        </Button>
      </div>
    </div>
  );
};
