import React, { useState, useCallback, useEffect, MouseEventHandler } from "react"
import styles from "./ContextMenu.module.scss";
import cn from "classnames";
import { open as openFiles, save as saveFile } from '@tauri-apps/plugin-dialog';
import type { ExtendedContextMenuEvent, InputNode, Node, OutputNode } from "../types";
import { useCallbackRef } from "../hooks/useCallbackRef";
import FilterSelector from "./FilterSelector.component";
import { useNodes } from "../context/nodes";
// import { workspaceMouseCoords } from "../signals/ui";

const ContextMenu: React.FC = () => {
  const { addNodes, removeNodes } = useNodes();
  const [isOpen, setIsOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0 });
  const [contextNode, setContextNode] = useState<Node | null>(null);

  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  const handleContextMenu = useCallback((event: ExtendedContextMenuEvent<Document, React.MouseEvent>) => {
    if (event.ctrlKey) return;
    event.preventDefault();
    event.stopPropagation();
    setAnchor({ x: event.clientX, y: event.clientY });
    setContextNode(event.node || null);
    open();
  }, [setAnchor, setContextNode, open]);

  const stopProp = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
  }, []);

  const addMediaInputs = useCallback(async () => {
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
      addNodes([newNode]);
    });
    close();
  }, [close, addNodes]);

  const addOutputFile = useCallback(async () => {
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
    addNodes([newNode]);
    close();
  }, [close, addNodes]);

  const deleteNode = useCallback(() => {
    if (!contextNode) return;
    removeNodes([contextNode.id]);
    close();
  }, [close, removeNodes, contextNode?.id]);

  useEffect(() => {
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [handleContextMenu]);

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
