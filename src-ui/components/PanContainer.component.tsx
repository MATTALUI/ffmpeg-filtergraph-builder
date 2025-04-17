import {
  type Component,
  createSignal,
} from "solid-js";
import styles from "./PanContainer.module.scss";
import cn from "classnames";

type MouseDownValues = {
  mouseX: number;
  mouseY: number;
  originalX: number;
  originalY: number;
};

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

  const handleMouseUp = (event: MouseEvent) => {
    console.log("handleMouseUp");
    setMouseIsDown(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }

  const handleMouseDown = (event: MouseEvent) => {
    console.log("handleMouseDown");
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
        class={styles.pannable}
        style={{
          left: `${x()}px`,
          top: `${y()}px`,
        }}
      >
        <div
          class={styles.node}
          style={{
            left: "400px",
            top: "200px",
          }}
        />

        <div
          class={styles.node}
          style={{
            left: "800px",
            top: "500px",
          }}
        />
      </div>
    </div>
  );
}

export default PanContainer;
