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
import ProtectedRoute from './protectedRoutes';

function App() {
  // const [count, setCount] = useState(0)
  const router = createBrowserRouter([
    {
      path: "/avb",
      element: <ProtectedRoute><AVBInvoice /></ProtectedRoute>,
    },
    {
      path: "/create-invoice",
      element: <ProtectedRoute><CreateInvoice /></ProtectedRoute>,
    },
    {
      path: "/invoiceList",
      element: <ProtectedRoute><InvoiceListComponent /></ProtectedRoute>
    },
    {
      path: "/create-user",
      element: <ProtectedRoute><CreateUser /></ProtectedRoute>
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
