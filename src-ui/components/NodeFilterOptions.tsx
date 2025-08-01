import React, { useState } from "react";
// import { Component, createSignal, For, Show } from "solid-js";
import type { FilterNode } from "../types";
import nodeStyles from "./Node.module.scss";
import styles from "./NodeFilterOptions.module.scss";
// import { AiOutlineMinus, AiOutlinePlus } from "solid-icons/ai";
import cn from "classnames";

export interface INodeFilterOptionsProps {
  node: FilterNode;
}

const NodeFilterOptions: React.FC<INodeFilterOptionsProps> = (
  props: INodeFilterOptionsProps
) => {
  if (props.node.type !== "filter") return null;

  const [collapsed, setCollapsed] = useState(true);
  const stopProp = (event: React.MouseEvent) => event.stopPropagation();
  const toggleCollapsed = () => setCollapsed(!collapsed);

  return (
    <div className={nodeStyles.section}>
      <div
        onMouseDown={stopProp}
        onClick={toggleCollapsed}
        className={nodeStyles.sectionHeader}
      >
        <span>Options ({props.node.filter.options.length})</span>
        {collapsed ? "+" : "-"}
      </div>
      {!collapsed && (
        <div className={cn(nodeStyles.sectionContent, styles.options)}>
          {props.node.filter.options.map((option) => (
            <>
              <span>{option.name}</span>
              {!!option.values.length ? (
                <select
                  value={option.values.find(v => v.name === option.value || v.value === option.value)?.value}
                  onMouseDown={stopProp}
                >
                  {option.values.map((value) => (
                    <option
                      value={value.value}
                    >
                      {value.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input type="text" value={option.value} />
              )}
            </>
          ))}
        </div>
      )}
    </div>
  );
};

export default NodeFilterOptions;
