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
import { allNodes, updateNode } from "../signals/nodes";

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

  const attemptConnection = (event: MouseEvent) => {
    console.log("attemptConnection");
    // I don't like this, but it'll get us there until I can refactor into
    // something better...
    const currentNode = allNodes[props.node.id];
    console.log(currentNode);
    if (!currentNode) return;
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const threshold = 15;
    let closestDistance = Infinity;
    let closestSocketEle: HTMLDivElement | null = null;
    Array.from(document.querySelectorAll<HTMLDivElement>(`.${styles.socket}`)).forEach((socketEle) => {
      const bounds = socketEle.getBoundingClientRect();
      const centerX = bounds.x + (bounds.width / 2);
      const centerY = bounds.y + (bounds.height);
      const distance = Math.sqrt(
        Math.pow(Math.abs(mouseX - centerX), 2) +
        Math.pow(Math.abs(mouseY - centerY), 2)
      );
      if (distance < closestDistance) {
        closestDistance = distance;
        closestSocketEle = socketEle;
      }
    });
    if (!closestSocketEle || closestDistance > threshold) return;
    const nodeEle = (closestSocketEle as HTMLDivElement).closest<HTMLDivElement>(`.${styles.node}`);
    if (!nodeEle) throw new Error("Didn't find socket elements");
    const nodeId = nodeEle.id.split("-")[1];
    const inputSockets = Array.from(nodeEle.querySelectorAll(`.${styles.inputs} > .${styles.socket}`));
    const outputSockets = Array.from(nodeEle.querySelectorAll(`.${styles.outputs} > .${styles.socket}`));
    const inputIndex = inputSockets.indexOf(closestSocketEle);
    const outputIndex = outputSockets.indexOf(closestSocketEle);
    const socketIndex = Math.max(inputIndex, outputIndex);
    const socketType = inputIndex < 0 ? "outputs" : "inputs";
    console.table({ nodeId, socketType, socketIndex });

    const targetNode = allNodes[nodeId];
    if (targetNode[socketType][socketIndex]) {
      console.log("gota disconnect first");
      const oldConnectionId = targetNode[socketType][socketIndex];
      const otherNode = allNodes[oldConnectionId];
      updateNode({
        id: otherNode.id,
        inputs: otherNode.inputs.map(i => i == nodeId ? null : i),
        outputs: otherNode.outputs.map(i => i == nodeId ? null : i),
      });
    }
    const updatedSockets = [...targetNode[socketType]];
    updatedSockets[socketIndex] = currentNode.id;
    updateNode({
      id: targetNode.id,
      [socketType]: updatedSockets,
    });
    updateNode({
      id: currentNode.id,
      inputs: currentNode.inputs.map(i => i == TEMPSOCKET ? nodeId : i),
      outputs: currentNode.outputs.map(i => i == TEMPSOCKET ? nodeId : i),
    });
  }

  const handleMouseUp = (_event: MouseEvent) => {
    setActive(false);
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

  const handleSocketMouseUp = (event: MouseEvent) => {
    attemptConnection(event);
    const currentNode = allNodes[props.node.id];
    updateNode({
      id: props.node.id,
      inputs: currentNode.inputs.map(i => i == TEMPSOCKET ? null : i),
      outputs: currentNode.outputs.map(i => i == TEMPSOCKET ? null : i),
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
      const oldConnectionId = newSockets[index];
      const otherNode = allNodes[oldConnectionId];
      updateNode({
        id: otherNode.id,
        inputs: otherNode.inputs.map(i => i == props.node.id ? null : i),
        outputs: otherNode.outputs.map(i => i == props.node.id ? null : i),
      });
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
