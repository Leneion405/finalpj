import { 
  FolderIcon, 
  ListChecksIcon, 
  UserIcon, 
  AlertTriangleIcon,
  Search,
  X,
  Filter
} from "lucide-react";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { DatePicker } from "@/components/date-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  hideAssigneeFilter?: boolean;
}

export const DataFilters = ({ 
  hideProjectFilter, 
  hideAssigneeFilter 
}: DataFiltersProps) => {
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

  const [
    { status, assigneeId, projectId, priority, startDate, dueDate, search },
    setFilters,
  ] = useTaskFilters();

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

  const onSearchChange = (value: string) => {
    setFilters({ search: value || null });
  };

  const clearAllFilters = () => {
    setFilters({
      status: null,
      assigneeId: null,
      projectId: null,
      priority: null,
      startDate: null,
      dueDate: null,
      search: null,
    });
  };

  // Count active filters
  const activeFiltersCount = [
    status,
    assigneeId,
    projectId,
    priority,
    startDate,
    dueDate,
    search,
  ].filter(Boolean).length;

  // Get display values for active filters
  const getStatusDisplay = () => {
    switch (status) {
      case TaskStatus.BACKLOG: return "Backlog";
      case TaskStatus.TODO: return "To Do";
      case TaskStatus.IN_PROGRESS: return "In Progress";
      case TaskStatus.IN_REVIEW: return "In Review";
      case TaskStatus.DONE: return "Done";
      default: return "All Statuses";
    }
  };

  const getPriorityDisplay = () => {
    switch (priority) {
      case TaskPriority.LOW: return "Low Priority";
      case TaskPriority.MEDIUM: return "Medium Priority";
      case TaskPriority.HIGH: return "High Priority";
      default: return "All Priorities";
    }
  };

  const getAssigneeDisplay = () => {
    if (!assigneeId) return "All Assignees";
    return memberOptions?.find(m => m.value === assigneeId)?.label || "Unknown";
  };

  const getProjectDisplay = () => {
    if (!projectId) return "All Projects";
    return projectOptions?.find(p => p.value === projectId)?.label || "Unknown";
  };

  if (isLoading) return null;

  return (
    <div className="space-y-3">
      {/* Compact One-Line Filter Bar */}
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
        {/* Search Input - NO BLACK OUTLINE */}
        <div className="relative flex-shrink-0 min-w-[280px] sm:min-w-[320px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search || ""}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9 h-10 text-sm focus:outline-none focus:ring-0 focus:border-blue-500 border-gray-300"
            style={{ outline: 'none' }}
          />
          {search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange("")}
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Status Filter - BIGGER WITH FULL NAME */}
        <Select value={status || "all"} onValueChange={onStatusChange}>
          <SelectTrigger className="h-10 w-[140px] text-sm">
            <div className="flex items-center gap-2">
              <ListChecksIcon className="h-4 w-4" />
              <span className="truncate">{getStatusDisplay()}</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectSeparator />
            <SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>
            <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
            <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
            <SelectItem value={TaskStatus.IN_REVIEW}>In Review</SelectItem>
            <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter - BIGGER WITH FULL NAME */}
        <Select value={priority || "all"} onValueChange={onPriorityChange}>
          <SelectTrigger className="h-10 w-[140px] text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangleIcon className="h-4 w-4" />
              <span className="truncate">{getPriorityDisplay()}</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectSeparator />
            <SelectItem value={TaskPriority.LOW}>Low Priority</SelectItem>
            <SelectItem value={TaskPriority.MEDIUM}>Medium Priority</SelectItem>
            <SelectItem value={TaskPriority.HIGH}>High Priority</SelectItem>
          </SelectContent>
        </Select>

        {/* Assignee Filter - BIGGER WITH FULL NAME */}
        {!hideAssigneeFilter && (
          <Select value={assigneeId || "all"} onValueChange={onAssigneeChange}>
            <SelectTrigger className="h-10 w-[140px] text-sm">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                <span className="truncate">{getAssigneeDisplay()}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              <SelectSeparator />
              {memberOptions?.map((member) => (
                <SelectItem key={member.value} value={member.value}>
                  {member.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Project Filter - BIGGER WITH FULL NAME */}
        {!hideProjectFilter && (
          <Select value={projectId || "all"} onValueChange={onProjectChange}>
            <SelectTrigger className="h-10 w-[140px] text-sm">
              <div className="flex items-center gap-2">
                <FolderIcon className="h-4 w-4" />
                <span className="truncate">{getProjectDisplay()}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectSeparator />
              {projectOptions?.map((project) => (
                <SelectItem key={project.value} value={project.value}>
                  {project.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Date Filters - BIGGER */}
        <DatePicker
          placeholder="Start Date"
          value={startDate ? new Date(startDate) : undefined}
          onChange={(date) => {
            setFilters({
              startDate: date ? date.toISOString() : null,
            });
          }}
          className="h-10 w-[120px] text-sm"
        />

        <DatePicker
          placeholder="Due Date"
          value={dueDate ? new Date(dueDate) : undefined}
          onChange={(date) => {
            setFilters({
              dueDate: date ? date.toISOString() : null,
            });
          }}
          className="h-10 w-[120px] text-sm"
        />

        {/* Clear All Button */}
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="h-10 px-4 text-sm flex-shrink-0"
          >
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Active Filter Chips - Mobile Only */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 sm:hidden">
          {search && (
            <Badge variant="outline" className="text-xs h-6 gap-1">
              Search: "{search.slice(0, 15)}{search.length > 15 ? '...' : ''}"
              <X className="h-2 w-2 cursor-pointer" onClick={() => onSearchChange("")} />
            </Badge>
          )}
          {status && (
            <Badge variant="outline" className="text-xs h-6 gap-1">
              Status: {getStatusDisplay()}
              <X className="h-2 w-2 cursor-pointer" onClick={() => onStatusChange("all")} />
            </Badge>
          )}
          {priority && (
            <Badge variant="outline" className="text-xs h-6 gap-1">
              Priority: {getPriorityDisplay()}
              <X className="h-2 w-2 cursor-pointer" onClick={() => onPriorityChange("all")} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
