import './App.css'
import ContextMenu from './components/ContextMenu.component'
import PanContainer from './components/PanContainer.component'
import Toolbar from './components/Toolbar.component'
import { NodesContextProvider } from './context/nodes'
import { UIContextProvider } from './context/ui'

function App() {
  return (
    <UIContextProvider>
      <NodesContextProvider>
        <ContextMenu />
        <Toolbar />
        <PanContainer />
      </NodesContextProvider>
    </UIContextProvider>
  )
}

export default App
