"use client";

import { LoaderIcon, PlusIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import { useCallback } from "react";
import dynamic from "next/dynamic";

import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { columns } from "./columns";
import { DataCalendar } from "./data-calendar";
import { DataFilters } from "./data-filters";
import { DataKanban } from "./data-kanban";
import { DataTable } from "./data-table";

import { useGetTasks } from "../api/use-get-tasks";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { useTaskFilters } from "../hooks/use-task-filters";
import { TaskStatus } from "../types";
import { useBulkUpdateTasks } from "../api/use-bulk-update-tasks";

// Dynamic import for Gantt to avoid SSR issues
const TaskGantt = dynamic(() => import("./data-gantt").then(mod => ({ default: mod.TaskGantt })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
      <span className="ml-2">Loading Gantt Chart...</span>
    </div>
  )
});

interface TaskViewSwitcherProps {
  hideProjectFilter?: boolean;
}

export const TaskViewSwitcher = ({
  hideProjectFilter,
}: TaskViewSwitcherProps) => {
  const [{ status, assigneeId, projectId, priority, startDate, dueDate }] = useTaskFilters();
  const [view, setView] = useQueryState("task-view", { defaultValue: "table" });
  const { mutate: bulkUpdate } = useBulkUpdateTasks();

  const workspaceId = useWorkspaceId();
  const paramProjectId = useProjectId();
  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
    workspaceId,
    projectId: paramProjectId || projectId,
    assigneeId,
    status,
    priority,
    startDate,
    dueDate,
  });

  const onKanbanChange = useCallback(
    (tasks: { $id: string; status: TaskStatus; position: number }[]) => {
      bulkUpdate({ json: { tasks } });
    },
    [bulkUpdate]
  );

  const { open } = useCreateTaskModal();

  return (
    <Tabs
      defaultValue={view}
      onValueChange={setView}
      className="flex-1 w-full border rounded-lg h-full"
    >
      <div className="h-full flex flex-col">
        <div className="flex-shrink-0 p-4 border-b">
          <div className="flex flex-col gap-y-2 lg:flex-row justify-between items-center">
            <TabsList className="w-full lg:w-auto">
              <TabsTrigger className="h-8 w-full lg:w-auto" value="table">
                Table
              </TabsTrigger>
              <TabsTrigger className="h-8 w-full lg:w-auto" value="kanban">
                Kanban
              </TabsTrigger>
              <TabsTrigger className="h-8 w-full lg:w-auto" value="calendar">
                Calendar
              </TabsTrigger>
              <TabsTrigger className="h-8 w-full lg:w-auto" value="gantt">
                Gantt
              </TabsTrigger>
            </TabsList>
            <Button onClick={open} size="sm" className="w-full lg:w-auto">
              <PlusIcon className="size-4 mr-2" />
              New
            </Button>
          </div>
          <DottedSeparator className="my-4" />
          <DataFilters hideProjectFilter={hideProjectFilter} />
          <DottedSeparator className="my-4" />
        </div>
        
        <div className="flex-1 overflow-hidden">
          {isLoadingTasks ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <LoaderIcon className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <TabsContent value="table" className="mt-0 h-full p-4">
                <DataTable columns={columns} data={tasks?.documents ?? []} />
              </TabsContent>
              <TabsContent value="kanban" className="mt-0 h-full p-4">
                <DataKanban
                  data={tasks?.documents ?? []}
                  onChange={onKanbanChange}
                />
              </TabsContent>
              <TabsContent value="calendar" className="mt-0 h-full p-4">
                <DataCalendar data={tasks?.documents ?? []} />
              </TabsContent>
              {/* Updated Gantt tab with better sizing */}
              <TabsContent value="gantt" className="mt-0 h-full p-2">
                <div className="w-full h-full border rounded-lg bg-white overflow-hidden" style={{ height: "calc(100vh - 250px)" }}>
                  <TaskGantt data={tasks?.documents ?? []} />
                </div>
              </TabsContent>
            </>
          )}
        </div>
      </div>
    </Tabs>
  );
};
