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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Expandable text component for long descriptions
const ExpandableText = ({ text, maxLength = 200 }: { text: string; maxLength?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (text.length <= maxLength) {
    return <p className="text-muted-foreground text-base mt-1 leading-relaxed">{text}</p>;
  }
  
  const truncatedText = text.slice(0, maxLength);
  
  return (
    <div className="mt-1">
      <p className="text-muted-foreground text-base leading-relaxed">
        {isExpanded ? text : `${truncatedText}...`}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1 flex items-center gap-1 transition-colors"
      >
        {isExpanded ? (
          <>
            Show less <ChevronUp className="w-3 h-3" />
          </>
        ) : (
          <>
            Show more <ChevronDown className="w-3 h-3" />
          </>
        )}
      </button>
    </div>
  );
};

// Fixed workspace avatar component
const WorkspaceAvatar = ({ name, className }: { name: string; className?: string }) => {
  return (
    <div className={cn(
      "flex-shrink-0 h-16 w-16 rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold text-xl",
      className
    )}>
      {name?.charAt(0).toUpperCase()}
    </div>
  );
};

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
          <div className="w-full max-w-15xl mx-auto py-3">
            <div className="flex flex-col pt-0.5 px-0">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild className="h-9 px-3">
                  <Link href={`/workspaces/${workspaceId}`} className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </Link>
                </Button>
              </div>
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
          <div className="w-full max-w-15xl mx-auto">
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

  // Default dashboard view with fixed layout
  return (
    <div className="h-full flex flex-col space-y-4">
      {workspace && (
        <div className="flex items-start gap-x-4 mb-4">
          {/* Fixed size avatar that won't shrink */}
          <WorkspaceAvatar name={workspace.name} />
          
          {/* Content area with proper text handling */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground break-words">
              {workspace.name}
            </h1>
            {workspace.description && (
              <ExpandableText 
                text={workspace.description} 
                maxLength={200} 
              />
            )}
          </div>
        </div>
      )}

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
