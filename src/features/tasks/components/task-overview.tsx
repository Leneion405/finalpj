import { PencilIcon } from "lucide-react";
import { differenceInDays } from "date-fns";

import { DottedSeparator } from "@/components/dotted-separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { snakeCaseToTitleCase, cn } from "@/lib/utils";

import { MemberAvatar } from "@/features/members/components/member-avatar";

import { OverviewProperty } from "./overview-property";
import { TaskDate } from "./task-date";
import { TaskDescription } from "./task-description";

import { useEditTaskModal } from "../hooks/use-edit-task-modal";
import { useGetTasks } from "../api/use-get-tasks";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Task, TaskPriority } from "../types";

interface TaskOverviewProps {
  task: Task;
}

export const TaskOverview = ({ task }: TaskOverviewProps) => {
  const { open } = useEditTaskModal();
  const workspaceId = useWorkspaceId();
  
  // Get all tasks to resolve dependency names
  const { data: tasks } = useGetTasks({ workspaceId });

  // Get due date urgency border
  const getDueDateBorder = (dueDate?: string) => {
    if (!dueDate) return "";
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffInDays = differenceInDays(due, today);

    if (diffInDays <= 3) {
      return "border-l-4 border-l-red-500";
    } else if (diffInDays <= 7) {
      return "border-l-4 border-l-orange-500";
    } else if (diffInDays <= 14) {
      return "border-l-4 border-l-yellow-500";
    }
    return "";
  };

  // Get priority badge with colored background and white text
  const getPriorityBadge = (priority?: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return (
          <Badge className="bg-red-500 text-white hover:bg-red-600 flex items-center gap-x-1">
            <div className="size-2 rounded-full bg-white" />
            High
          </Badge>
        );
      case TaskPriority.MEDIUM:
        return (
          <Badge className="bg-yellow-500 text-white hover:bg-yellow-600 flex items-center gap-x-1">
            <div className="size-2 rounded-full bg-white" />
            Medium
          </Badge>
        );
      case TaskPriority.LOW:
      default:
        return (
          <Badge className="bg-gray-500 text-white hover:bg-gray-600 flex items-center gap-x-1">
            <div className="size-2 rounded-full bg-white" />
            Low
          </Badge>
        );
    }
  };

  // Get dependency task names
  const getDependencyTasks = (dependencyIds?: string[]) => {
    if (!dependencyIds || !tasks?.documents) return [];
    
    return dependencyIds
      .map(id => tasks.documents.find(task => task.$id === id))
      .filter(Boolean)
      .map(task => ({ id: task!.$id, name: task!.name }));
  };

  const dependencyTasks = getDependencyTasks(task.dependencyIds);

  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className={cn(
        "bg-muted rounded-lg p-4",
        getDueDateBorder(task.dueDate)
      )}>
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Overview</p>
          <Button onClick={() => open(task.$id)} size="sm" variant="secondary">
            <PencilIcon className="size-4 mr-2" />
            Edit
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <div className="flex flex-col gap-y-4">
          <OverviewProperty label="Assignee">
            {task.assignee ? (
              <>
                <MemberAvatar name={task.assignee.name} className="size-6" />
                <p className="text-sm font-medium">{task.assignee.name}</p>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">Unassigned</span>
            )}
          </OverviewProperty>

          <OverviewProperty label="Priority">
            {getPriorityBadge(task.priority)}
          </OverviewProperty>

          <OverviewProperty label="Start Date">
            <TaskDate value={task.startDate ?? ""} className="text-xs" />
          </OverviewProperty>

          <OverviewProperty label="Due Date">
            <TaskDate value={task.dueDate ?? ""} className="text-xs" isDueDate={true} />
          </OverviewProperty>

          <OverviewProperty label="Status">
            <Badge variant={task.status}>
              {snakeCaseToTitleCase(task.status)}
            </Badge>
          </OverviewProperty>

          {/* Dependencies Section */}
          {dependencyTasks.length > 0 && (
            <OverviewProperty label="Dependencies">
              <div className="flex flex-col gap-y-2">
                {dependencyTasks.map((depTask) => (
                  <div key={depTask.id} className="flex text-sm text-muted-foreground items-center gap-x-2">
                    <Badge variant="outline" className="text-xs">
                      Task-{depTask.id.slice(-3)}
                    </Badge>
                    <span className="truncate">
                      {depTask.name}
                    </span>
                  </div>
                ))}
              </div>
            </OverviewProperty>
          )}

          <DottedSeparator className="my-4" />
          <TaskDescription task={task} />
        </div>
      </div>
    </div>
  );
};
