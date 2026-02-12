import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home/Home'
import ProductList from '../pages/Products/ProductList'
import ProductDetails from '../pages/Products/ProductDetails'
import Cart from '../pages/Cart/Cart'
import Checkout from '../pages/Checkout/Checkout'
import Login from '../pages/Auth/Login'
import Register from '../pages/Auth/Register'
import AdminLogin from '../pages/Auth/AdminLogin'
import ForgotPassword from '../pages/Auth/ForgotPassword'
import SellerLogin from '../pages/Auth/SellerLogin'
import SellerRegister from '../pages/Auth/SellerRegister'
import Wishlist from '../pages/Wishlist/Wishlist'
import Contact from '../pages/Support/Contact'
import Help from '../pages/Support/Help'
import Orders from '../pages/Orders/OrderList'
import OrderDetails from '../pages/Orders/OrderDetails'
import Profile from '../pages/Profile/Profile'
import Compare from '../pages/Compare/Compare'

import Dashboard from '../pages/Admin/Dashboard'
import AdminProducts from '../pages/Admin/Products'
import AdminUsers from '../pages/Admin/Users'
import AdminOrders from '../pages/Admin/Orders'
import AdminReports from '../pages/Admin/Reports'

import SellerDashboard from '../pages/Seller/SellerDashboard'
import AddProduct from '../pages/Seller/AddProduct'
import EditProduct from '../pages/Seller/EditProduct'
import SellerInventory from '../pages/Seller/Inventory'
import SellerProfile from '../pages/Seller/SellerProfile'

import ProtectedRoute from '../components/common/ProtectedRoute'
import AdminRoute from '../components/common/AdminRoute'
import SellerRoute from '../components/common/SellerRoute'

export default function AppRoutes(){
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home/>} />
      <Route path="/products" element={<ProductList/>} />
      <Route path="/products/:id" element={<ProductDetails/>} />
      <Route path="/cart" element={<Cart/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />
      <Route path="/admin-login" element={<AdminLogin/>} />
      <Route path="/seller/login" element={<SellerLogin/>} />
      <Route path="/seller/register" element={<SellerRegister/>} />
      <Route path="/forgot" element={<ForgotPassword/>} />
      <Route path="/contact" element={<Contact/>} />
      <Route path="/support" element={<Contact/>} />
      <Route path="/help" element={<Help/>} />
      <Route path="/compare" element={<Compare/>} />
      
      {/* User Routes - requires login (any role) */}
      <Route path="/checkout" element={<ProtectedRoute><Checkout/></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><Wishlist/></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Orders/></ProtectedRoute>} />
      <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetails/></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />

      {/* Seller Routes - requires seller or admin role */}
      <Route path="/seller/dashboard" element={<SellerRoute><SellerDashboard/></SellerRoute>} />
      <Route path="/seller/add-product" element={<SellerRoute><AddProduct/></SellerRoute>} />
      <Route path="/seller/edit-product/:id" element={<SellerRoute><EditProduct/></SellerRoute>} />
      <Route path="/seller/inventory" element={<SellerRoute><SellerInventory/></SellerRoute>} />
      <Route path="/seller/profile" element={<SellerRoute><SellerProfile/></SellerRoute>} />

      {/* Admin Routes - requires admin role only */}
      <Route path="/admin/dashboard" element={<AdminRoute><Dashboard/></AdminRoute>} />
      <Route path="/admin/products" element={<AdminRoute><AdminProducts/></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsers/></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><AdminOrders/></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute><AdminReports/></AdminRoute>} />
    </Routes>
  )
}
