import { RouterProvider } from 'react-router-dom'
import router from './router'
import Spinner from './components/Spinner'
import './App.css'

function App() {
  return <RouterProvider router={router} />;
}

export default App
