import { createResource } from "solid-js";
import APIService from "../services";

export const [allFilters, {
  mutate: setAllFilters,
}] = createResource(async () => {
  const filters = await APIService.getAllFilters();
  if (filters.success) return filters.data;
  throw new Error(filters.error);
});
