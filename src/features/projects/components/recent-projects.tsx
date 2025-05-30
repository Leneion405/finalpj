"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DottedSeparator } from "@/components/dotted-separator";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { Project } from "@/features/projects/types";

interface RecentProjectsProps {
  data: Project[];
  total: number;
}

export const RecentProjects = ({ data, total }: RecentProjectsProps) => {
  const workspaceId = useWorkspaceId();
  const { open: createProject } = useCreateProjectModal();

  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <p className="text-lg font-semibold">Recent Projects</p>
            <Badge variant="secondary">({total} total)</Badge>
          </div>
          <Button variant="muted" size="icon" onClick={createProject}>
            <PlusIcon className="size-4 text-neutral-400" />
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <ul className="flex flex-col gap-y-4">
          {data.length === 0 ? (
            <li className="text-sm text-muted-foreground text-center">
              No recent projects found
            </li>
          ) : (
            data.map((project) => {
              return (
                <li key={project.$id}>
                  <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
                    <Card className="shadow-none rounded-lg hover:opacity-75 transition">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-x-3">
                          {/* Project Avatar - Left */}
                          <ProjectAvatar
                            image={project.imageUrl}
                            name={project.name}
                            className="size-12"
                            fallbackClassName="text-lg"
                          />
                          
                          {/* Project Info - Center */}
                          <div className="flex flex-col gap-y-1 flex-1">
                            {/* Project Name */}
                            <p className="text-lg font-medium line-clamp-1">
                              {project.name}
                            </p>
                            
                            {/* Created Date - Handle missing createdAt */}
                            <div className="flex items-center gap-x-2">
                              <CalendarIcon className="size-3 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {project.createdAt 
                                  ? format(new Date(project.createdAt), "MMMM do, yyyy")
                                  : project.$createdAt 
                                  ? format(new Date(project.$createdAt), "MMMM do, yyyy")
                                  : "Unknown date"}
                              </span>
                            </div>
                          </div>
                          
                          {/* Created By - Right - Handle missing createdBy */}
                          <div className="flex items-center gap-x-2">
                            <span className="text-sm text-muted-foreground">
                              Created by
                            </span>
                            {project.createdBy ? (
                              <MemberAvatar
                                name={`User ${project.createdBy.slice(-4)}`}
                                className="size-8"
                                fallbackClassName="text-sm"
                              />
                            ) : (
                              <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">?</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              );
            })
          )}
        </ul>
        <Button variant="muted" className="mt-4 w-full" asChild>
          <Link href={`/workspaces/${workspaceId}/projects`}>Show All</Link>
        </Button>
      </div>
    </div>
  );
};
