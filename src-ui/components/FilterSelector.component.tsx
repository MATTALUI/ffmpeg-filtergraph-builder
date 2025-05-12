import {
  type Component,
  createSignal,
  For,
  Show,
} from "solid-js";
import { debounce } from "lodash";
import styles from "./FilterSelector.module.scss";
import { allFilters } from "../signals/filters";
import type { FFMPEGFilter, Node } from "../types";
import { workspaceMouseCoords } from "../signals/ui";
import { addNode } from "../signals/nodes";

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

  const addNewFilter = (filter: FFMPEGFilter) => {
    const newNode: Node = {
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
      ...workspaceMouseCoords(),
    };
    addNode(newNode);
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
          autocorrect="off"
          spellcheck={false}
          autocomplete="off"
        />
      </div>
      <For each={filterSearchResults().displayed}>
        {(filter) => (
          <div
            class={styles.filterOption}
            onClick={() => addNewFilter(filter)}
          >
            {filter.name}
          </div>
        )}
      </For>
      <Show when={allFilters.loading}>
        <div class={styles.loaderContainer}>
          <div class={styles.loader} />
          <span>Loading Filters</span>
        </div>
      </Show>
      <Show when={noSearchResult() && !allFilters.loading}>
        <div class={styles.noResults}>
          No Filters Available {!!filterSearch() && `For Search "${filterSearch()}"`}
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
