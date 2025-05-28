"use client";

import { useRouter } from "next/navigation";
import { useGetInvites } from "../api/useGetInvites";
import { useAcceptInvite } from "../api/useAcceptInvite";
import { toast } from "sonner";
import { useState } from "react";
import { Invite } from "../types";
import { Bell } from "lucide-react";

export const NotificationBell = () => {
  const { data: invites = [], refetch } = useGetInvites();
  const acceptInvite = useAcceptInvite();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleAccept = async (inviteId: string, workspaceId: string) => {
    try {
      await acceptInvite(inviteId);
      toast.success("You joined the workspace!");
      // Remove accepted invite from local list by refetching
      await refetch();
      setIsOpen(false);
      router.push(`/workspaces/${workspaceId}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to accept invite");
    }
  };

  const handleDecline = async (inviteId: string) => {
    try {
      await fetch(`/api/invitations/${inviteId}`, {
        method: "DELETE",
        credentials: "include",
      });
      toast.success("Invite declined.");
      await refetch();
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to decline invite");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-neutral-500" />
        {invites.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
            {invites.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
          {invites.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No new invites
            </div>
          ) : (
            invites.map((invite: Invite) => (
              <div
                key={invite.$id}
                className="p-3 border-b text-sm flex flex-col gap-2"
              >
                <div>
                  <strong>{invite.workspaceName || "Workspace"}</strong> invited
                  you
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(invite.$id, invite.workspaceId)}
                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecline(invite.$id)}
                    className="text-xs px-2 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
