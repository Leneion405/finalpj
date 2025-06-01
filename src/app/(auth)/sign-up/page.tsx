import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { SignUpCard } from "@/features/auth/components/sign-up-card";

const SignUpPage = async () => {
  const user = await getCurrent();
  if (user) redirect("/");
  return <SignUpCard />;  // ← Add this component!
};

export default SignUpPage;
