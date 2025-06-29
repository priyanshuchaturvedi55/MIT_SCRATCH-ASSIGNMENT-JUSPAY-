import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Wholesection from './mitscratch/wholesection'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
       <Wholesection/>
    </div>
  )
}

export default App
