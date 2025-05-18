import { PencilIcon } from "lucide-react";

import { DottedSeparator } from "@/components/dotted-separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { snakeCaseToTitleCase } from "@/lib/utils";

import { MemberAvatar } from "@/features/members/components/member-avatar";

import { OverviewProperty } from "./overview-property";
import { TaskDate } from "./task-date";
import { TaskDescription } from "./task-description";

import { useEditTaskModal } from "../hooks/use-edit-task-modal";
import { Task } from "../types";

interface TaskOverviewProps {
  task: Task;
}

export const TaskOverview = ({ task }: TaskOverviewProps) => {
  const { open } = useEditTaskModal();

  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-muted rounded-lg p-4">
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
            {task.assignee && (
              <>
                <MemberAvatar name={task.assignee.name} className="size-6" />
                <p className="text-sm font-medium">{task.assignee.name}</p>
              </>
            )}
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
          <DottedSeparator className="my-4" />
          <TaskDescription task={task} />
        </div>
      </div>
    </div>
  );
};
