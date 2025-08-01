import './App.css'
import ContextMenu from './components/ContextMenu.component'
import PanContainer from './components/PanContainer.component'
import Toolbar from './components/Toolbar.component'
import { NodesContextProvider } from './context/nodes'

function App() {
  return (
    <NodesContextProvider>
      <ContextMenu />
      <Toolbar />
      <PanContainer />
    </NodesContextProvider>
  )
}

export default App
