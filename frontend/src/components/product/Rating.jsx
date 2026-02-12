import React from 'react'

export default function Rating({value=0, outOf=5}){
  const full = Math.round(value)
  return (
    <div className="flex items-center space-x-1 text-yellow-400">
      {Array.from({length: outOf}).map((_,i) => (
        <svg key={i} className={`w-4 h-4 ${i<full? 'fill-current':'text-slate-200'}`} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.561-.955L10 0l2.949 5.955 6.561.955-4.755 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  )
}
