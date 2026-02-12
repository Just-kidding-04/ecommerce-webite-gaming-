import axiosInstance from './axiosInstance'

const SAMPLE_PRODUCTS = []

// Add review to product
export async function addReview(productId, review) {
  try {
    const token = localStorage.getItem('gamingstore_token')
    const res = await axiosInstance.post(`/api/products/${productId}/reviews`, review, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return res.data
  } catch (e) {
    console.error('Failed to add review:', e)
    return null
  }
}

export async function fetchAll(params = {}) {
  try {
    const queryParams = new URLSearchParams()
    if (params.q) queryParams.append('q', params.q)
    if (params.category) queryParams.append('category', params.category)
    if (params.page) queryParams.append('page', params.page)
    if (params.limit) queryParams.append('limit', params.limit)
    
    const res = await axiosInstance.get(`/api/products?${queryParams.toString()}`)
    return res.data
  } catch (e) {
    console.error('Failed to fetch products:', e)
    return SAMPLE_PRODUCTS
  }
}

export async function fetchById(id) {
  try {
    const res = await axiosInstance.get('/api/products/' + id)
    return res.data
  } catch (e) {
    console.error('Failed to fetch product:', e)
    return null
  }
}

export async function fetchByCategory(categoryId) {
  try {
    const res = await axiosInstance.get(`/api/products?category=${categoryId}`)
    return res.data
  } catch (e) {
    console.error('Failed to fetch products by category:', e)
    return []
  }
}

export async function fetchCategories() {
  try {
    const res = await axiosInstance.get('/api/products/categories')
    return res.data
  } catch (e) {
    console.error('Failed to fetch categories:', e)
    return []
  }
}

export async function searchProducts(query) {
  try {
    const res = await axiosInstance.get(`/api/products?q=${encodeURIComponent(query)}`)
    return res.data
  } catch (e) {
    console.error('Failed to search products:', e)
    return []
  }
}

export async function fetchFeatured() {
  try {
    const res = await axiosInstance.get('/api/products?limit=8')
    return res.data
  } catch (e) {
    return SAMPLE_PRODUCTS.slice(0, 8)
  }
}

export async function fetchDeals() {
  try {
    const res = await axiosInstance.get('/api/products?limit=6')
    // Return products with originalPrice (on sale)
    return res.data.filter(p => p.originalPrice && p.originalPrice > p.price)
  } catch (e) {
    return []
  }
}

export function getAll() { return SAMPLE_PRODUCTS }
export function getFeatured() { return SAMPLE_PRODUCTS.slice(0, 3) }
export function getById(id) { return SAMPLE_PRODUCTS.find(p => p.id === id) }
