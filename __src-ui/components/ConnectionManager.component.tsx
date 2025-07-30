import {
  For,
  createMemo,
  createSignal,
  onMount,
  type Component,
} from "solid-js";
import { TEMPSOCKET } from "../constants";
import type { Node } from "../types";
import { allNodes } from "../signals/nodes";
import { workspaceMouseCoords } from "../signals/ui";

type ConnectionSummary = {
  x: number;
  y: number;
  height: number;
  width: number;
  pathD: string;
  pathStrokeWidth: number;
};

const ConnectionManager: Component = () => {
  const [hasRendered, setHasRendered] = createSignal(false);
  onMount(() => setHasRendered(true));

  const buildNodeConnectionSummary = (
    outputNode: Node,
    inputNode: Node
  ): ConnectionSummary => {
    const outputSocket = outputNode.outputs.find(o => o.connectedNodes.includes(inputNode.id));
    if (!outputSocket) throw new Error("Could not find connection in output");
    const outputSocketIndex = outputNode.outputs.indexOf(outputSocket);
    const inputSocket = inputNode.inputs.find(i => i.connectedNodes.includes(outputNode.id));
    if (!inputSocket) throw new Error("Could not find connection in input");
    const inputSocketIndex = inputNode.inputs.indexOf(inputSocket);
    const outputEle = document.querySelector(`#node-${outputNode.id}`);
    const inputEle = document.querySelector(`#node-${inputNode.id}`);
    if (!outputEle || !inputEle) throw new Error("Didn't find socket elements");
    const outputBounds = outputEle.getBoundingClientRect();
    const inputBounds = inputEle.getBoundingClientRect();
    const outputSegmentSize = outputBounds.height / outputNode.outputs.length;
    const outputSocketOffset =
      (outputSegmentSize * outputSocketIndex - 1) + (outputSegmentSize / 2);
    const outputY = outputNode.y + outputSocketOffset;
    const outputX = outputNode.x + outputBounds.width;
    const inputSegmentSize = inputBounds.height / inputNode.inputs.length;
    const inputSocketOffset =
      (inputSegmentSize * inputSocketIndex - 1) + (inputSegmentSize / 2);
    const inputY = inputNode.y + inputSocketOffset;
    const inputX = inputNode.x;

    const nodeWithLeftestSocket = outputX <= inputX ? outputNode : inputNode;
    const nodeWithHighestSocket = outputY <= inputY ? outputNode : inputNode;

    const padding = 10;
    const x = Math.min(outputX, inputX) - padding;
    const y = Math.min(outputY, inputY) - padding;
    const width = Math.abs(outputX - inputX) + padding * 2;
    const height = Math.abs(outputY - inputY) + padding * 2;
    const pathStrokeWidth = 3;
    let pathD = "M 0 0";

    if (nodeWithHighestSocket === nodeWithLeftestSocket) {
      pathD = `M ${padding} ${padding} C ${width / 2} ${padding}, ${width / 2} ${height - padding}, ${width - padding} ${height - padding}`;
    } else {
      pathD = `M ${padding} ${height - padding} C ${width / 2} ${height - padding}, ${width / 2} ${padding}, ${width - padding} ${padding}`;
    }

    return {
      x,
      y,
      width,
      height,
      pathD,
      pathStrokeWidth,
    };
  }

  const buildTempNode = (node: Node): ConnectionSummary => {
    const outputSocket = node.outputs.find(s => s.connectedNodes.includes(TEMPSOCKET));
    const inputSocket = node.inputs.find(s => s.connectedNodes.includes(TEMPSOCKET));
    const socketType = !!inputSocket ? "inputs" : "outputs";
    const socketIndex = !!inputSocket
      ? node.inputs.indexOf(inputSocket)
      : node.outputs.indexOf(outputSocket!);
    const nodeEle = document.querySelector(`#node-${node.id}`);
    if (!nodeEle) throw new Error("Didn't find socket elements");
    const nodeBounds = nodeEle.getBoundingClientRect();
    const nodeX = socketType === "outputs" ? node.x + nodeBounds.width : node.x;
    const segmentSize = nodeBounds.height / node[socketType].length;
    const socketYOffset =
      (segmentSize * socketIndex - 1) + (segmentSize / 2);
    const nodeY = node.y + socketYOffset;
    const { x: mouseX, y: mouseY } = workspaceMouseCoords();

    const padding = 10;
    const x = Math.min(nodeX, mouseX) - padding;
    const y = Math.min(nodeY, mouseY) - padding;
    const width = Math.abs(nodeX - mouseX) + padding * 2;
    const height = Math.abs(nodeY - mouseY) + padding * 2;
    const pathStrokeWidth = 3;
    let pathD = "M 0 0";

    const descending = (mouseX >= nodeX && mouseY >= nodeY) || (mouseX <= nodeX && mouseY <= nodeY);

    if (descending) {
      pathD = `M ${padding} ${padding} C ${width / 2} ${padding}, ${width / 2} ${height - padding}, ${width - padding} ${height - padding}`;
    } else {
      pathD = `M ${padding} ${height - padding} C ${width / 2} ${height - padding}, ${width / 2} ${padding}, ${width - padding} ${padding}`;
    }

    return {
      x, y, width, height, pathStrokeWidth, pathD,
    }
  }

  const connections = createMemo(() => {
    if (!hasRendered()) return;
    const connections: Record<string, ConnectionSummary> = {};
    Object.values(allNodes).forEach((node) => {
      node.inputs.forEach((nodeConnection) => {
        nodeConnection.connectedNodes.forEach((node2Id) => {
          const key = [node.id, node2Id].sort().join("-");
          if (connections[key]) return;
          if (node2Id === TEMPSOCKET)
            connections[key] = buildTempNode(node);
          else
            connections[key] = buildNodeConnectionSummary(allNodes[node2Id], node);
        });
      });
      node.outputs.forEach((nodeConnection) => {
        nodeConnection.connectedNodes.forEach((node2Id) => {
          const key = [node.id, node2Id].sort().join("-");
          if (connections[key]) return;
          if (node2Id === TEMPSOCKET)
            connections[key] = buildTempNode(node);
          else
            connections[key] = buildNodeConnectionSummary(node, allNodes[node2Id]);
        });
      });
    });

    return Object.values(connections);
  });

  return (
    <div>
      <For each={connections()}>
        {(connection) => (
          <svg
            height={connection.height}
            width={connection.width}
            style={{
              position: "absolute",
              top: `${connection.y}px`,
              left: `${connection.x}px`,
            }}
          >
            <path
              d={connection.pathD}
              stroke="black"
              stroke-width={`${connection.pathStrokeWidth}px`}
              fill="transparent"
            />
          </svg>
        )}
      </For>
    </div>
  );
}

export default ConnectionManager;
