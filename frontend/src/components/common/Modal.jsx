import React from 'react'
import { FaTimes } from 'react-icons/fa'

export default function Modal({ children, open, isOpen, onClose }) {
  // Support both 'open' and 'isOpen' props for flexibility
  const isVisible = open || isOpen
  
  if (!isVisible) return null
  
  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 border border-gray-700 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
