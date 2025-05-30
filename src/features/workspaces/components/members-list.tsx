"use client";

import { Fragment, useState } from "react";
import { ArrowLeft, MoreVerticalIcon, UserPlus, Crown, User, Shield } from "lucide-react";
import Link from "next/link";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useDeleteMember } from "@/features/members/api/use-delete-member";
import { useUpdateMember } from "@/features/members/api/use-update-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { MemberRole } from "@/features/members/types";
import { useConfirm } from "@/hooks/use-confirm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedSeparator } from "@/components/dotted-separator";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { RiAddCircleFill } from "react-icons/ri";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AllMembersCard } from "@/features/members/components/all-members-list";
import { Input } from "@/components/ui/input";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { useCurrent } from "@/features/auth/api/use-current";

export const MembersList = () => {
  const workspaceId = useWorkspaceId();
  const [ConfirmDialog, confirm] = useConfirm(
    "Remove member",
    "This member will be removed from the workspace.",
    "destructive"
  );

  const [open, setOpen] = useState(false);

  const { data: currentUser } = useCurrent();
  const { data } = useGetMembers({ workspaceId });
  const { data: workspace } = useGetWorkspace({ workspaceId });
  const { mutate: deleteMember, isPending: isDeletingMember } = useDeleteMember();
  const { mutate: updateMember, isPending: isUpdatingMember } = useUpdateMember();

  const handleUpdateMember = (memberId: string, role: MemberRole) => {
    updateMember({ json: { role }, param: { memberId } });
  };

  const handleDeleteMember = async (memberId: string) => {
    const ok = await confirm();
    if (!ok) return;

    deleteMember(
      { param: { memberId } },
      { onSuccess: () => window.location.reload() }
    );
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Owner":
        return "default";
      case MemberRole.ADMIN:
        return "destructive";
      case MemberRole.MEMBER:
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Owner":
        return <Shield className="size-3" />;
      case MemberRole.ADMIN:
        return <Crown className="size-3" />;
      case MemberRole.MEMBER:
        return <User className="size-3" />;
      default:
        return <User className="size-3" />;
    }
  };

  // Check if member is the workspace creator (owner)
  const isWorkspaceOwner = (member: any) => {
    return workspace?.userId === member.userId;
  };

  // Check if current user is workspace owner
  const isCurrentUserOwner = () => {
    return workspace?.userId === currentUser?.$id;
  };

  // Check if current user is admin or owner
  const canManageMembers = () => {
    if (!currentUser || !data) return false;
    
    // If user is workspace owner, they can manage
    if (isCurrentUserOwner()) return true;
    
    // Find current user's member record
    const currentUserMember = data.documents.find(
      member => member.userId === currentUser.$id
    );
    
    // If user is admin, they can manage
    return currentUserMember?.role === MemberRole.ADMIN;
  };

  const getMemberRole = (member: any) => {
    if (isWorkspaceOwner(member)) {
      return "Owner";
    }
    return member.role;
  };

  const getMemberRoleDisplay = (member: any) => {
    if (isWorkspaceOwner(member)) {
      return "Owner";
    }
    switch (member.role) {
      case MemberRole.ADMIN:
        return "Admin";
      case MemberRole.MEMBER:
        return "Member";
      default:
        return "Unknown";
    }
  };

  // Check if current user can edit a specific member
  const canEditMember = (member: any) => {
    // Can't edit if user doesn't have management permissions
    if (!canManageMembers()) return false;
    
    // Can't edit the workspace owner
    if (isWorkspaceOwner(member)) return false;
    
    // Owner can edit anyone (except other owners)
    if (isCurrentUserOwner()) return true;
    
    // Admins can only edit regular members, not other admins
    if (member.role === MemberRole.ADMIN) return false;
    
    return true;
  };

  // Create invite link
  const fullInviteLink = workspace 
    ? `${window.location.origin}/workspaces/${workspaceId}/join/${workspace.inviteCode}`
    : "";

  const handleCopyInviteLink = () => {
    navigator.clipboard
      .writeText(fullInviteLink)
      .then(() => toast.success("Invite link copied to clipboard."));
  };

  return (
    <>
      <ConfirmDialog />
      <Card className="w-full h-full border-none shadow-none">
        <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
          <Button variant="secondary" size="sm" asChild>
            <Link href={`/workspaces/${workspaceId}`}>
              <ArrowLeft className="size-4 mr-2" />
              Back
            </Link>
          </Button>
          <CardTitle className="text-xl font-bold">Members List</CardTitle>
          {/* Only show add member button if user can manage members */}
          {canManageMembers() && (
            <RiAddCircleFill
              onClick={() => setOpen(true)}
              className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition"
            />
          )}
        </CardHeader>
        <div className="px-7">
          <DottedSeparator />
        </div>
        <CardContent className="p-7">
          {/* Scrollable Members List - Max 5 visible */}
          <div className="max-h-[400px] overflow-y-auto pr-2">
            {data?.documents.map((member, index) => (
              <Fragment key={member.$id}>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-x-3">
                    <MemberAvatar
                      className="size-10"
                      fallbackClassName="text-lg"
                      name={member.name}
                    />
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-x-3">
                    <Badge 
                      variant={getRoleBadgeVariant(getMemberRole(member))}
                      className="text-xs gap-x-1"
                    >
                      {getRoleIcon(getMemberRole(member))}
                      {getMemberRoleDisplay(member)}
                    </Badge>
                    
                    {/* Only show dropdown if user can edit this member */}
                    {canEditMember(member) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVerticalIcon className="size-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="bottom" align="end">
                          <DropdownMenuItem
                            className="font-medium"
                            onClick={() =>
                              handleUpdateMember(member.$id, MemberRole.ADMIN)
                            }
                            disabled={isUpdatingMember}
                          >
                            <Crown className="size-4 mr-2" />
                            Set as Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="font-medium"
                            onClick={() =>
                              handleUpdateMember(member.$id, MemberRole.MEMBER)
                            }
                            disabled={isUpdatingMember}
                          >
                            <User className="size-4 mr-2" />
                            Set as Member
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="font-medium text-red-600"
                            onClick={() => handleDeleteMember(member.$id)}
                            disabled={isDeletingMember}
                          >
                            Remove {member.name}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
                {index < data.documents.length - 1 && (
                  <Separator className="my-2" />
                )}
              </Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invite Members Section - Only show if user can manage members */}
      {canManageMembers() && (
        <Card className="w-full h-full border-none shadow-none mt-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Invite Members</CardTitle>
          </CardHeader>
          <div className="px-7">
            <DottedSeparator />
          </div>
          <CardContent className="p-7">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground mb-4">
                Share this invite link to add members to your workspace.
              </p>
              <div className="flex items-center gap-x-2">
                <Input 
                  disabled 
                  value={fullInviteLink} 
                  className="font-mono text-sm"
                />
                <Button
                  onClick={handleCopyInviteLink}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  <CopyIcon className="size-4 mr-2" />
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Anyone with this link can join your workspace as a member.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog for AllMembersCard - Only show if user can manage members */}
      {canManageMembers() && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>All Members</DialogTitle>
            </DialogHeader>
            <AllMembersCard />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
