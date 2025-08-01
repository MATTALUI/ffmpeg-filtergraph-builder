// import {
//   type Component,
//   Show,
//   createSignal,
//   onCleanup,
//   onMount,
// } from "solid-js";
import React, { useState, useCallback, useEffect } from "react"
import styles from "./ContextMenu.module.scss";
import cn from "classnames";
// import FilterSelector from "./FilterSelector.component";
import { open as openFiles, save as saveFile } from '@tauri-apps/plugin-dialog';
import type { ExtendedContextMenuEvent, InputNode, Node, OutputNode } from "../types";
import { useCallbackRef } from "../hooks/useCallbackRef";
import FilterSelector from "./FilterSelector.component";
// import { addNode, removeNode } from "../signals/nodes";
// import { workspaceMouseCoords } from "../signals/ui";

const ContextMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0 });
  const [contextNode, setContextNode] = useState<Node | null>(null);

  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  const handleContextMenu = useCallbackRef((event: ExtendedContextMenuEvent) => {
    if (event.ctrlKey) return;
    event.preventDefault();
    event.stopPropagation();
    setAnchor({ x: event.clientX, y: event.clientY });
    setContextNode(event.node || null);
    open();
  })

  const stopProp = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
  };

  const addMediaInputs = async () => {
    const files = await openFiles({ multiple: true, directory: false }) || [];
    const { x: mouseX, y: mouseY } = { x: 0, y: 0 }; // workspaceMouseCoords();
    const offsetSize = 25;
    files.forEach((filePath, index) => {
      const pathSegs = filePath.split("/")
      const name = pathSegs[pathSegs.length - 1];
      const newNode: InputNode = {
        type: "input",
        id: crypto.randomUUID(),
        x: mouseX + (index * offsetSize),
        y: mouseY + (index * offsetSize),
        name,
        inputs: [],
        outputs: [{ type: "video", connectedNodes: [], name: "default" }],
        preview: filePath,
      };
      // addNode(newNode);
    });
    close();
  }

  const addOutputFile = async () => {
    const filePath = await saveFile();
    if (!filePath) return;
    console.log(filePath);
    const { x, y } = { x: 0, y: 0 }; // workspaceMouseCoords();
    const name = filePath.split("/").pop() || "output";
    const newNode: OutputNode = {
      type: "output",
      id: crypto.randomUUID(),
      x,
      y,
      name,
      inputs: [{ type: "video", connectedNodes: [], name: "default" }],
      outputs: [],
      preview: "/icon.png",
    }
    // addNode(newNode);
    close();
  }

  const deleteNode = () => {
    // const node = contextNode();
    // if (!node) return;
    // removeNode(node.id);
    close();
  }

  useEffect(() => {
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [handleContextMenu]);

  // onMount(() => {
  //   document.addEventListener("contextmenu", handleContextMenu);
  // });

  // onCleanup(() => {
  //   document.removeEventListener("contextmenu", handleContextMenu);
  // });

  return (
    <>
      {isOpen && (
        <div
          className={styles.backdrop}
          onClick={close}
        >
          <div
            className={styles.menuContainer}
            onClick={stopProp}
            style={{
              top: `${anchor.y}px`,
              left: `${anchor.x}px`,
            }}
          >
            <div className={cn(styles.menuOption, styles.disabled)}>
              Save
            </div>
            <div
              className={styles.menuOption}
              onClick={addMediaInputs}
            >
              {/* This will need some updates to support a web service */}
              Add Input File...
            </div>
            <div
              className={styles.menuOption}
              onClick={addOutputFile}
            >
              {/* This will need some updates to support a web service */}
              Add Output File...
            </div>
            <div className={styles.menuOption}>
              Add Filter...
              <div className={styles.subMenu}>
                <FilterSelector
                  closeMenu={close}
                />
              </div>
            </div>
            {!!contextNode && (
              <div
                className={styles.menuOption}
                onClick={deleteNode}
              >
                Delete Node
              </div>
            )}
            {/* <div className={cn(styles.menuOption, styles.disabled)}>
          Delete the World
          <div className={styles.subMenu}>
            Do it!
          </div>
        </div> */}
            {/* <div className={cn(styles.menuOption)}>
          Sub Menu Test
          <div className={styles.subMenu}>
            <div className={cn(styles.menuOption)}>
              1
            </div>
            <div className={cn(styles.menuOption)}>
              2
              <div className={styles.subMenu}>
                Three deep?
              </div>
            </div>
            <div className={cn(styles.menuOption)}>
              2
            </div>
            <div className={cn(styles.menuOption)}>
              3
            </div>
          </div>
        </div> */}
          </div>
        </div>
      )}
    </>
  )
}

export default ContextMenu;
