import axiosInstance from './axiosInstance'

export async function login(credentials){
  try {
    const res = await axiosInstance.post('/api/auth/login', credentials)
    const { user, token } = res.data
    localStorage.setItem('gamingstore_token', token)
    localStorage.setItem('gamingstore_user', JSON.stringify(user))
    return user
  } catch(e) {
    console.error('Login failed:', e.response?.data || e.message)
    throw new Error(e.response?.data?.error || e.response?.data?.message || 'Login failed')
  }
}

export async function adminLogin(credentials){
  try {
    const res = await axiosInstance.post('/api/auth/admin/login', credentials)
    const { user, token } = res.data
    localStorage.setItem('gamingstore_token', token)
    localStorage.setItem('gamingstore_user', JSON.stringify(user))
    return user
  } catch(e) {
    console.error('Admin login failed:', e.response?.data || e.message)
    throw new Error(e.response?.data?.error || e.response?.data?.message || 'Admin login failed')
  }
}

export async function sellerLogin(credentials){
  try {
    const res = await axiosInstance.post('/api/auth/seller/login', credentials)
    const { user, token } = res.data
    localStorage.setItem('gamingstore_token', token)
    localStorage.setItem('gamingstore_user', JSON.stringify(user))
    return user
  } catch(e) {
    console.error('Seller login failed:', e.response?.data || e.message)
    throw new Error(e.response?.data?.error || e.response?.data?.message || 'Seller login failed')
  }
}

export async function register(data){
  try {
    const res = await axiosInstance.post('/api/auth/register', data)
    const { user, token } = res.data
    localStorage.setItem('gamingstore_token', token)
    localStorage.setItem('gamingstore_user', JSON.stringify(user))
    return user
  } catch(e) {
    console.error('Register failed:', e.response?.data || e.message)
    throw new Error(e.response?.data?.message || 'Registration failed')
  }
}

export async function getProfile(){
  try { return JSON.parse(localStorage.getItem('gamingstore_user')) }catch(e){ return null }
}

export function logout(){
  // Get user ID before removing
  const user = JSON.parse(localStorage.getItem('gamingstore_user') || '{}')
  
  localStorage.removeItem('gamingstore_token')
  localStorage.removeItem('gamingstore_user')
  
  // Clear user-specific cached address
  if (user.id) {
    localStorage.removeItem(`address_${user.id}`)
  }
  // Also clear any global address keys (legacy cleanup)
  localStorage.removeItem('address')
  localStorage.removeItem('address_guest')
}

export function getToken(){
  return localStorage.getItem('gamingstore_token')
}
