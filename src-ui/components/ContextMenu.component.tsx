import {
  type Component,
  Show,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import styles from "./ContextMenu.module.scss";
import cn from "classnames";
import FilterSelector from "./FilterSelector.component";
import { open as openFiles } from '@tauri-apps/plugin-dialog';
import type { ExtendedContextMenuEvent, InputNode, Node } from "../types";
import { addNode, removeNode } from "../signals/nodes";
import { workspaceMouseCoords } from "../signals/ui";

const ContextMenu: Component = () => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [anchor, setAnchor] = createSignal({ x: 0, y: 0 });
  const [contextNode, setContextNode] = createSignal<Node | null>(null);

  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  const handleContextMenu = (event: ExtendedContextMenuEvent) => {
    if (event.ctrlKey) return;
    event.preventDefault();
    event.stopPropagation();
    setAnchor({ x: event.clientX, y: event.clientY });
    setContextNode(event.node || null);
    open();
  }

  const stopProp = (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
  };

  const addMediaInputs = async () => {
    const files = await openFiles({ multiple: true, directory: false }) || [];
    const { x: mouseX, y: mouseY } = workspaceMouseCoords();
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
      addNode(newNode);
    });
    close();
  }

  const deleteNode = () => {
    const node = contextNode();
    if (!node) return;
    removeNode(node.id);
    close();
  }

  onMount(() => {
    document.addEventListener("contextmenu", handleContextMenu);
  });

  onCleanup(() => {
    document.removeEventListener("contextmenu", handleContextMenu);
  });

  return (
    <Show when={isOpen()}>
      <div
        class={styles.backdrop}
        onClick={close}
      >
        <div
          class={styles.menuContainer}
          onClick={stopProp}
          style={{
            top: `${anchor().y}px`,
            left: `${anchor().x}px`,
          }}
        >
          <div class={cn(styles.menuOption, styles.disabled)}>
            Save
          </div>
          <div
            class={styles.menuOption}
            onClick={addMediaInputs}
          >
            {/* This will need some updates to support a web service */}
            Add Input File...
          </div>
          <div class={styles.menuOption}>
            Add Filter...
            <div class={styles.subMenu}>
              <FilterSelector
                closeMenu={close}
              />
            </div>
          </div>
          <Show when={contextNode()}>
            <div
              class={styles.menuOption}
              onClick={deleteNode}
            >
              Delete Node
            </div>
          </Show>
          {/* <div class={cn(styles.menuOption, styles.disabled)}>
            Delete the World
            <div class={styles.subMenu}>
              Do it!
            </div>
          </div> */}
          {/* <div class={cn(styles.menuOption)}>
            Sub Menu Test
            <div class={styles.subMenu}>
              <div class={cn(styles.menuOption)}>
                1
              </div>
              <div class={cn(styles.menuOption)}>
                2
                <div class={styles.subMenu}>
                  Three deep?
                </div>
              </div>
              <div class={cn(styles.menuOption)}>
                2
              </div>
              <div class={cn(styles.menuOption)}>
                3
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </Show>
  )
}

export default ContextMenu;
