import React, { useState } from 'react'

export default function FilterSection({ onFilter, categories }) {
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [search, setSearch] = useState('')

  function handleFilter() {
    onFilter({ category, minPrice, maxPrice, search })
  }

  return (
    <div className="bg-white p-4 rounded shadow mb-6 flex flex-wrap gap-4 items-end">
      <div>
        <label className="block text-xs mb-1">Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)} className="border rounded px-2 py-1">
          <option value="">All</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs mb-1">Min Price</label>
        <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="border rounded px-2 py-1 w-24" />
      </div>
      <div>
        <label className="block text-xs mb-1">Max Price</label>
        <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="border rounded px-2 py-1 w-24" />
      </div>
      <div>
        <label className="block text-xs mb-1">Search</label>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="border rounded px-2 py-1" placeholder="Search products..." />
      </div>
      <button onClick={handleFilter} className="bg-accent text-white px-4 py-2 rounded">Filter</button>
    </div>
  )
}
