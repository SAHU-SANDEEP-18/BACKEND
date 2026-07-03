import React, { useEffect } from 'react'
import { RouterProvider } from 'react-router'
import { router } from './app.routers'
import { useAuth } from '../features/auth/hook/useAuth'
import { AppToastContainer } from '../components/CustomToast'

const App = () => {
  const auth = useAuth()

  useEffect(()=>{
    auth.handleGetMe()
  },[])

  return (
    <AppToastContainer>
      <RouterProvider router={router} />
    </AppToastContainer>
  )
}

export default App