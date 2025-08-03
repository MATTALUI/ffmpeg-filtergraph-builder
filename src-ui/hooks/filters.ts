import { useQuery } from "@tanstack/react-query";
import APIService from "../services";

export const useFilters = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["filters"],
    queryFn: async () => {
      const {
        success,
        data,
        error,
      } = await APIService.getAllFilters();
      if (success) return data;
      throw new Error(error);
    },
  });

  return {
    filters: data || [],
    isLoading,
    error,
  };
}
