import React, { useState } from 'react'
import { toast } from '../../utils/toast'
import { addReview } from '../../services/productService'

export default function ReviewForm({ productId, onReviewAdded }) {
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!rating || !text.trim()) {
      toast.error('Please provide a rating and review text.')
      return
    }
    setLoading(true)
    try {
      const review = await addReview(productId, { rating, text })
      if (review) {
        toast.success('Review submitted!')
        onReviewAdded(review)
        setRating(0)
        setText('')
      } else {
        toast.error('Failed to submit review.')
      }
    } catch (err) {
      toast.error('Error submitting review.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-8 bg-slate-800/40 p-6 rounded-2xl border border-white/10 shadow-lg">
      <div className="mb-4 flex items-center justify-center gap-2">
        {[1,2,3,4,5].map(i => (
          <button
            key={i}
            type="button"
            className={`text-2xl ${i <= rating ? 'text-yellow-400' : 'text-slate-500'}`}
            onClick={() => setRating(i)}
            disabled={loading}
          >★</button>
        ))}
      </div>
      <textarea
        className="w-full p-3 rounded-lg bg-black/20 text-white border border-white/10 mb-4"
        rows={4}
        placeholder="Write your review..."
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={loading}
      />
      <button
        type="submit"
        className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}
