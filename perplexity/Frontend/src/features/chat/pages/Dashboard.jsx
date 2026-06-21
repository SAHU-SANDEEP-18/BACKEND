import React, { useEffect } from 'react'
import { useChat } from '../hook/useChat' 

const Dashboard = () => {
  const chat = useChat()

  useEffect(()=>{
    chat.initializeSocketConnection()
  }, [])

  return (
    <div>Dashboard</div>
  )
}

export default Dashboard