// import {
//   type Component,
//   createSignal,
//   For,
// } from "solid-js";
import React, { useState, useCallback } from "react"
import type {
  MouseDownValues,
} from "../types";
// import Node from "./Node.component";
import cn from "classnames";
import styles from "./PanContainer.module.scss";
// import { allNodes } from "../signals/nodes";
// import ConnectionManager from "./ConnectionManager.component";
import { useCallbackRef } from "../hooks/useCallbackRef";

const PanContainer: React.FC = () => {
  const [mouseDownValues, setMouseDownValues] = useState<MouseDownValues>({
    mouseX: 0,
    mouseY: 0,
    originalX: 0,
    originalY: 0,
  });
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [mouseIsDown, setMouseIsDown] = useState(false);

  const handleMouseMove = useCallbackRef((event: MouseEvent) => {
    const initialValues = { ...mouseDownValues };
    const xDiff = initialValues.mouseX - event.clientX
    const yDiff = initialValues.mouseY - event.clientY;
    const newX = initialValues.originalX - xDiff;
    const newY = initialValues.originalY - yDiff;
    setX(newX);
    setY(newY);
  });

  const handleMouseUp = useCallbackRef((_event: MouseEvent) => {
    setMouseIsDown(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  })

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button === 2) return;
    setMouseIsDown(true);
    setMouseDownValues({
      mouseX: event.clientX,
      mouseY: event.clientY,
      originalX: x,
      originalY: y,
    });
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [setMouseIsDown, setMouseDownValues, handleMouseMove, handleMouseUp]);

  return (
    <div
      className={cn(
        styles.panContainer,
        mouseIsDown && styles.grabbed,
      )}
      onMouseDown={handleMouseDown}
    >
      <div
        id="pan-screen"
        className={styles.pannable}
        style={{
          left: `${x}px`,
          top: `${y}px`,
        }}
      >
        {/* <For each={Object.values(allNodes)}>
          {(node) => (<Node node={node} />)}
        </For> */}
        {/* <ConnectionManager /> */}
      </div>
    </div>
  );
}

export default PanContainer;
