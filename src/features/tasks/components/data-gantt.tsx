"use client";

import { useMemo, useEffect, useState } from "react";
import { Gantt, Willow, GanttTask, GanttLink, GanttScale, GanttColumn } from "wx-react-gantt";
import "wx-react-gantt/dist/gantt.css";
import { Task } from "../types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TaskGanttProps {
  data: Task[];
}

export const TaskGantt = ({ data }: TaskGanttProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(10); // Show 10 tasks per page

  // Add custom styles for proper scrollbar positioning
  useEffect(() => {
    const addCustomStyles = () => {
      const style = document.createElement('style');
      style.id = 'gantt-pagination-styles';
      style.textContent = `
        .wx-gantt {
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
        }
        .wx-gantt .wx-timeline {
          overflow-x: auto !important;
          overflow-y: visible !important;
        }
        .wx-gantt .wx-timeline-body {
          overflow-x: auto !important;
          overflow-y: visible !important;
        }
        .wx-gantt .wx-grid {
          overflow: visible !important;
        }
        /* Position scrollbar right after data */
        .wx-gantt .wx-scrollbar-horizontal {
          position: relative !important;
          margin-top: 0 !important;
          background: #f8fafc !important;
          height: 15px !important;
          border-top: 1px solid #e5e7eb !important;
        }
        /* Hide vertical scrollbar since we use pagination */
        .wx-gantt .wx-scrollbar-vertical {
          display: none !important;
        }
        /* Ensure container fits content */
        .gantt-container {
          height: auto !important;
          overflow: visible !important;
        }
      `;
      
      const existing = document.getElementById('gantt-pagination-styles');
      if (existing) existing.remove();
      
      document.head.appendChild(style);
    };

    addCustomStyles();
  }, []);

  const { paginatedTasks, totalPages, ganttTasks, ganttLinks, dateRange } = useMemo(() => {
    const validTasks = data.filter(task => task.startDate && task.dueDate);
    
    if (validTasks.length === 0) {
      return { 
        paginatedTasks: [], 
        totalPages: 0, 
        ganttTasks: [], 
        ganttLinks: [], 
        dateRange: { start: new Date(), end: new Date() } 
      };
    }

    // Calculate pagination
    const totalPages = Math.ceil(validTasks.length / tasksPerPage);
    const startIndex = (currentPage - 1) * tasksPerPage;
    const endIndex = startIndex + tasksPerPage;
    const paginatedTasks = validTasks.slice(startIndex, endIndex);

    // Calculate dynamic date range based on paginated tasks
    const allDates = paginatedTasks.flatMap(task => [
      new Date(task.startDate!),
      new Date(task.dueDate!)
    ]);
    
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    
    // Add some padding (7 days before and after)
    const startDate = new Date(minDate);
    startDate.setDate(startDate.getDate() - 7);
    
    const endDate = new Date(maxDate);
    endDate.setDate(endDate.getDate() + 7);

    const ganttTasks: GanttTask[] = paginatedTasks.map((task) => {
      const taskStartDate = new Date(task.startDate!);
      const taskEndDate = new Date(task.dueDate!);
      const duration = Math.ceil((taskEndDate.getTime() - taskStartDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        id: task.$id,
        text: task.name,
        start: taskStartDate,
        end: taskEndDate,
        duration: Math.max(1, duration),
        type: "task" as const,
        parent: 0,
        dueDate: taskEndDate.toLocaleDateString('en-GB'),
      };
    });

    const ganttLinks: GanttLink[] = [];
    let linkId = 1;

    paginatedTasks.forEach(task => {
      if (task.dependencyIds && task.dependencyIds.length > 0) {
        task.dependencyIds.forEach(depId => {
          // Only create links if both tasks are on the same page
          if (paginatedTasks.find(t => t.$id === depId)) {
            ganttLinks.push({
              id: linkId++,
              source: depId,
              target: task.$id,
              type: "e2s" as const
            });
          }
        });
      }
    });

    return { 
      paginatedTasks,
      totalPages,
      ganttTasks, 
      ganttLinks, 
      dateRange: { start: startDate, end: endDate }
    };
  }, [data, currentPage, tasksPerPage]);

  // Define custom columns
  const columns: GanttColumn[] = [
    { 
      id: "text", 
      header: "Task Name", 
      flexgrow: 2 
    },
    { 
      id: "start", 
      header: "Start Date", 
      width: 150,
      align: "center" 
    },
    { 
      id: "dueDate", 
      header: "Due Date", 
      width: 150,
      align: "center" 
    }
  ];

  // Configure scales for daily view
  const scales: GanttScale[] = [
    { 
      unit: "month" as const, 
      step: 1, 
      format: "MMM yyyy"
    },
    { 
      unit: "day" as const, 
      step: 1, 
      format: "d"
    }
  ];

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  if (data.filter(task => task.startDate && task.dueDate).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <div className="text-lg font-medium">No tasks with valid dates</div>
        <div className="text-sm">Tasks need both start and due dates to appear on the timeline</div>
        <div className="text-xs mt-2">Total tasks: {data.length}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Gantt Chart */}
      <div className="flex-1 gantt-container">
        <Willow>
          <Gantt 
            tasks={ganttTasks}
            links={ganttLinks}
            scales={scales}
            columns={columns}
            cellWidth={30}
            cellHeight={40}
            scaleHeight={40}
            lengthUnit="day"
            start={dateRange.start}
            end={dateRange.end}
          />
        </Willow>
      </div>

      {/* Pagination Controls - Similar to your table view */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t bg-white">
          <div className="flex items-center text-sm text-gray-700">
            <span>
              Showing {((currentPage - 1) * tasksPerPage) + 1} to {Math.min(currentPage * tasksPerPage, data.filter(task => task.startDate && task.dueDate).length)} of {data.filter(task => task.startDate && task.dueDate).length} tasks
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
