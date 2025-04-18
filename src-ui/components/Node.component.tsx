import {
  type Component,
  createSignal,
  For,
} from "solid-js";
import type {
  MouseDownValues,
  Node,
} from "../types";
import styles from "./Node.module.scss";
import cn from "classnames";
import { updateNode } from "../signals/nodes";

interface INodeProps {
  node: Node;
};

const Node: Component<INodeProps> = (
  props: INodeProps,
) => {
  const [active, setActive] = createSignal(false);
  const [mouseDownValues, setMouseDownValues] = createSignal<MouseDownValues>({
    mouseX: 0,
    mouseY: 0,
    originalX: 0,
    originalY: 0,
  });

  const handleMouseMove = (event: MouseEvent) => {
    const initialValues = mouseDownValues();
    const xDiff = initialValues.mouseX - event.clientX
    const yDiff = initialValues.mouseY - event.clientY;
    const x = initialValues.originalX - xDiff;
    const y = initialValues.originalY - yDiff;
    updateNode({
      id: props.node.id,
      x,
      y,
    });
  }

  const handleMouseUp = (_event: MouseEvent) => {
    setActive(false)
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }

  const handleMouseDown = (event: MouseEvent) => {
    event.stopImmediatePropagation();
    setMouseDownValues({
      mouseX: event.clientX,
      mouseY: event.clientY,
      originalX: props.node.x,
      originalY: props.node.y,
    });
    setActive(true);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  return (
    <div
      id={`node-${props.node.id}`}
      class={cn(styles.node, active() && styles.active)}
      style={{
        left: `${props.node.x}px`,
        top: `${props.node.y}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div class={styles.nodeContent}>
        <div class={styles.nodeName}>{props.node.name}</div>
      </div>
      <div class={cn(styles.sockets, styles.inputs)}>
        <For each={props.node.inputs}>
          {(inputId) => (
            <div class={cn(styles.socket, !!inputId && styles.connected)}/>
          )}
        </For>
      </div>
      <div class={cn(styles.sockets, styles.outputs)}>
        <For each={props.node.outputs}>
          {(inputId) => (
            <div class={cn(styles.socket, !!inputId && styles.connected)}/>
          )}
        </For>
      </div>
    </div>
  );
}

export default Node;
