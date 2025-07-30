import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      Here is the UI!!!
      {count}
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  )
}

export default App
