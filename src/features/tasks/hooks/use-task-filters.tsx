import { useQueryState } from "nuqs";
import { TaskStatus } from "../types";

export const useTaskFilters = () => {
  const [status, setStatus] = useQueryState("status");
  const [assigneeId, setAssigneeId] = useQueryState("assigneeId");
  const [projectId, setProjectId] = useQueryState("projectId");
  const [dueDate, setDueDate] = useQueryState("dueDate");
  const [startDate, setStartDate] = useQueryState("startDate"); // Add this line
  
  const setFilters = ({
    status: newStatus,
    assigneeId: newAssigneeId,
    projectId: newProjectId,
    dueDate: newDueDate,
    startDate: newStartDate, // Add this line
  }: {
    status?: TaskStatus | null;
    assigneeId?: string | null;
    projectId?: string | null;
    dueDate?: string | null;
    startDate?: string | null; // Add this line
  } = {}) => {
    if (newStatus !== undefined) {
      setStatus(newStatus);
    }
    
    if (newAssigneeId !== undefined) {
      setAssigneeId(newAssigneeId);
    }
    
    if (newProjectId !== undefined) {
      setProjectId(newProjectId);
    }
    
    if (newDueDate !== undefined) {
      setDueDate(newDueDate);
    }
    
    if (newStartDate !== undefined) {
      setStartDate(newStartDate);
    }
  };
  
  return [
    { status: status as TaskStatus | null, assigneeId, projectId, dueDate, startDate }, // Add startDate
    setFilters,
  ] as const;
};
