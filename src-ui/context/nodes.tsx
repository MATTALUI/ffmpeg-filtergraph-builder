import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Node } from "../types";

type NodeUpdate = Pick<Node, "id"> & Partial<Omit<Node, "id">>;

type NodesContext = {
  addNodes: (nodes: Node[]) => void;
  updateNodes: (updates: NodeUpdate[]) => void;
  removeNodes: (nodeIds: Node["id"][]) => void;
  getNode: (id: Node["id"]) => Node | null;
  allNodes: Node[];
  allNodesIndexed: Record<Node["id"], Node>;
};

const defaultContext: NodesContext = {
  addNodes: () => { },
  updateNodes: () => { },
  removeNodes: () => { },
  getNode: () => null,
  allNodes: [],
  allNodesIndexed: {},
};

const Context = createContext<NodesContext>(defaultContext);

export const useNodes: () => NodesContext = () => useContext(Context);

export const NodesContextProvider: React.FC<{ children: React.ReactNode }> = (
  props: { children: React.ReactNode }
) => {
  const [nodes, setNodes] = useState<Record<Node["id"], Node>>({
    "0": {
      id: "0",
      type: "input",
      x: 300,
      y: 300,
      name: "Test",
      inputs: [],
      outputs: [],
    },
  });
  const allNodes = useMemo(() => Object.values(nodes), [nodes]);

  const getNode = useCallback((id: Node["id"]) => nodes[id] || null, [nodes])

  const addNodes = useCallback((newNodes: Node[]) => {
    setNodes((currentNodes) => {
      const nodes = structuredClone(currentNodes);
      newNodes.forEach((node) => nodes[node.id] = node);
      return nodes;
    });
  }, [setNodes]);

  const updateNodes = useCallback((updates: NodeUpdate[]) => {
    setNodes((currentNodes) => {
      const nodes = structuredClone(currentNodes);
      updates.forEach((update) => {
        if (!nodes[update.id]) throw new Error(`Node ${update.id} not found`);
        Object.assign(nodes[update.id], update);
      });
      return nodes;
    });
  }, [setNodes]);

  const removeNodes = useCallback((nodeIds: Node["id"][]) => {
    setNodes((currentNodes) => {
      const nodes = structuredClone(currentNodes);
      nodeIds.forEach((nodeId) => {
        const node = nodes[nodeId];
        if (!node) return nodes;
        delete nodes[nodeId];
        // Remove any connections to this node
        node.inputs.forEach((input) => {
          input.connectedNodes.forEach((connectedNodeId) => {
            const connectedNode = nodes[connectedNodeId];
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
            const connectedNode = nodes[connectedNodeId];
            if (!connectedNode) return;
            connectedNode.outputs.forEach((output) => {
              output.connectedNodes = output.connectedNodes.filter((id) => id !== nodeId);
            });
            connectedNode.inputs.forEach((input) => {
              input.connectedNodes = input.connectedNodes.filter((id) => id !== nodeId);
            });
          });
        });
      });
      return nodes;
    });
  }, [setNodes]);

  const value = useMemo(() => ({
    getNode,
    addNodes,
    updateNodes,
    removeNodes,
    allNodes,
    allNodesIndexed: nodes
  }), [
    getNode,
    addNodes,
    updateNodes,
    removeNodes,
    allNodes,
    nodes
  ]);


  return (
    <Context.Provider
      value={value}
    >
      {props.children}
    </Context.Provider>
  );
};
