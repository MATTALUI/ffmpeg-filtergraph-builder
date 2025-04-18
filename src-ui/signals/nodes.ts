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
    y: 300,
    inputs: [],
    outputs: ["testFilter"],
  },
  "testFilter": {
    id: "testFilter",
    name: "Test Filter",
    x: 800,
    y: 400,
    inputs: ["wildcard", "testinput"],
    outputs: [null],
  },
  "wildcard": {
    id: "wildcard",
    name: "WILDCARD!",
    x: 69,
    y: 69,
    inputs: [null, null, null, null],
    outputs: [null, null, "testFilter", null],
  },
  "multiconnect": {
    id: "multiconnect",
    name: "Multiconnected Node",
    x: 469,
    y: 69,
    inputs: [null, null, null, null],
    outputs: [],
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
