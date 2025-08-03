import React, { useCallback, useMemo, useState } from "react";
import styles from "./FilterSelector.module.scss";
import { useFilters } from "../hooks/filters";
import type {
  FFMPEGFilter,
  FilterNode,
} from "../types";
import { useNodes } from "../context/nodes";
import { useUI } from "../context/ui";

interface IFilterSelectorProps {
  closeMenu: () => void;
};

const maxSearchResultsCount = 7;

const FilterSelector: React.FC<IFilterSelectorProps> = (
  props: IFilterSelectorProps,
) => {
  const { addNodes } = useNodes();    
  const { filters, isLoading } = useFilters();
  const { workspaceMouseCoords } = useUI();
  const [filterSearch, setFilterSearch] = useState("");

  const updateSearchTerm = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    setFilterSearch(target.value);
  }, []);

  const filterSearchResults = useMemo(() => {
    const searchedFilters = filters
      .filter(f => f.name.toLowerCase().includes(filterSearch))
      .sort((a, b) => (a.name.toLowerCase().localeCompare(b.name.toLowerCase())));
    return {
      displayed: searchedFilters.slice(0, maxSearchResultsCount),
      more: Math.max(0, searchedFilters.length - maxSearchResultsCount),
    };
  }, [filters, filterSearch]);

  const noSearchResult = filterSearchResults.displayed.length === 0;

  const addNewFilter = (filter: FFMPEGFilter) => {
    const newNode: FilterNode = {
      type: "filter",
      filter,
      id: crypto.randomUUID(),
      name: filter.name,
      inputs: filter.inputs.map((input) => ({
        type: input.stream_type,
        name: input.name,
        connectedNodes: [],
      })),
      outputs: filter.outputs.map((output) => ({
        type: output.stream_type,
        name: output.name,
        connectedNodes: [],
      })),
      ...workspaceMouseCoords,
    };
    addNodes([newNode]);
    setFilterSearch("");
    props.closeMenu();
  }

  return (
    <div className={styles.filterSelectorContainer}>
      <div className={styles.inputContainer}>
        <input
          className={styles.searchInput}
          type="text"
          value={filterSearch}
          placeholder="Search..."
          onChange={updateSearchTerm}
          autoCorrect="off"
          spellCheck={false}
          autoComplete="off"
        />
      </div>
      {filterSearchResults.displayed.map((filter) => (
        <div
          key={filter.name}
          className={styles.filterOption}
          onClick={() => addNewFilter(filter)}
        >
          {filter.name}
        </div>
      ))}
      {isLoading && (
        <div className={styles.loaderContainer}>
          <div className={styles.loader} />
          <span>Loading Filters</span>
        </div>
      )}
      {noSearchResult && !isLoading && (
        <div className={styles.noResults}>
          No Filters Available {!!filterSearch && `For Search "${filterSearch}"`}
        </div>
      )}
      {filterSearchResults.more > 0 && (
        <div className={styles.noResults}>
          {filterSearchResults.more} more...
        </div>
      )}
    </div>
  );
}

export default FilterSelector;
