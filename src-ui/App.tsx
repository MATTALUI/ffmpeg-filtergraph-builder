import './App.css'
import ContextMenu from './components/ContextMenu.component'
import PanContainer from './components/PanContainer.component'
import Toolbar from './components/Toolbar.component'
import { NodesContextProvider } from './context/nodes'
import { UIContextProvider } from './context/ui'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UIContextProvider>
        <NodesContextProvider>
          <ContextMenu />
          <Toolbar />
          <PanContainer />
        </NodesContextProvider>
      </UIContextProvider>
    </QueryClientProvider>
  )
}

export default App
