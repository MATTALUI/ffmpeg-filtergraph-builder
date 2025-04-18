import {
  type Component,
  createSignal,
  For,
} from "solid-js";
import type {
  MouseDownValues,
  Node,
} from "../types";
import { TEMPSOCKET } from "../constants";
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

  const handleSocketMouseUp = () => {
    updateNode({
      id: props.node.id,
      inputs: props.node.inputs.filter(i => i !== TEMPSOCKET),
      outputs: props.node.outputs.filter(i => i !== TEMPSOCKET),
    });
    document.removeEventListener("mouseup", handleSocketMouseUp);
  }

  const handleSocketMouseDown = (
    event: MouseEvent,
    socketType: "inputs" | "outputs",
    index: number,
  ) => {
    event.stopPropagation();
    event.preventDefault();
    const newSockets = [
      ...props.node[socketType],
    ];
    if (newSockets[index]) {
      // TODO: If there's already a connection here we should disconnect them
    }
    newSockets[index] = TEMPSOCKET;
    updateNode({
      id: props.node.id,
      [socketType]: newSockets,
    });
    document.addEventListener("mouseup", handleSocketMouseUp);
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
          {(inputId, index) => (
            <div
              class={cn(styles.socket, !!inputId && styles.connected)}
              onMouseDown={(e: MouseEvent) => handleSocketMouseDown(e, "inputs", index())}
            />
          )}
        </For>
      </div>
      <div class={cn(styles.sockets, styles.outputs)}>
        <For each={props.node.outputs}>
          {(outputId, index) => (
            <div
              class={cn(styles.socket, !!outputId && styles.connected)}
              onMouseDown={(e: MouseEvent) => handleSocketMouseDown(e, "outputs", index())}
            />
          )}
        </For>
      </div>
    </div>
  );
}

export default Node;
