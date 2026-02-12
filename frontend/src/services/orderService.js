import axiosInstance from './axiosInstance'

// Place order
export async function placeOrder(orderData) {
  try {
    const res = await axiosInstance.post('/api/orders', orderData)
    return res.data
  } catch (e) {
    console.error('Failed to place order:', e)
    return { success: false, error: e.response?.data?.error || 'Failed to place order' }
  }
}

// Get user's orders
export async function getOrders() {
  try {
    const res = await axiosInstance.get('/api/orders/my')
    return res.data
  } catch (e) {
    console.error('Failed to fetch orders:', e)
    return []
  }
}

// Get single order by ID
export async function getOrderById(orderId) {
  try {
    const res = await axiosInstance.get(`/api/orders/${orderId}`)
    return res.data
  } catch (e) {
    console.error('Failed to fetch order:', e)
    return null
  }
}

// Cancel order
export async function cancelOrder(orderId) {
  try {
    const res = await axiosInstance.put(`/api/orders/${orderId}/cancel`)
    return res.data
  } catch (e) {
    return { success: false, error: e.response?.data?.error || 'Failed to cancel order' }
  }
}

// Alias for placeOrder
export const createOrder = placeOrder
