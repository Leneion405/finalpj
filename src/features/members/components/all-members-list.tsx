"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { useGetAllMembers } from "@/features/members/api/use-get-all-members";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetWorkspaceInfo } from "@/features/workspaces/api/use-get-workspace-info";
import { RiAddCircleFill } from "react-icons/ri";
import { toast } from "sonner";

export const AllMembersCard = () => {
  // Fetch all members
  const { data: allMembersData, isLoading, isError } = useGetAllMembers();

  // Get current workspace ID and info
  const workspaceId = useWorkspaceId();
  const { data: wsInfo } = useGetWorkspaceInfo({ workspaceId });

  // Fetch members in the current workspace
  const { data: workspaceMembersData } = useGetMembers({ workspaceId });

  // Get IDs of members in the current workspace
  const workspaceMemberIds = workspaceMembersData?.documents.map((m: any) => m.$id) || [];

  // Filter out members who are already in the workspace
  const filteredMembers = allMembersData?.documents.filter(
    (member: any) => !workspaceMemberIds.includes(member.$id)
  ) || [];

  // Invite handler
  const sendInvite = async (memberId: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          recipientId: memberId,
          workspaceId,
          workspaceName: wsInfo?.name ?? "",
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error();
      toast.success("Invite sent!");
    } catch (err) {
      toast.error("Failed to send invite");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite new members to workspace</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <div>Loading members...</div>}
        {isError && <div>Failed to load members.</div>}
        <div
          className="max-h-72 sm:max-h-96 overflow-y-auto w-full space-y-2"
          style={{ minHeight: 0 }}
        >
          {filteredMembers.map((member: any) => (
            <div key={member.$id} className="flex items-center gap-2 py-2">
              <MemberAvatar name={member.name} />
              <div className="flex-1 min-w-0">
                <div className="truncate">{member.name}</div>
                <div className="text-xs text-muted-foreground truncate">{member.email}</div>
              </div>
              <RiAddCircleFill
                onClick={() => sendInvite(member.$id)}
                className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition"
                title="Invite"
              />
            </div>
          ))}
          {!filteredMembers.length && !isLoading && (
            <div className="text-sm text-muted-foreground">No members found.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
