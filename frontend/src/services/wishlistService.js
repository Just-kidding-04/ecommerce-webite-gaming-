import axiosInstance from './axiosInstance'

// Get user's wishlist
export async function getWishlist() {
  try {
    const res = await axiosInstance.get('/api/wishlist')
    return res.data
  } catch (e) {
    console.error('Failed to fetch wishlist:', e)
    return []
  }
}

// Add product to wishlist
export async function addToWishlist(productId) {
  try {
    const res = await axiosInstance.post('/api/wishlist', { productId })
    return { success: true, data: res.data }
  } catch (e) {
    return { success: false, error: e.response?.data?.error || 'Failed to add to wishlist' }
  }
}

// Remove product from wishlist
export async function removeFromWishlist(productId) {
  try {
    await axiosInstance.delete(`/api/wishlist/${productId}`)
    return { success: true }
  } catch (e) {
    return { success: false, error: e.response?.data?.error || 'Failed to remove from wishlist' }
  }
}

// Check if product is in wishlist
export async function checkWishlist(productId) {
  try {
    const res = await axiosInstance.get(`/api/wishlist/check/${productId}`)
    return res.data.inWishlist
  } catch (e) {
    return false
  }
}

// Toggle wishlist item
export async function toggleWishlist(productId) {
  const isInWishlist = await checkWishlist(productId)
  if (isInWishlist) {
    return await removeFromWishlist(productId)
  } else {
    return await addToWishlist(productId)
  }
}
