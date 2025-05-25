// features/members/api/use-get-all-members.ts

import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

export const useGetAllMembers = () => {
  const query = useQuery({
    queryKey: ["all-members"],
    queryFn: async () => {
      const response = await client.api.members.all.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch all members.");
      }

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};