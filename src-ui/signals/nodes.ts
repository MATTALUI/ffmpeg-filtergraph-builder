import {
  createStore,
} from "solid-js/store";
import type {
  Node,
} from "../types";
import { TEMPSOCKET } from "../constants";
import { cloneDeep } from "lodash";

type NodeUpdate = Pick<Node, "id"> & Partial<Omit<Node, "id">>;

const [allNodes, setAllNodes] = createStore<Record<Node["id"], Node>>({
  // "testinput": {
  //   id: "testinput",
  //   name: "HomeVideo.mp4",
  //   x: 100,
  //   y: 200,
  //   inputs: [],
  //   outputs: ["testFilter"],
  // },
  // "testFilter": {
  //   id: "testFilter",
  //   name: "chromakey",
  //   x: 469,
  //   y: 250,
  //   inputs: ["testinput"],
  //   outputs: [null],
  // },
  // "testpic": {
  //   id: "testpic",
  //   name: "CompanyLogo.png",
  //   x: 69,
  //   y: 69,
  //   inputs: [],
  //   outputs: [null],
  // },
  // "overlay": {
  //   id: "overlay",
  //   name: "Crop",
  //   x: 369,
  //   y: 69,
  //   inputs: [null, null],
  //   outputs: [null],
  // },
  // "wildcard": {
  //   id: "wildcard",
  //   name: "WILDCARD!",
  //   x: 69,
  //   y: 69,
  //   inputs: [null, null, null, null],
  //   outputs: [null, null, null, null],
  // },
  // "multiconnect": {
  //   id: "multiconnect",
  //   name: "Multiconnected Node",
  //   x: 469,
  //   y: 69,
  //   inputs: [null, null, null, null],
  //   outputs: [],
  // },
});

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
