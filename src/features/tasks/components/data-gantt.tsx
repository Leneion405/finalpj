"use client";

import { ViewMode, Gantt, Task as GanttTask } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { Task } from "../types";
import { useEffect, useState } from "react";

interface TaskGanttProps {
  data: Task[];
}

export const TaskGantt = ({ data }: TaskGanttProps) => {
  const [listCellWidth, setListCellWidth] = useState("250px");

  useEffect(() => {
    const updateListCellWidth = () => {
      if (window.innerWidth <= 480) {
        setListCellWidth("100px"); // Extra small screens
      } else if (window.innerWidth <= 768) {
        setListCellWidth("150px"); // Small screens
      } else if (window.innerWidth <= 1024) {
        setListCellWidth("200px"); // Medium screens
      } else {
        setListCellWidth("250px"); // Large screens
      }
    };

    // Set initial value
    updateListCellWidth();

    // Add event listener
    window.addEventListener("resize", updateListCellWidth);

    // Cleanup
    return () => window.removeEventListener("resize", updateListCellWidth);
  }, []);

  const tasks: GanttTask[] = data
    .filter((task) => task.startDate && task.dueDate)
    .map((task, index) => {
      const start = new Date(task.startDate!);
      const end = new Date(task.dueDate!);

      const statusColorMap: Record<string, string> = {
        BACKLOG: "#d8b4fe",     // light purple
        TODO: "#fecaca",        // light red
        IN_PROGRESS: "#fef08a", // light yellow
        IN_REVIEW: "#bfdbfe",   // light blue
        DONE: "#bbf7d0",        // light green
      };

      const bg = statusColorMap[task.status] || "#e5e7eb";

      return {
        id: task.$id,
        name: task.name,
        type: "task" as const,
        start,
        end,
        progress: 0,
        project: task.projectId,
        hideChildren: false,
        displayOrder: index,
        styles: {
          backgroundColor: bg,
          progressColor: bg,
        },
      };
    });

  if (!tasks.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <p className="text-gray-500 text-lg font-medium">No tasks with dates</p>
          <p className="text-gray-400 text-sm mt-1">Add start and due dates to see tasks on the timeline</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Gantt
        tasks={tasks}
        viewMode={ViewMode.Month}
        listCellWidth={listCellWidth}
        rowHeight={40}
        columnWidth={60}
        fontSize="12px"
        fontFamily="Inter, system-ui, sans-serif"
        locale="en-US"
      />
    </div>
  );
};
