import { getCurrent } from "@/features/auth/queries";
import { getWorkspaces } from "@/features/workspaces/queries";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrent();

  if (!user) redirect("/sign-in");

  const workspaces = await getWorkspaces();

  if (workspaces.total === 0) {
    redirect("/workspaces/create");
  } else {
    // Redirect to the most recently created workspace
    const newestWorkspace = workspaces.documents.sort(
      (a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
    )[0];
    redirect(`/workspaces/${newestWorkspace.$id}`);
  }
}
