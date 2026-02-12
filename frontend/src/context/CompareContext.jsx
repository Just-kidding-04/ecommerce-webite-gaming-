import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from '../utils/toast'

const CompareContext = createContext()

const STORAGE_KEY = 'gamingstore_compare'
const MAX_ITEMS = 4

export function CompareProvider({ children }) {
  const [compareItems, setCompareItems] = useState([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setCompareItems(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Failed to load compare items:', e)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareItems))
    } catch (e) {
      console.error('Failed to save compare items:', e)
    }
  }, [compareItems])

  const addToCompare = (product) => {
    if (compareItems.find(p => p.id === product.id)) {
      toast.info('Product already in comparison')
      return false
    }
    
    if (compareItems.length >= MAX_ITEMS) {
      toast.error(`Maximum ${MAX_ITEMS} products can be compared`)
      return false
    }
    
    setCompareItems(prev => [...prev, {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      brand: product.brand,
      rating: product.rating,
      category: product.category,
      categoryId: product.categoryId,
      specs: product.specs || product.specsData || {},
      features: product.features || [],
      stock: product.stock
    }])
    toast.success('Added to comparison')
    return true
  }

  const removeFromCompare = (productId) => {
    setCompareItems(prev => prev.filter(p => p.id !== productId))
    toast.success('Removed from comparison')
  }

  const clearCompare = () => {
    setCompareItems([])
  }

  const isInCompare = (productId) => {
    return compareItems.some(p => p.id === productId)
  }

  return (
    <CompareContext.Provider value={{
      compareItems,
      addToCompare,
      removeFromCompare,
      clearCompare,
      isInCompare,
      compareCount: compareItems.length
    }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const context = useContext(CompareContext)
  if (!context) {
    throw new Error('useCompare must be used within CompareProvider')
  }
  return context
}
