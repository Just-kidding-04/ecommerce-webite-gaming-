const STORAGE_KEY = 'gamingstore_saved_for_later'

export function getSavedItems() {
  try {
    const userId = getCurrentUserId()
    const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch (e) {
    return []
  }
}

export function saveForLater(item) {
  try {
    const userId = getCurrentUserId()
    const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY
    let items = getSavedItems()
    
    if (items.find(i => i.id === item.id)) {
      return { success: false, error: 'Already saved for later' }
    }
    
    items.push({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      savedAt: Date.now()
    })
    
    localStorage.setItem(key, JSON.stringify(items))
    return { success: true }
  } catch (e) {
    return { success: false, error: 'Failed to save item' }
  }
}

export function removeSavedItem(itemId) {
  try {
    const userId = getCurrentUserId()
    const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY
    let items = getSavedItems()
    items = items.filter(i => i.id !== itemId)
    localStorage.setItem(key, JSON.stringify(items))
    return { success: true }
  } catch (e) {
    return { success: false, error: 'Failed to remove item' }
  }
}

export function clearSavedItems() {
  const userId = getCurrentUserId()
  const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY
  localStorage.removeItem(key)
}

function getCurrentUserId() {
  try {
    const token = localStorage.getItem('gamingstore_token')
    if (!token) return null
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.id
  } catch (e) {
    return null
  }
}
