import { Component, createSignal, For, Show } from "solid-js";
import type { FilterNode } from "../types";
import nodeStyles from "./Node.module.scss";
import styles from "./NodeFilterOptions.module.scss";
import { AiOutlineMinus, AiOutlinePlus } from "solid-icons/ai";
import cn from "classnames";

export interface INodeFilterOptionsProps {
  node: FilterNode;
}

const NodeFilterOptions: Component<INodeFilterOptionsProps> = (
  props: INodeFilterOptionsProps
) => {
  if (props.node.type !== "filter") return null;

  const [collapsed, setCollapsed] = createSignal(true);
  const stopProp = (event: MouseEvent) => event.stopPropagation();
  const toggleCollapsed = () => setCollapsed(!collapsed());

  return (
    <div class={nodeStyles.section}>
      <div
        onmousedown={stopProp}
        onClick={toggleCollapsed}
        class={nodeStyles.sectionHeader}
      >
        <span>Options ({props.node.filter.options.length})</span>
        <Show when={collapsed()}>
          <AiOutlinePlus />
        </Show>
        <Show when={!collapsed()}>
          <AiOutlineMinus />
        </Show>
      </div>
      <Show when={!collapsed()}>
        <div class={cn(nodeStyles.sectionContent, styles.options)}>
          <For each={props.node.filter.options}>
            {(option) => (
              <>
                <span>{option.name}</span>
                <Show when={!option.values.length}>
                  <input type="text" value={option.value} />
                </Show>
                <Show when={!!option.values.length}>
                  <select
                    value={option.values.find(v => v.name === option.value || v.value === option.value)?.value}
                    onmousedown={stopProp}
                  >
                    <For each={option.values}>
                      {(value) => (
                        <option
                          value={value.value}
                        >
                          {value.name}
                        </option>
                      )}
                    </For>
                  </select>
                </Show>
              </>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};

export default NodeFilterOptions;
