import { createSlice } from '@reduxjs/toolkit'

// Get current user ID from localStorage
function getCurrentUserId() {
  try {
    const userStr = localStorage.getItem('gamingstore_user')
    if (userStr) {
      const user = JSON.parse(userStr)
      return user.id || user.email || 'guest'
    }
    return 'guest'
  } catch {
    return 'guest'
  }
}

// Load cart from localStorage for current user
function loadCart() {
  try {
    const userId = getCurrentUserId()
    const data = localStorage.getItem(`cart_${userId}`)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// Save cart to localStorage for current user
function saveCart(items) {
  try {
    const userId = getCurrentUserId()
    localStorage.setItem(`cart_${userId}`, JSON.stringify(items))
  } catch {}
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: loadCart(), userId: getCurrentUserId() },
  reducers: {
    addItem: (state, action) => {
      const existing = state.items.find(i => i.id === action.payload.id)
      if (existing) {
        existing.qty = (existing.qty || 1) + (action.payload.qty || 1)
      } else {
        state.items.push({ ...action.payload, qty: action.payload.qty || 1 })
      }
      saveCart(state.items)
    },
    removeItem: (state, action) => {
      state.items = state.items.filter(i => i.id !== action.payload)
      saveCart(state.items)
    },
    updateItemQty: (state, action) => {
      const { id, qty } = action.payload
      const item = state.items.find(i => i.id === id)
      if (item && qty > 0) {
        item.qty = qty
        saveCart(state.items)
      }
    },
    clearCart: (state) => {
      state.items = []
      saveCart(state.items)
    },
    // Load cart for logged in user
    loadUserCart: (state) => {
      const userId = getCurrentUserId()
      state.userId = userId
      try {
        const data = localStorage.getItem(`cart_${userId}`)
        state.items = data ? JSON.parse(data) : []
      } catch {
        state.items = []
      }
    },
    // Merge guest cart with user cart on login
    mergeGuestCart: (state) => {
      const userId = getCurrentUserId()
      if (userId === 'guest') return
      
      try {
        // Get guest cart items
        const guestData = localStorage.getItem('cart_guest')
        const guestItems = guestData ? JSON.parse(guestData) : []
        
        // Get user's existing cart
        const userData = localStorage.getItem(`cart_${userId}`)
        const userItems = userData ? JSON.parse(userData) : []
        
        // Merge: add guest items to user cart
        guestItems.forEach(guestItem => {
          const existing = userItems.find(i => i.id === guestItem.id)
          if (existing) {
            existing.qty = (existing.qty || 1) + (guestItem.qty || 1)
          } else {
            userItems.push(guestItem)
          }
        })
        
        state.items = userItems
        state.userId = userId
        saveCart(userItems)
        
        // Clear guest cart after merge
        localStorage.removeItem('cart_guest')
      } catch {
        // On error, just load user cart
        state.items = loadCart()
      }
    }
  }
})

export const { addItem, removeItem, updateItemQty, clearCart, loadUserCart, mergeGuestCart } = cartSlice.actions
export default cartSlice.reducer
