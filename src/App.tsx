// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import AVBInvoice from './pages/invoices/avb'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import CreateInvoice from './pages/invoices/createInvoice';

function App() {
  // const [count, setCount] = useState(0)
  const router = createBrowserRouter([
    {
      path: "/avb",
      element: <AVBInvoice />,
    },
    {
      path: "/",
      element: <CreateInvoice />
    }
  ])
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
