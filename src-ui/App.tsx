import Toolbar from "./components/Toolbar.component";
import "./App.css";
import PanContainer from "./components/PanContainer.component";
import ContextMenu from "./components/ContextMenu.component";

function App() {
  return (
    <>
      <ContextMenu />
      <Toolbar />
      <PanContainer />
    </>
  );
}

export default App;
