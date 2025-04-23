import Toolbar from "./components/Toolbar.component";
import "./App.css";
import PanContainer from "./components/PanContainer.component";
import ContextMenu from "./components/ContextMenu.component";
import { onCleanup, onMount } from "solid-js";
import { watchMouse } from "./signals/ui";

function App() {
  onMount(() => {
    document.addEventListener("mousemove", watchMouse);
  });
  onCleanup(() => {
    document.removeEventListener("mousemove", watchMouse);
  });

  return (
    <>
      <ContextMenu />
      <Toolbar />
      <PanContainer />
    </>
  );
}

export default App;
