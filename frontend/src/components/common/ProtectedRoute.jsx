import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

export default function ProtectedRoute({children}){
  const { user } = useAuth()
  const location = useLocation()
  
  // Also check localStorage for token as backup
  const token = localStorage.getItem('gamingstore_token')
  
  if(!user && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  return children
}
