import { FolderIcon, ListChecksIcon, UserIcon } from "lucide-react";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { DatePicker } from "@/components/date-picker";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTaskFilters } from "../hooks/use-task-filters";
import { TaskStatus } from "../types";

interface DataFiltersProps {
  hideProjectFilter?: boolean;
}

export const DataFilters = ({ hideProjectFilter }: DataFiltersProps) => {
  const workspaceId = useWorkspaceId();
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });
  const isLoading = isLoadingProjects || isLoadingMembers;
  
  const projectOptions = projects?.documents.map((project) => ({
    value: project.$id,
    label: project.name,
  }));
  
  const memberOptions = members?.documents.map((member) => ({
    value: member.$id,
    label: member.name,
  }));
  
  const [{ status, assigneeId, projectId, dueDate, startDate }, setFilters] = useTaskFilters();
  
  const onStatusChange = (value: string) => {
    if (value === "all") {
      setFilters({ status: null });
    } else {
      setFilters({ status: value as TaskStatus });
    }
  };
  
  const onAssigneeChange = (value: string) => {
    if (value === "all") {
      setFilters({ assigneeId: null });
    } else {
      setFilters({ assigneeId: value as string });
    }
  };
  
  const onProjectChange = (value: string) => {
    if (value === "all") {
      setFilters({ projectId: null });
    } else {
      setFilters({ projectId: value as string });
    }
  };

  // Add handlers for date filtering
  const onStartDateSelect = (date: Date | undefined) => {
    if (date) {
      setFilters({ startDate: date.toISOString() });
    } else {
      setFilters({ startDate: null });
    }
  };
  
  const onDueDateSelect = (date: Date | undefined) => {
    if (date) {
      setFilters({ dueDate: date.toISOString() });
    } else {
      setFilters({ dueDate: null });
    }
  };
  
  if (isLoading) return null;
  
  return (
    <div className="flex items-center gap-x-2 mb-4 flex-wrap">
      <Select value={status || "all"} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]">
          <ListChecksIcon className="size-4 mr-2" />
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectSeparator />
          <SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>
          <SelectItem value={TaskStatus.TODO}>Todo</SelectItem>
          <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
          <SelectItem value={TaskStatus.IN_REVIEW}>In Review</SelectItem>
          <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
        </SelectContent>
      </Select>

      {!hideProjectFilter && (
        <Select value={projectId || "all"} onValueChange={onProjectChange}>
          <SelectTrigger className="w-[180px]">
            <FolderIcon className="size-4 mr-2" />
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            <SelectSeparator />
            {projectOptions?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select value={assigneeId || "all"} onValueChange={onAssigneeChange}>
        <SelectTrigger className="w-[180px]">
          <UserIcon className="size-4 mr-2" />
          <SelectValue placeholder="Assignee" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Assignees</SelectItem>
          <SelectSeparator />
          {memberOptions?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Add Start Date filter */}
      <div className="w-[180px]">
        <DatePicker
          value={startDate ? new Date(startDate) : undefined} 
          onChange={onStartDateSelect}
          placeholder="Filter by Start Date"
        />
      </div>

      <div className="w-[180px]">
        <DatePicker
          value={dueDate ? new Date(dueDate) : undefined}
          onChange={onDueDateSelect}
          placeholder="Filter by Due Date"
        />
      </div>
    </div>
  );
};
