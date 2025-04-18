import {
  createStore,
} from "solid-js/store";
import type {
  Node,
} from "../types";

type NodeUpdate = Pick<Node, "id"> & Partial<Omit<Node, "id">>;

const [allNodes, setAllNodes] = createStore<Record<Node["id"], Node>>({
  "testinput": {
    id: "testinput",
    name: "Test Input",
    x: 400,
    y: 200,
    inputs: [],
    outputs: ["testFilter"],
  },
  "testFilter": {
    id: "testFilter",
    name: "Test Output",
    x: 800,
    y: 500,
    inputs: ["testinput"],
    outputs: [null, null],
  },
  "wildcard": {
    id: "wildcard",
    name: "WILDCARD!",
    x: 69,
    y: 69,
    inputs: [null, null, null, null],
    outputs: [null, null, null, null],
  },
});

export const updateNode = (updates: NodeUpdate) => {
  setAllNodes((currentNodes) => {
    const newNodes = structuredClone(currentNodes);
    Object.assign(newNodes[updates.id], updates);
    return newNodes;
  });
}

export { allNodes };
