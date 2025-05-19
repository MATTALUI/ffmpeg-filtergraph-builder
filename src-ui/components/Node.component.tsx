import {
  type Component,
  createEffect,
  createSignal,
  For,
  Show,
} from "solid-js";
import {
  createStore,
} from "solid-js/store";
import { readFile } from '@tauri-apps/plugin-fs';
import type {
  MouseDownValues,
  Node,
} from "../types";
import { TEMPSOCKET } from "../constants";
import styles from "./Node.module.scss";
import cn from "classnames";
import { allNodes, removeTempConnections, updateNodes } from "../signals/nodes";
import { cloneDeep, uniq } from "lodash";
import APIService from "../services";

const loadHash: Record<string, string> = {};

interface INodeProps {
  node: Node;
};

interface IPreviewStore {
  loading: boolean;
  loadedFileName: string | null;
  previewUrl: string | null;
};

const Node: Component<INodeProps> = (
  props: INodeProps,
) => {
  const currentNode = () => allNodes[props.node.id];
  const [active, setActive] = createSignal(false);
  const [previewData, updatePreviewData] = createStore<IPreviewStore>({
    loading: false,
    loadedFileName: null,
    previewUrl: null,
  });
  const [mouseDownValues, setMouseDownValues] = createSignal<MouseDownValues>({
    mouseX: 0,
    mouseY: 0,
    originalX: 0,
    originalY: 0,
  });
  const loading = () => previewData.loading || true;

  const handleMouseMove = (event: MouseEvent) => {
    const initialValues = mouseDownValues();
    const xDiff = initialValues.mouseX - event.clientX
    const yDiff = initialValues.mouseY - event.clientY;
    const x = initialValues.originalX - xDiff;
    const y = initialValues.originalY - yDiff;
    updateNodes([{
      id: currentNode().id,
      x,
      y,
    }]);
  }

  const attemptConnection = (event: MouseEvent) => {
    // I don't like this, but it'll get us there until I can refactor into
    // something better...
    if (!currentNode()) return;
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
    const nodeId = nodeEle.id.slice("node-".length);
    const inputSockets = Array.from(nodeEle.querySelectorAll(`.${styles.inputs} > .${styles.socket}`));
    const outputSockets = Array.from(nodeEle.querySelectorAll(`.${styles.outputs} > .${styles.socket}`));
    const inputIndex = inputSockets.indexOf(closestSocketEle);
    const outputIndex = outputSockets.indexOf(closestSocketEle);
    const updates = []
    // Update the Target Node
    const targetSocketIndex = Math.max(inputIndex, outputIndex);
    const targetSocketType = inputIndex < 0 ? "outputs" : "inputs";
    const targetNode = allNodes[nodeId];
    const updatedTargetSockets = cloneDeep(targetNode[targetSocketType]);
    updatedTargetSockets[targetSocketIndex].connectedNodes =
      uniq([...updatedTargetSockets[targetSocketIndex].connectedNodes, currentNode().id]);
    updates.push({
      id: targetNode.id,
      [targetSocketType]: updatedTargetSockets,
    });
    // Update the Original Node
    const outputSocket = currentNode().outputs.find(s => s.connectedNodes.includes(TEMPSOCKET));
    const inputSocket = currentNode().inputs.find(s => s.connectedNodes.includes(TEMPSOCKET));
    const socketType = !!inputSocket ? "inputs" : "outputs";
    const socketIndex = !!inputSocket
      ? currentNode().inputs.indexOf(inputSocket)
      : currentNode().outputs.indexOf(outputSocket!);
    const updatedSockets = cloneDeep(currentNode()[socketType]);
    updatedSockets[socketIndex].connectedNodes =
      uniq([...updatedSockets[socketIndex].connectedNodes.filter(id => id !== TEMPSOCKET), targetNode.id]);
    updates.push({
      id: currentNode().id,
      [socketType]: updatedSockets,
    });
    updateNodes(updates);
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
      originalX: currentNode().x,
      originalY: currentNode().y,
    });
    setActive(true);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  const handleSocketMouseUp = (event: MouseEvent) => {
    attemptConnection(event);
    removeTempConnections(currentNode());
    document.removeEventListener("mouseup", handleSocketMouseUp);
  }

  const handleSocketMouseDown = (
    event: MouseEvent,
    socketType: "inputs" | "outputs",
    index: number,
  ) => {
    event.stopPropagation();
    event.preventDefault();
    const newSockets = cloneDeep(currentNode()[socketType]);
    newSockets[index].connectedNodes.push(TEMPSOCKET);
    updateNodes([{
      id: currentNode().id,
      [socketType]: newSockets,
    }]);
    document.addEventListener("mouseup", handleSocketMouseUp);
  }

  createEffect(async function updatePreview() {
    const previewFile = currentNode().preview || null;
    if (previewFile !== previewData.loadedFileName && previewFile) {
      updatePreviewData({ ...previewData, loading: true });
      const cachedData = loadHash[previewFile];
      let previewUrl;
      if (cachedData) {
        previewUrl = cachedData;
      } else {
        const previewResponse = await APIService.getFilePreview(previewFile);
        if (previewResponse.success) {
          previewUrl = previewResponse.data;
          loadHash[previewFile] = previewUrl;
        } else {
          console.error(previewResponse)
        }
      }
      updatePreviewData({
        loading: false,
        loadedFileName: previewFile,
        previewUrl,
      });
    }
  });

  return (
    <div
      id={`node-${currentNode().id}`}
      class={cn(styles.node, active() && styles.active)}
      style={{
        left: `${currentNode().x}px`,
        top: `${currentNode().y}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div class={styles.nodeContent}>
        <div class={styles.nodeName}>{currentNode().name}</div>
        <Show when={!!previewData.previewUrl}>
          <div class={styles.nodePreview}>
            <img
              src={previewData.previewUrl!}
            />
          </div>
        </Show>
      </div>
      <div class={cn(styles.sockets, styles.inputs)}>
        <For each={currentNode().inputs}>
          {(nodeInput, index) => (
            <div
              class={cn(styles.socket, !!nodeInput.connectedNodes.length && styles.connected)}
              onMouseDown={(e: MouseEvent) => handleSocketMouseDown(e, "inputs", index())}
            />
          )}
        </For>
      </div>
      <div class={cn(styles.sockets, styles.outputs)}>
        <For each={currentNode().outputs}>
          {(nodeOutput, index) => (
            <div
              class={cn(styles.socket, !!nodeOutput.connectedNodes.length && styles.connected)}
              onMouseDown={(e: MouseEvent) => handleSocketMouseDown(e, "outputs", index())}
            />
          )}
        </For>
      </div>
    </div>
  );
}

export default Node;
