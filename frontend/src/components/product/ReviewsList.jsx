import React from 'react'
import { FaStar } from 'react-icons/fa'

export default function ReviewsList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return <div className="text-slate-500 italic mt-6">No reviews yet. Be the first to review!</div>
  }
  return (
    <div className="mt-8 space-y-6">
      {reviews.map((r, idx) => (
        <div key={idx} className="bg-slate-800/30 rounded-xl p-4 border border-white/10 text-left shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex text-yellow-400 text-lg">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < r.rating ? 'text-yellow-400' : 'text-slate-700'} />
              ))}
            </div>
            <span className="text-slate-400 text-xs ml-2">{r.userName || 'Anonymous'}</span>
          </div>
          <div className="text-white text-base">{r.text}</div>
        </div>
      ))}
    </div>
  )
}
