// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import AVBInvoice from './pages/invoices/avb'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import CreateInvoice from './pages/invoices/createInvoice';
import InvoiceListComponent from './pages/invoices/InvoiceList';
import { ToastContainer } from 'react-toastify';
import CreateUser from './pages/signup/signup';
import AuthScreens from './pages/signin/login';

function App() {
  // const [count, setCount] = useState(0)
  const router = createBrowserRouter([
    {
      path: "/avb",
      element: <AVBInvoice />,
    },
    {
      path: "/create-invoice",
      element: <CreateInvoice />
    },
    {
      path: "/invoiceList",
      element: <InvoiceListComponent />
    },
    {
      path: "/create-user",
      element: <CreateUser />
    },
    {
      path: "/",
      element: <AuthScreens />
    }
  ])
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      <RouterProvider router={router} />
    </>
  )
}

export default App
