import {
  createSignal,
} from "solid-js";


export const [mouseCoords, setMouseCoords] = createSignal({ x: 0, y: 0, });

export const watchMouse = (event: MouseEvent) => {
  setMouseCoords({
    x: event.clientX,
    y: event.clientY,
  });
};

export const workspaceMouseCoords = () => {
  const panEle = document.querySelector(`#pan-screen`);
  if (!panEle) return mouseCoords();
  const panBounds = panEle.getBoundingClientRect();

  const x = mouseCoords().x - panBounds.x;
  const y = mouseCoords().y - panBounds.y;

  return { x, y };
};
