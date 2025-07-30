import {
  createStore,
} from "solid-js/store";
import type {
  Node,
} from "../types";
import { TEMPSOCKET } from "../constants";
import { cloneDeep } from "lodash";

type NodeUpdate = Pick<Node, "id"> & Partial<Omit<Node, "id">>;

const [allNodes, setAllNodes] = createStore<Record<Node["id"], Node>>({});

export const updateNodes = (updates: NodeUpdate[]) => {
  setAllNodes((currentNodes) => {
    const newNodes = structuredClone(currentNodes);
    updates.forEach((update) => {
      Object.assign(newNodes[update.id], update);
    });
    return newNodes;
  });
}

export const addNode = (newNode: Node) => {
  setAllNodes((currentNodes) => {
    const newNodes = structuredClone(currentNodes);
    newNodes[newNode.id] = newNode;
    return newNodes;
  });
}

export const removeTempConnections = (node: Node) => {
  cloneDeep(node.inputs).forEach((i) => i.connectedNodes = i.connectedNodes.filter((id) => id !== TEMPSOCKET));
  cloneDeep(node.outputs).forEach((i) => i.connectedNodes = i.connectedNodes.filter((id) => id !== TEMPSOCKET));
  updateNodes([{
    id: node.id,
    inputs: node.inputs,
    outputs: node.outputs,
  }]);
}

export const removeNode = (nodeId: Node["id"]) => {
  setAllNodes((currentNodes) => {
    const newNodes = structuredClone(currentNodes);
    const node = newNodes[nodeId];
    if (!node) return newNodes;
    newNodes[nodeId] = undefined!; // forces deletion

    node.inputs.forEach((input) => {
      input.connectedNodes.forEach((connectedNodeId) => {
        const connectedNode = newNodes[connectedNodeId];
        if (!connectedNode) return;
        connectedNode.outputs.forEach((output) => {
          output.connectedNodes = output.connectedNodes.filter((id) => id !== nodeId);
        });
        connectedNode.inputs.forEach((input) => {
          input.connectedNodes = input.connectedNodes.filter((id) => id !== nodeId);
        });
      });
    });

    node.outputs.forEach((output) => {
      output.connectedNodes.forEach((connectedNodeId) => {
        const connectedNode = newNodes[connectedNodeId];
        if (!connectedNode) return;
        connectedNode.outputs.forEach((output) => {
          output.connectedNodes = output.connectedNodes.filter((id) => id !== nodeId);
        });
        connectedNode.inputs.forEach((input) => {
          input.connectedNodes = input.connectedNodes.filter((id) => id !== nodeId);
        });
      });
    });

    return newNodes;
  });
}

export { allNodes };
