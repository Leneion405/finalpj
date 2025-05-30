"use client";

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
import { RecentProjects } from "@/features/projects/components/recent-projects";
import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { DeleteWorkspaceCard } from "@/features/workspaces/components/delete-workspace-form";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useSearchParams, useRouter } from "next/navigation";
import { Project } from "@/features/projects/types";
import { Separator } from "@/components/ui/separator";
import { RecentMembers } from "@/features/members/components/recent-members";
import { MembersList } from "@/features/workspaces/components/members-list";

export const WorkspaceIdClient = () => {
  const workspaceId = useWorkspaceId();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const currentSection = searchParams.get('section');
  
  const { data: analytics, isLoading: isLoadingAnalytics } = useGetWorkspaceAnalytics({ workspaceId });
  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({ workspaceId });
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });
  const { data: workspace, isLoading: isLoadingWorkspace } = useGetWorkspace({ workspaceId });

  const isLoading = isLoadingAnalytics || isLoadingTasks || isLoadingProjects || isLoadingMembers || isLoadingWorkspace;

  if (isLoading) {
    return <PageLoader />;
  }

  // Show settings if section=settings
  if (currentSection === "settings") {
    if (!workspace) {
      return <PageError message="Workspace not found" />;
    }
    
    return (
      <div className="w-full h-auto py-2">
        <main>
          <div className="w-full max-w-3xl mx-auto py-3">
            <h2 className="text-[20px] leading-[30px] font-semibold mb-6">
              Workspace settings
            </h2>

            <div className="flex flex-col pt-0.5 px-0">
              <div className="pt-2">
                <EditWorkspaceForm 
                  initialValues={workspace}
                  onCancel={() => {
                    router.push(`/workspaces/${workspaceId}`);
                  }}
                />
              </div>
              
              <Separator className="my-6" />
              
              <div className="pt-2">
                <DeleteWorkspaceCard workspace={workspace} />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show members if section=members
  if (currentSection === "members") {
    return (
      <div className="w-full h-auto py-2">
        <main>
          <div className="w-full max-w-3xl mx-auto py-3">
            <h2 className="text-[20px] leading-[30px] font-semibold mb-6">
              Members
            </h2>

            <div className="flex flex-col pt-0.5 px-0">
              <div className="pt-2">
                <MembersList />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Handle undefined data with fallbacks
  if (!analytics || !tasks || !projects) {
    return <PageError message="Failed to load workspace data" />;
  }

  // Default dashboard view (your existing code)
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
            <RecentProjects 
              data={projects.documents as Project[]} 
              total={projects.total} 
            />
          </TabsContent>
          <TabsContent value="tasks">
            <RecentTasks 
              data={tasks.documents} 
              total={tasks.total} 
            />
          </TabsContent>
          <TabsContent value="members">
            <RecentMembers 
              data={members?.documents || []} 
              total={members?.total || 0} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
