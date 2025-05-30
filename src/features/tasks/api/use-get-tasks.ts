import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

import { TaskStatus, TaskPriority } from "../types"; // <-- ADD TaskPriority import

interface UseGetTasksProps {
  workspaceId: string;
  projectId?: string | null;
  status?: TaskStatus | null;
  assigneeId?: string | null;
  dueDate?: string | null;
  startDate?: string | null;
  search?: string | null;
  priority?: TaskPriority | null; // <-- ADD THIS LINE
}

export const useGetTasks = ({
  workspaceId,
  projectId,
  status,
  assigneeId,
  startDate,
  dueDate,
  search,
  priority, // <-- ADD THIS LINE
}: UseGetTasksProps) => {
  const query = useQuery({
    queryKey: [
      "tasks",
      workspaceId,
      projectId,
      status,
      assigneeId,
      startDate,
      dueDate,
      search,
      priority, // <-- ADD THIS LINE
    ],
    queryFn: async () => {
      const response = await client.api.tasks.$get({
        query: {
          workspaceId,
          projectId: projectId ?? undefined,
          status: status ?? undefined,
          assigneeId: assigneeId ?? undefined,
          dueDate: dueDate ?? undefined,
          startDate: startDate ?? undefined,
          search: search ?? undefined,
          priority: priority ?? undefined, // <-- ADD THIS LINE
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tasks.");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
