import axiosInstance from './axiosInstance'

// Check if user is logged in
function isLoggedIn() {
  return !!localStorage.getItem('gamingstore_token')
}

// Get cart from backend (for logged-in users)
export async function getCart() {
  if (!isLoggedIn()) return []
  
  try {
    const res = await axiosInstance.get('/api/cart')
    // Transform backend cart items to match frontend format
    return res.data.map(item => ({
      cartItemId: item.id,
      id: item.productId,
      name: item.Product?.name || 'Unknown Product',
      price: item.Product?.price || 0,
      image: item.Product?.image || '',
      qty: item.qty,
      stock: item.Product?.stock || 10
    }))
  } catch (e) {
    console.error('Failed to fetch cart:', e)
    return []
  }
}

// Add item to cart (backend)
export async function addToCart(productId, qty = 1) {
  if (!isLoggedIn()) {
    return { success: false, error: 'Please login to add items to cart' }
  }
  
  try {
    const res = await axiosInstance.post('/api/cart', { productId, qty })
    return { success: true, data: res.data }
  } catch (e) {
    console.error('Failed to add to cart:', e)
    return { success: false, error: e.response?.data?.error || 'Failed to add to cart' }
  }
}

// Update cart item quantity (backend)
export async function updateCartItem(cartItemId, qty) {
  if (!isLoggedIn()) {
    return { success: false, error: 'Please login' }
  }
  
  try {
    const res = await axiosInstance.put(`/api/cart/${cartItemId}`, { qty })
    return { success: true, data: res.data }
  } catch (e) {
    console.error('Failed to update cart item:', e)
    return { success: false, error: e.response?.data?.error || 'Failed to update' }
  }
}

// Remove item from cart (backend)
export async function removeCartItem(cartItemId) {
  if (!isLoggedIn()) {
    return { success: false, error: 'Please login' }
  }
  
  try {
    await axiosInstance.delete(`/api/cart/${cartItemId}`)
    return { success: true }
  } catch (e) {
    console.error('Failed to remove cart item:', e)
    return { success: false, error: e.response?.data?.error || 'Failed to remove' }
  }
}

// Clear all cart items (backend)
export async function clearCart() {
  if (!isLoggedIn()) {
    return { success: false, error: 'Please login' }
  }
  
  try {
    await axiosInstance.delete('/api/cart/clear')
    return { success: true }
  } catch (e) {
    console.error('Failed to clear cart:', e)
    return { success: false, error: e.response?.data?.error || 'Failed to clear cart' }
  }
}

// Sync local cart to backend (call after login)
export async function syncLocalCartToBackend(localItems) {
  if (!isLoggedIn() || !localItems?.length) return { success: true }
  
  try {
    for (const item of localItems) {
      await addToCart(item.id, item.qty || 1)
    }
    return { success: true }
  } catch (e) {
    console.error('Failed to sync cart:', e)
    return { success: false, error: 'Failed to sync cart' }
  }
}

// Get cart count
export async function getCartCount() {
  const cart = await getCart()
  return cart.reduce((sum, item) => sum + (item.qty || 1), 0)
}
