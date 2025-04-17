import {
  type Component,
  createSignal
} from "solid-js";
import styles from "./Node.module.scss";

interface INodeProps {
  initialX: number;
  initialY: number;
};

const Node: Component<INodeProps> = (
  props: INodeProps,
) => {
  const [x, setX] = createSignal(props.initialX);
  const [y, setY] = createSignal(props.initialY);
  const [mouseDownValues, setMouseDownValues] = createSignal<MouseDownValues>({
    mouseX: 0,
    mouseY: 0,
    originalX: 0,
    originalY: 0,
  });

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
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }

  const handleMouseDown = (event: MouseEvent) => {
    event.stopImmediatePropagation();
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
      class={styles.node}
      style={{
        left: `${x()}px`,
        top: `${y()}px`,
      }}
      onMouseDown={handleMouseDown}
    >

    </div>
  );
}

export default Node;
