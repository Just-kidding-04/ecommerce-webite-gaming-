import React from 'react'
import { Navigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

export default function SellerRoute({children}){
  const { user } = useAuth()
  if(!user) return <Navigate to="/seller/login" replace />
  // Check for seller or admin role (admin has all access)
  const isSeller = user.role === 'seller' || user.role === 'admin' || user.isSeller
  if(!isSeller) return <Navigate to="/" replace />
  return children
}
