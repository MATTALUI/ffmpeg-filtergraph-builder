import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useCallbackRef } from "../hooks/useCallbackRef";

type UIContext = {
  mouseCoords: { x: number, y: number };
  workspaceMouseCoords: { x: number, y: number };
  panScreenRef: React.RefObject<HTMLDivElement | null>;
};


const defaultContext: UIContext = {
  mouseCoords: { x: 0, y: 0 },
  workspaceMouseCoords: { x: 0, y: 0 },
  panScreenRef: { current: null },
};

const Context = createContext<UIContext>(defaultContext);

export const useUI: () => UIContext = () => useContext(Context);

export const UIContextProvider: React.FC<{ children: React.ReactNode }> = (
  props: { children: React.ReactNode }
) => {
  const [mouseCoords, setMouseCoords] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [workspaceMouseCoords, setWorkspaceMouseCoords] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const panScreenRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = useCallbackRef((event: MouseEvent) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    setMouseCoords({
      x: mouseX,
      y: mouseY,
    });
    if (!panScreenRef.current) return;
    const panScreen = panScreenRef.current;
    const panScreenBounds = panScreen.getBoundingClientRect();
    const workspaceMouseX = mouseX - panScreenBounds.x;
    const workspaceMouseY = mouseY - panScreenBounds.y;
    setWorkspaceMouseCoords({
      x: workspaceMouseX,
      y: workspaceMouseY,
    });
  });

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  const value = useMemo(() => ({
    mouseCoords,
    workspaceMouseCoords,
    panScreenRef,
  }), [mouseCoords, workspaceMouseCoords, panScreenRef]);

  return <Context.Provider value={value}>{props.children}</Context.Provider>;
};
