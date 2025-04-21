import {
  type Component,
  createSignal,
  For,
  Show,
} from "solid-js";
import { debounce } from "lodash";
import styles from "./FilterSelector.module.scss";
import { allFilters } from "../signals/filters";
import { FFMPEGFilter } from "../types";

interface IFilterSelectorProps {
  closeMenu: () => void;
};

const maxSearchResultsCount = 7;

const FilterSelector: Component<IFilterSelectorProps> = (
  props: IFilterSelectorProps,
) => {
  const [filterSearch, setFilterSearch] = createSignal("");

  const updateSearchTerm = debounce((event: KeyboardEvent) => {
    const target = event.target as HTMLInputElement;
    setFilterSearch(target.value);
  }, 200);

  const filterSearchResults = () => {
    const filters = allFilters() || [];
    const searchedFilters = filters
      .filter(f => f.name.toLowerCase().includes(filterSearch()))
      .sort((a, b) => (a.name.toLowerCase().localeCompare(b.name.toLowerCase())));
    return {
      displayed: searchedFilters.slice(0, maxSearchResultsCount),
      more: Math.max(0, searchedFilters.length - maxSearchResultsCount),
    };
  };

  const noSearchResult = () => filterSearchResults().displayed.length === 0;

  const addFilter = (filter: FFMPEGFilter) => {
    console.log(filter);
    setFilterSearch("");
    props.closeMenu();
  }

  return (
    <div class={styles.filterSelectorContainer}>
      <div class={styles.inputContainer}>
        <input
          class={styles.searchInput}
          type="text"
          value={filterSearch()}
          placeholder="Search..."
          onkeyup={updateSearchTerm}
        />
      </div>
      <For each={filterSearchResults().displayed}>
        {(filter) => (
          <div
            class={styles.filterOption}
            onClick={() => addFilter(filter)}
          >
            {filter.name}
          </div>
        )}
      </For>
      <Show when={noSearchResult()}>
        <div class={styles.noResults}>
          No Filters Available For Search "{filterSearch()}"
        </div>
      </Show>
      <Show when={filterSearchResults().more > 0}>
        <div class={styles.noResults}>
          {filterSearchResults().more} more...
        </div>
      </Show>
    </div>
  );
}

export default FilterSelector;
