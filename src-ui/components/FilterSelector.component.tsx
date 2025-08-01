import React, { useMemo, useState } from "react";
import { debounce } from "lodash";
import styles from "./FilterSelector.module.scss";
// import { allFilters } from "../signals/filters";
import type {
  FFMPEGFilter,
  FilterNode,
} from "../types";
import { useNodes } from "../context/nodes";
// import { workspaceMouseCoords } from "../signals/ui";

interface IFilterSelectorProps {
  closeMenu: () => void;
};

const maxSearchResultsCount = 7;

const FilterSelector: React.FC<IFilterSelectorProps> = (
  props: IFilterSelectorProps,
) => {
  const { addNodes } = useNodes();    
  const allFilters: FFMPEGFilter[] = [];
  const loading = true
  const [filterSearch, setFilterSearch] = useState("");

  const updateSearchTerm = debounce((event: React.KeyboardEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    setFilterSearch(target.value);
  }, 200);

  const filterSearchResults = useMemo(() => {
    const filters: FFMPEGFilter[] = [];
    const searchedFilters = allFilters
      .filter(f => f.name.toLowerCase().includes(filterSearch))
      .sort((a, b) => (a.name.toLowerCase().localeCompare(b.name.toLowerCase())));
    return {
      displayed: searchedFilters.slice(0, maxSearchResultsCount),
      more: Math.max(0, searchedFilters.length - maxSearchResultsCount),
    };
  }, []);

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
      x: 0,
      y: 0,
      // ...workspaceMouseCoords(),
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
          // onKeyUp={updateSearchTerm}
          // onChange={updateSearchTerm}
          autoCorrect="off"
          spellCheck={false}
          autoComplete="off"
          readOnly
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
      {loading && (
        <div className={styles.loaderContainer}>
          <div className={styles.loader} />
          <span>Loading Filters</span>
        </div>
      )}
      {noSearchResult && !loading && (
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
