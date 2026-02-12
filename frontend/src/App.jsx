import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ScrollToTop from './components/common/ScrollToTop'
import { ToastContainer } from 'react-toastify'
import { setUser } from './redux/slices/authSlice'
import { CompareProvider } from './context/CompareContext'
import { ThemeProvider } from './context/ThemeContext'
import 'react-toastify/dist/ReactToastify.css'

export default function App() {
  const dispatch = useDispatch()
  const location = useLocation()

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('gamingstore_user')
      if (storedUser) {
        const user = JSON.parse(storedUser)
        dispatch(setUser(user))
      }
    } catch (e) {
      console.error('Failed to restore user:', e)
    }
  }, [dispatch])

  const isAdminPage = location.pathname.startsWith('/admin')
  const isSellerPage = location.pathname.startsWith('/seller')
  const isAuthPage = ['/login', '/register', '/admin-login', '/forgot'].includes(location.pathname)

  if (isAdminPage || isSellerPage || isAuthPage) {
    return (
      <CompareProvider>
        <ScrollToTop />
        <div className="min-h-screen bg-slate-900">
          <AppRoutes />
          <ToastContainer position="top-center" autoClose={1500} hideProgressBar newestOnTop closeOnClick rtl={false} pauseOnFocusLoss={false} draggable pauseOnHover={false} theme="dark" />
        </div>
      </CompareProvider>
    )
  }

  return (
    <ThemeProvider>
      <CompareProvider>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950 text-white transition-colors duration-300">
          <Navbar />
          <main className="flex-1">
            <AppRoutes />
          </main>
          <Footer />
          <ToastContainer position="top-center" autoClose={1500} hideProgressBar newestOnTop closeOnClick rtl={false} pauseOnFocusLoss={false} draggable pauseOnHover={false} theme="dark" />
        </div>
      </CompareProvider>
    </ThemeProvider>
  )
}
