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

export { allNodes };
