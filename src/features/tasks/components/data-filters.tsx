import { FolderIcon, ListChecksIcon, UserIcon, AlertTriangleIcon } from "lucide-react";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

import { DatePicker } from "@/components/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useTaskFilters } from "../hooks/use-task-filters";
import { TaskStatus, TaskPriority } from "../types";

interface DataFiltersProps {
  hideProjectFilter?: boolean;
}

export const DataFilters = ({ hideProjectFilter }: DataFiltersProps) => {
  const workspaceId = useWorkspaceId();

  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
    workspaceId,
  });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });

  const isLoading = isLoadingProjects || isLoadingMembers;

  const projectOptions = projects?.documents.map((project) => ({
    value: project.$id,
    label: project.name,
  }));

  const memberOptions = members?.documents.map((member) => ({
    value: member.$id,
    label: member.name,
  }));

  // Get filters and setter - now includes priority
  const [{ status, assigneeId, projectId, priority, startDate, dueDate }, setFilters] = useTaskFilters();

  const onStatusChange = (value: string) => {
    setFilters({ status: value === "all" ? null : (value as TaskStatus) });
  };

  const onAssigneeChange = (value: string) => {
    setFilters({ assigneeId: value === "all" ? null : value });
  };

  const onProjectChange = (value: string) => {
    setFilters({ projectId: value === "all" ? null : value });
  };

  const onPriorityChange = (value: string) => {
    setFilters({ priority: value === "all" ? null : (value as TaskPriority) });
  };

  if (isLoading) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-2">
      {/* Status Filter */}
      <Select
        defaultValue={status ?? undefined}
        onValueChange={(value) => onStatusChange(value)}
      >
        <SelectTrigger className="w-full lg:w-auto h-10">
          <div className="flex items-center pr-2">
            <ListChecksIcon className="size-4 mr-2" />
            <SelectValue placeholder="All statuses" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectSeparator />
          <SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>
          <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
          <SelectItem value={TaskStatus.IN_REVIEW}>In Review</SelectItem>
          <SelectItem value={TaskStatus.TODO}>Todo</SelectItem>
          <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
        </SelectContent>
      </Select>

      {/* Priority Filter */}
      <Select
        defaultValue={priority ?? undefined}
        onValueChange={(value) => onPriorityChange(value)}
      >
        <SelectTrigger className="w-full lg:w-auto h-10">
          <div className="flex items-center pr-2">
            <AlertTriangleIcon className="size-4 mr-2" />
            <SelectValue placeholder="All priorities" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          <SelectSeparator />
          <SelectItem value={TaskPriority.HIGH}>
            <div className="flex items-center gap-x-2">
              <div className="size-2 rounded-full bg-red-500" />
              High
            </div>
          </SelectItem>
          <SelectItem value={TaskPriority.MEDIUM}>
            <div className="flex items-center gap-x-2">
              <div className="size-2 rounded-full bg-yellow-500" />
              Medium
            </div>
          </SelectItem>
          <SelectItem value={TaskPriority.LOW}>
            <div className="flex items-center gap-x-2">
              <div className="size-2 rounded-full bg-gray-500" />
              Low
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Assignee Filter */}
      <Select
        defaultValue={assigneeId ?? undefined}
        onValueChange={(value) => onAssigneeChange(value)}
      >
        <SelectTrigger className="w-full lg:w-auto h-10">
          <div className="flex items-center pr-2">
            <UserIcon className="size-4 mr-2" />
            <SelectValue placeholder="All assignees" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All assignees</SelectItem>
          <SelectSeparator />
          {memberOptions?.map((member) => (
            <SelectItem key={member.value} value={member.value}>
              {member.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Project Filter */}
      {!hideProjectFilter && (
        <Select
          defaultValue={projectId ?? undefined}
          onValueChange={(value) => onProjectChange(value)}
        >
          <SelectTrigger className="w-full lg:w-auto h-10">
            <div className="flex items-center pr-2">
              <FolderIcon className="size-4 mr-2" />
              <SelectValue placeholder="All projects" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            <SelectSeparator />
            {projectOptions?.map((project) => (
              <SelectItem key={project.value} value={project.value}>
                {project.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Start Date Filter */}
      <DatePicker
        placeholder="Start date"
        className="w-full lg:w-auto h-10"
        value={startDate ? new Date(startDate) : undefined}
        onChange={(date) => {
          setFilters({
            startDate: date ? date.toISOString() : null,
          });
        }}
      />

      {/* Due Date Filter */}
      <DatePicker
        placeholder="Due date"
        className="w-full lg:w-auto h-10"
        value={dueDate ? new Date(dueDate) : undefined}
        onChange={(date) => {
          setFilters({
            dueDate: date ? date.toISOString() : null,
          });
        }}
      />
    </div>
  );
};
