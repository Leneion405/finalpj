"use client";

import React, { useMemo } from "react";
import { Task as JiraTask, TaskStatus } from "../types";
import { FrappeGantt, Task, ViewMode } from "@toyokoh/frappe-gantt-react";

interface DataGanttProps {
  data: JiraTask[];
}

export const DataGantt = ({ data }: DataGanttProps) => {
  // Transform your tasks into the format expected by Frappe Gantt
  const ganttTasks = useMemo(() => {
    return data.map((task) => {
      // Create a proper Task instance using the Task class
      return new Task({
        id: task.$id,
        name: task.name,
        start: task.startDate || task.dueDate, // Use startDate if available, otherwise fallback to dueDate
        end: task.dueDate,
        progress: task.status === TaskStatus.DONE ? 100 : 
                 task.status === TaskStatus.IN_REVIEW ? 75 :
                 task.status === TaskStatus.IN_PROGRESS ? 50 :
                 task.status === TaskStatus.TODO ? 25 : 
                 task.status === TaskStatus.BACKLOG ? 0 : 0,
        dependencies: "", // Add dependencies if you implement that feature
      });
    });
  }, [data]);

  return (
    <div className="gantt-container">
      {ganttTasks.length > 0 ? (
        <FrappeGantt
          tasks={ganttTasks}
          viewMode={ViewMode.Month} // Use the enum value instead of string
          onClick={(task) => console.log("Task clicked:", task)}
          onDateChange={(task, start, end) => {
            console.log("Date changed:", task, start, end);
            // Implement date change handling
          }}
          onProgressChange={(task, progress) => {
            console.log("Progress changed:", task, progress);
            // Implement progress change handling
          }}
          onTasksChange={(tasks) => {
            console.log("Tasks changed:", tasks);
            // Implement tasks change handling
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No tasks to display.</p>
        </div>
      )}
    </div>
  );
};
