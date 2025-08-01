// import {
//   type Component,
//   createEffect,
//   createSignal,
//   For,
//   Show,
// } from "solid-js";
// import {
//   createStore,
// } from "solid-js/store";
import React, { useState, useCallback, MouseEventHandler } from "react"
import type {
  ExtendedContextMenuEvent,
  FilterNode,
  MouseDownValues,
  Node,
} from "../types";
import { TEMPSOCKET } from "../constants";
import styles from "./Node.module.scss";
import cn from "classnames";
// import { allNodes, removeTempConnections, updateNodes } from "../signals/nodes";
import { cloneDeep, uniq } from "lodash";
// import APIService from "../services";
import NodeFilterOptions from "./NodeFilterOptions";

const loadHash: Record<string, string> = {};

interface INodeProps {
  node: Node;
};

interface IPreviewStore {
  loading: boolean;
  loadedFileName: string | null;
  previewUrl: string | null;
};

const Node: React.FC<INodeProps> = (
  props: INodeProps,
) => {
  const allNodes: Record<string, Node> = {};
  const currentNode = allNodes[props.node.id];
  const [active, setActive] = useState(false);
  const [previewData, updatePreviewData] = useState<IPreviewStore>({
    loading: false,
    loadedFileName: null,
    previewUrl: null,
  });
  const [mouseDownValues, setMouseDownValues] = useState<MouseDownValues>({
    mouseX: 0,
    mouseY: 0,
    originalX: 0,
    originalY: 0,
  });
  const loading = previewData.loading;

  const handleMouseMove = (event: MouseEvent) => {
    const initialValues = mouseDownValues;
    const xDiff = initialValues.mouseX - event.clientX
    const yDiff = initialValues.mouseY - event.clientY;
    const x = initialValues.originalX - xDiff;
    const y = initialValues.originalY - yDiff;
    // updateNodes([{
    //   id: currentNode.id,
    //   x,
    //   y,
    // }]);
  }

  const attemptConnection = (event: MouseEvent) => {
    // I don't like this, but it'll get us there until I can refactor into
    // something better...
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
      uniq([...updatedTargetSockets[targetSocketIndex].connectedNodes, currentNode.id]);
    updates.push({
      id: targetNode.id,
      [targetSocketType]: updatedTargetSockets,
    });
    // Update the Original Node
    const outputSocket = currentNode.outputs.find(s => s.connectedNodes.includes(TEMPSOCKET));
    const inputSocket = currentNode.inputs.find(s => s.connectedNodes.includes(TEMPSOCKET));
    const socketType = !!inputSocket ? "inputs" : "outputs";
    const socketIndex = !!inputSocket
      ? currentNode.inputs.indexOf(inputSocket)
      : currentNode.outputs.indexOf(outputSocket!);
    const updatedSockets = cloneDeep(currentNode[socketType]);
    updatedSockets[socketIndex].connectedNodes =
      uniq([...updatedSockets[socketIndex].connectedNodes.filter(id => id !== TEMPSOCKET), targetNode.id]);
    updates.push({
      id: currentNode.id,
      [socketType]: updatedSockets,
    });
    // updateNodes(updates);
  }

  const handleMouseUp = (_event: MouseEvent) => {
    setActive(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    // event.nativeEvent.stopImmediatePropagation(); // use this if the aboe line doesn't work...
    setMouseDownValues({
      mouseX: event.clientX,
      mouseY: event.clientY,
      originalX: currentNode.x,
      originalY: currentNode.y,
    });
    setActive(true);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  const handleSocketMouseUp = (event: MouseEvent) => {
    attemptConnection(event);
    // removeTempConnections(currentNode);
    document.removeEventListener("mouseup", handleSocketMouseUp);
  }

  const handleSocketMouseDown = (
    event: React.MouseEvent<HTMLDivElement>,
    socketType: "inputs" | "outputs",
    index: number,
  ) => {
    event.stopPropagation();
    event.preventDefault();
    const newSockets = cloneDeep(currentNode[socketType]);
    newSockets[index].connectedNodes.push(TEMPSOCKET);
    // updateNodes([{
    //   id: currentNode.id,
    //   [socketType]: newSockets,
    // }]);
    document.addEventListener("mouseup", handleSocketMouseUp);
  }

  // createEffect(async function updatePreview() {
  //   // NOTE: This check to see if we need to reload is actually not going to
  //   // work because updating nodes will cause complete rerender of the node so
  //   // this state will be cleared out and useless to check. There are going to
  //   // be performance issues with this, but it's a necessary evil for now.
  //   const previewFile = currentNode.preview || null;
  //   if (previewFile !== previewData.loadedFileName && previewFile) {
  //     updatePreviewData({ ...previewData, loading: true });
  //     const cachedData = loadHash[previewFile];
  //     let previewUrl: string;
  //     if (cachedData) {
  //       previewUrl = cachedData;
  //     } else if (currentNode.type === "output") {
  //       try {
  //         const response = await fetch(previewFile);
  //         const blob = await response.blob();
  //         const reader = new FileReader();
  //         previewUrl = await new Promise((resolve) => {
  //           reader.onloadend = () => resolve(reader.result as string);
  //           reader.readAsDataURL(blob);
  //         });
  //         loadHash[previewFile] = previewUrl;
  //       } catch (err) {
  //         console.error("Failed to load preview image:", err);
  //         throw new Error("Failed to load preview image");
  //       }
  //     } else {
  //       const previewResponse = await APIService.getFilePreview(previewFile);
  //       if (previewResponse.success) {
  //         previewUrl = previewResponse.data;
  //         loadHash[previewFile] = previewUrl;
  //       } else {
  //         console.error(previewResponse);
  //         throw new Error("Failed to load preview image");
  //       }
  //     }
  //     updatePreviewData({
  //       loading: false,
  //       loadedFileName: previewFile,
  //       previewUrl,
  //     });
  //   }
  // });

  const emitContextMenu = (event: ExtendedContextMenuEvent) => {
    // If we ever run into issues where the node isn't being picked up by the
    // highest level event handler because of propagation issues, we'll need to
    // look into a new workflow where we call stopImmediatePropagation on the
    // event and then dispatch a new event that has the node as the detail.
    event.node = currentNode;
  }

  return (
    <div
      id={`node-${currentNode.id}`}
      className={cn(styles.node, active && styles.active)}
      style={{
        left: `${currentNode.x}px`,
        top: `${currentNode.y}px`,
      }}
      onMouseDown={handleMouseDown}
      onContextMenu={emitContextMenu as unknown as MouseEventHandler<HTMLDivElement>}
    >
      <div className={styles.nodeContent}>
        <div className={styles.nodeName}>
          <span>{currentNode.name}</span>
          {loading && (
            <div className={styles.loader} />
          )}
        </div>
        {previewData.previewUrl && (
          <div className={styles.nodePreview}>
            <img
              src={previewData.previewUrl!}
            />
          </div>
        )}
        {props.node.type === "filter" && props.node.filter.options.length && (
          <NodeFilterOptions node={props.node as FilterNode} />
        )}
      </div>
      <div className={cn(styles.sockets, styles.inputs)}>
        {currentNode.inputs.map((nodeInput, index) => (
          <div
            className={cn(styles.socket, !!nodeInput.connectedNodes.length && styles.connected)}
            onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => handleSocketMouseDown(e, "inputs", index)}
          />
        ))}
      </div>
      <div className={cn(styles.sockets, styles.outputs)}>
        {currentNode.outputs.map((nodeOutput, index) => (
          <div
            className={cn(styles.socket, !!nodeOutput.connectedNodes.length && styles.connected)}
            onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => handleSocketMouseDown(e, "outputs", index)}
          />
        ))}
      </div>
    </div>
  );
}

export default Node;
