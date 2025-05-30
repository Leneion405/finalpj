"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DottedSeparator } from "@/components/dotted-separator";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, MailIcon } from "lucide-react";
import Link from "next/link";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { Member, MemberRole } from "@/features/members/types";

interface RecentMembersProps {
  data: Member[];
  total: number;
}

export const RecentMembers = ({ data, total }: RecentMembersProps) => {
  const workspaceId = useWorkspaceId();

  const getRoleBadgeVariant = (role: MemberRole) => {
    switch (role) {
      case MemberRole.ADMIN:
        return "destructive";
      case MemberRole.MEMBER:
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleDisplayName = (role: MemberRole) => {
    switch (role) {
      case MemberRole.ADMIN:
        return "Admin";
      case MemberRole.MEMBER:
        return "Member";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Recent Members ({data.length})</p>
          <Button variant="muted" size="icon" asChild>
            <Link href={`/workspaces/${workspaceId}/members`}>
              <PlusIcon className="size-4 text-neutral-400" />
            </Link>
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <ul className="flex flex-col gap-y-4">
          {data.map((member) => (
            <li key={member.$id}>
              <Link href={`/workspaces/${workspaceId}/members`}>
                <Card className="shadow-none rounded-lg hover:opacity-75 transition">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-x-3">
                      <div className="flex items-center gap-x-3 flex-1 min-w-0">
                        <MemberAvatar
                          className="size-12"
                          fallbackClassName="text-lg"
                          name={member.name || "Unknown Member"}
                        />
                        <div className="flex flex-col overflow-hidden flex-1">
                          <p className="text-lg font-medium truncate">
                            {member.name || "Unknown Member"}
                          </p>
                          <div className="flex items-center gap-x-1.5">
                            <MailIcon className="size-3 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground truncate">
                              {member.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Role badge on the right, centered */}
                      <div className="flex items-center justify-center">
                        <Badge 
                          variant={getRoleBadgeVariant(member.role)}
                          className="text-xs"
                        >
                          {getRoleDisplayName(member.role)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
          <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
            No members found
          </li>
        </ul>
        <Button variant="muted" className="w-full mt-4" asChild>
          <Link href={`/workspaces/${workspaceId}/members`}>
            Show All ({total})
          </Link>
        </Button>
      </div>
    </div>
  );
};
