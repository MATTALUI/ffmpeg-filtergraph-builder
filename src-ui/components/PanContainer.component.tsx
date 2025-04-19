import {
  type Component,
  createSignal,
  For,
} from "solid-js";
import type {
  MouseDownValues,
} from "../types";
import Node from "./Node.component";
import cn from "classnames";
import styles from "./PanContainer.module.scss";
import { allNodes } from "../signals/nodes";
import ConnectionManager from "./ConnectionManager.component";

const PanContainer: Component = () => {
  const [mouseDownValues, setMouseDownValues] = createSignal<MouseDownValues>({
    mouseX: 0,
    mouseY: 0,
    originalX: 0,
    originalY: 0,
  });
  const [x, setX] = createSignal(0);
  const [y, setY] = createSignal(0);
  const [mouseIsDown, setMouseIsDown] = createSignal(false);

  const handleMouseMove = (event: MouseEvent) => {
    const initialValues = mouseDownValues();
    const xDiff = initialValues.mouseX - event.clientX
    const yDiff = initialValues.mouseY - event.clientY;
    const newX = initialValues.originalX - xDiff;
    const newY = initialValues.originalY - yDiff;
    setX(newX);
    setY(newY);
  }

  const handleMouseUp = (_event: MouseEvent) => {
    setMouseIsDown(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }

  const handleMouseDown = (event: MouseEvent) => {
    if (event.button === 2) return;
    setMouseIsDown(true);
    setMouseDownValues({
      mouseX: event.clientX,
      mouseY: event.clientY,
      originalX: x(),
      originalY: y(),
    });
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  return (
    <div
      class={cn(
        styles.panContainer,
        mouseIsDown() && styles.grabbed,
      )}
      onMouseDown={handleMouseDown}
    >
      <div
        id="pan-screen"
        class={styles.pannable}
        style={{
          left: `${x()}px`,
          top: `${y()}px`,
        }}
      >
        <For each={Object.values(allNodes)}>
          {(node) => (<Node node={node} />)}
        </For>
        <ConnectionManager />
      </div>
    </div>
  );
}

export default PanContainer;
