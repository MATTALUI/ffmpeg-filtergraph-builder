import {
  For,
  createMemo,
  createSignal,
  onMount,
  type Component,
} from "solid-js";
import type { Node } from "../types";
import { allNodes } from "../signals/nodes";

type ConnectionSummary = {
  x: number;
  y: number;
  height: number;
  width: number;
  pathD: string;
  pathStrokeWidth: number;
};

const buildNodeConnectionSummary = (
  outputNode: Node,
  inputNode: Node
): ConnectionSummary => {
  const outputSocketIndex = outputNode.outputs.indexOf(inputNode.id);
  const inputSocketIndex = inputNode.inputs.indexOf(outputNode.id);
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
    pathD = `M ${padding} ${height-padding} C ${width / 2} ${height - padding}, ${width / 2} ${padding}, ${width - padding} ${padding}`;
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

const ConnectionManager: Component = () => {
  const [hasRendered, setHasRendered] = createSignal(false);
  onMount(() => setHasRendered(true));
  const connections = createMemo(() => {
    if (!hasRendered()) return;
    const connections: Record<string, ConnectionSummary> = {};

    Object.values(allNodes).forEach((node) => {
      node.inputs.forEach((node2Id) => {
        if (!node2Id) return;
        const key = [node.id, node2Id].sort().join("-");
        if (connections[key]) return;
        connections[key] = buildNodeConnectionSummary(allNodes[node2Id], node);
      });
      node.outputs.forEach((node2Id) => {
        if (!node2Id) return;
        const key = [node.id, node2Id].sort().join("-");
        if (connections[key]) return;
        connections[key] = buildNodeConnectionSummary(node, allNodes[node2Id]);
      });
    });

    return Object.values(connections);
  })

  return (
    <div>
      <For each={connections()}>
        {(connection) => (
          <svg
            height={connection.height}
            width={connection.width}
            style={{
              // "background-color": "#69696969",
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
