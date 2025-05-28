"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Analytics } from "@/components/analytics";
import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-workspace-analytics";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { RecentTasks } from "@/features/tasks/components/recent-tasks";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";

export const WorkspaceIdClient = () => {
  const workspaceId = useWorkspaceId();
  const { open: onOpen } = useCreateProjectModal(); // Add this line
  
  const { data: analytics, isLoading: isLoadingAnalytics } = useGetWorkspaceAnalytics({ workspaceId });
  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({ workspaceId });
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });

  const isLoading = isLoadingAnalytics || isLoadingTasks || isLoadingProjects || isLoadingMembers;

  if (isLoading) {
    return <PageLoader />;
  }

  if (!analytics || !tasks || !projects || !members) {
    return <PageError message="Failed to load workspace data." />;
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <Analytics data={analytics} />
      <div className="mt-4">
        <Tabs defaultValue="projects" className="w-full border rounded-lg p-2">
          <TabsList className="w-full justify-start border-0 bg-gray-50 px-1 h-12">
            <TabsTrigger className="py-2" value="projects">
              Recent Projects
            </TabsTrigger>
            <TabsTrigger className="py-2" value="tasks">
              Recent Tasks
            </TabsTrigger>
            <TabsTrigger className="py-2" value="members">
              Recent Members
            </TabsTrigger>
          </TabsList>
          <TabsContent value="projects">
            {/* Add your recent projects component here */}
          </TabsContent>
          <TabsContent value="tasks">
            <RecentTasks data={tasks.documents} total={tasks.total} />
          </TabsContent>
          <TabsContent value="members">
            {/* Add your recent members component here */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
