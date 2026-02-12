import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import cartReducer from './slices/cartSlice'
import productReducer from './slices/productSlice'

function loadState(){
  try{
    const s = localStorage.getItem('gamingstore_state')
    if(!s) return undefined
    return JSON.parse(s)
  }catch(e){ return undefined }
}

function saveState(state){
  try{
    const toSave = { auth: { user: state.auth.user }, cart: { items: state.cart.items } }
    localStorage.setItem('gamingstore_state', JSON.stringify(toSave))
  }catch(e){ }
}

const preloaded = loadState()

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    product: productReducer
  },
  preloadedState: preloaded
})

store.subscribe(() => {
  saveState(store.getState())
})

export default store
