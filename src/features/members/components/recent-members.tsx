"use client";

import Link from "next/link";
import { CalendarIcon, Crown, Shield, User } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DottedSeparator } from "@/components/dotted-separator";
import { Badge } from "@/components/ui/badge";
import { Member, MemberRole } from "@/features/members/types";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";

interface RecentMembersProps {
  data: Member[];
  total: number;
}

export const RecentMembers = ({ data, total }: RecentMembersProps) => {
  const workspaceId = useWorkspaceId();
  const { data: workspace } = useGetWorkspace({ workspaceId });

  const isWorkspaceOwner = (member: Member) => workspace?.userId === member.userId;
  const getMemberRole = (member: Member) => (isWorkspaceOwner(member) ? "Owner" : member.role);

  // Sorting: Most recent members first, Owner at the bottom
  const sortedMembers = [...data].sort((a, b) => {
    // 1. Owner goes to the bottom (reverse of previous logic)
    if (isWorkspaceOwner(a) && !isWorkspaceOwner(b)) return 1;  // Owner goes after non-owners
    if (!isWorkspaceOwner(a) && isWorkspaceOwner(b)) return -1; // Non-owners go before owner

    // 2. For non-owners, sort by role hierarchy (Admin > Member)
    if (!isWorkspaceOwner(a) && !isWorkspaceOwner(b)) {
      const roleOrder = { [MemberRole.ADMIN]: 2, [MemberRole.MEMBER]: 1 };
      const roleA = roleOrder[a.role] || 0;
      const roleB = roleOrder[b.role] || 0;
      
      if (roleA !== roleB) {
        return roleB - roleA; // Higher role first
      }
    }

    // 3. Sort by creation time (most recent first)
    const timeA = new Date(a.$createdAt || 0).getTime();
    const timeB = new Date(b.$createdAt || 0).getTime();
    
    if (timeA !== timeB) {
      return timeB - timeA; // Most recent first
    }

    // 4. If all else is equal, sort alphabetically by name
    return a.name.localeCompare(b.name);
  });

  const getRoleBadge = (member: Member) => {
    const role = getMemberRole(member);
    if (role === "Owner") {
      return (
        <Badge variant="default" className="bg-blue-600 text-white">
          <Crown className="size-3 mr-1" />
          Owner
        </Badge>
      );
    } else if (role === MemberRole.ADMIN) {
      return (
        <Badge variant="destructive" className="bg-red-500 text-white">
          <Shield className="size-3 mr-1" />
          Admin
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-gray-500 text-white">
          <User className="size-3 mr-1" />
          Member
        </Badge>
      );
    }
  };

  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Recent Members ({total})</p>
          <Button variant="muted" size="icon" asChild>
            <Link href={`/workspaces/${workspaceId}?section=members`}>
              <User className="size-4 text-neutral-400" />
            </Link>
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <ul className="flex flex-col gap-y-4">
          {sortedMembers.map((member) => (
            <li key={member.$id}>
              <Link href={`/workspaces/${workspaceId}/members/${member.$id}`}>
                <Card className="shadow-none rounded-lg hover:opacity-75 transition">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-y-2 flex-1">
                        <div className="flex items-center gap-x-2">
                          <MemberAvatar name={member.name} className="size-6" />
                          <p className="text-lg font-medium truncate">
                            {member.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-x-2">
                          <p className="text-sm text-muted-foreground">
                            {member.email}
                          </p>
                          {member.$createdAt && (
                            <>
                              <div className="size-1 bg-neutral-300 rounded-full" />
                              <div className="flex items-center text-sm text-muted-foreground">
                                <CalendarIcon className="size-3 mr-1" />
                                <span>
                                  Joined {format(new Date(member.$createdAt), "MMM dd")}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-x-2">
                          {getRoleBadge(member)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
          {sortedMembers.length === 0 && (
            <li className="text-sm text-muted-foreground text-center">
              No members found
            </li>
          )}
        </ul>
        <Button variant="muted" className="mt-4 w-full" asChild>
          <Link href={`/workspaces/${workspaceId}?section=members`}>
            Show All
          </Link>
        </Button>
      </div>
    </div>
  );
};
