import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<(typeof client.api.auth.login)["$post"]>;
type RequestType = InferRequestType<(typeof client.api.auth.login)["$post"]>;

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.auth.login.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Logged in.");
      queryClient.invalidateQueries({ queryKey: ["current"] });
      router.push("/dashboard"); // ← Changed from "/" to "/dashboard"
      router.refresh();
    },
    onError: () => {
      toast.error("Failed to log in.");
    },
  });

  return mutation;
};
