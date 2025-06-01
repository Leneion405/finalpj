import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { SignInCard } from "@/features/auth/components/sign-in-card";

const SignInPage = async () => {
  const user = await getCurrent();
  if (user) redirect("/");
  return <SignInCard />;  // ← Add this component!
};

export default SignInPage;
