"use client";

import { UserButton } from "@/features/auth/components/user-button";
import { usePathname, useSearchParams } from "next/navigation";
import { MobileSidebar } from "./mobile-sidebar";
import { NotificationBell } from "@/features/invitations/components/notificationBell";

const pathnameMap = {
  dashboard: {
    title: "Dashboard",
    description: "Analytics and insights for your workspace.",
  },
  tasks: {
    title: "Tasks",
    description: "View all of your tasks here.",
  },
  projects: {
    title: "My Project",
    description: "View tasks of your project here.",
  },
  settings: {
    title: "Settings",
    description: "Manage your workspace settings here.",
  },
  members: {
    title: "Members",
    description: "Manage workspace members and permissions.",
  },
  "member-info": {
    title: "Member Information",
    description: "View detailed member information and activity.",
  },
  "edit-profile": {
    title: "Edit Profile",
    description: "Update your personal information and preferences.",
  },
};

const defaultMap = {
  title: "Home",
  description: "Welcome to your workspace overview.",
};

export const Navbar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const section = searchParams.get('section');

  // Check if we're on edit-profile page
  if (pathname.includes('/edit-profile')) {
    const { title, description } = pathnameMap["edit-profile"];
    return (
      <nav className="pt-4 px-6 flex items-center justify-between">
        <div className="flex-col hidden lg:flex">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <MobileSidebar />
        <div className="ml-auto flex items-center gap-x-3">
          <NotificationBell />
          <UserButton />
        </div>
      </nav>
    );
  }

  // Check if we're on member info page
  if (pathname.includes('/members/') && pathname.split('/').length > 4) {
    const { title, description } = pathnameMap["member-info"];
    return (
      <nav className="pt-4 px-6 flex items-center justify-between">
        <div className="flex-col hidden lg:flex">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <MobileSidebar />
        <div className="ml-auto flex items-center gap-x-3">
          <NotificationBell />
          <UserButton />
        </div>
      </nav>
    );
  }

  // Check if we're on dashboard page
  if (pathname.includes('/dashboard')) {
    const { title, description } = pathnameMap.dashboard;
    return (
      <nav className="pt-4 px-6 flex items-center justify-between">
        <div className="flex-col hidden lg:flex">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <MobileSidebar />
        <div className="ml-auto flex items-center gap-x-3">
          <NotificationBell />
          <UserButton />
        </div>
      </nav>
    );
  }

  // Check if we're on settings via query parameter
  if (section === 'settings') {
    const { title, description } = pathnameMap.settings;
    return (
      <nav className="pt-4 px-6 flex items-center justify-between">
        <div className="flex-col hidden lg:flex">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <MobileSidebar />
        <div className="ml-auto flex items-center gap-x-3">
          <NotificationBell />
          <UserButton />
        </div>
      </nav>
    );
  }

  // Check if we're on members via query parameter
  if (section === 'members') {
    const { title, description } = pathnameMap.members;
    return (
      <nav className="pt-4 px-6 flex items-center justify-between">
        <div className="flex-col hidden lg:flex">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <MobileSidebar />
        <div className="ml-auto flex items-center gap-x-3">
          <NotificationBell />
          <UserButton />
        </div>
      </nav>
    );
  }

  // Handle regular routes
  const pathnameParts = pathname.split("/");
  const pathnameKey = pathnameParts[3] as keyof typeof pathnameMap;
  const { title, description } = pathnameMap[pathnameKey] || defaultMap;

  return (
    <nav className="pt-4 px-6 flex items-center justify-between">
      <div className="flex-col hidden lg:flex">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <MobileSidebar />
      <div className="ml-auto flex items-center gap-x-3">
        <NotificationBell />
        <UserButton />
      </div>
    </nav>
  );
};
