const STORAGE_KEY = 'gamingstore_recently_viewed'
const MAX_ITEMS = 10

export function getRecentlyViewed() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    return []
  }
}

export function addToRecentlyViewed(product) {
  if (!product || !product.id) return
  
  try {
    let items = getRecentlyViewed()
    
    items = items.filter(p => p.id !== product.id)
    
    items.unshift({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      brand: product.brand,
      rating: product.rating,
      category: product.category,
      viewedAt: Date.now()
    })
    
    if (items.length > MAX_ITEMS) {
      items = items.slice(0, MAX_ITEMS)
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (e) {
    console.error('Failed to save recently viewed:', e)
  }
}

export function clearRecentlyViewed() {
  localStorage.removeItem(STORAGE_KEY)
}
