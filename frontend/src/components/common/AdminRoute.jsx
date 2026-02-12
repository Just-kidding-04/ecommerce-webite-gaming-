import React from 'react'
import { Navigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

export default function AdminRoute({children}){
  const { user } = useAuth()
  if(!user) return <Navigate to="/login" replace />
  // Check for admin role
  if(user.role !== 'admin' && !user.isAdmin) return <Navigate to="/" replace />
  return children
}
