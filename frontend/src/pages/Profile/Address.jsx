import React, { useState } from 'react'
import AddressForm from '../../components/common/AddressForm'
import { toast } from '../../utils/toast'

function loadAddress() {
  try {
    const data = localStorage.getItem('address')
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

function saveAddress(address) {
  try {
    localStorage.setItem('address', JSON.stringify(address))
  } catch {}
}

export default function Address() {
  const [address, setAddress] = useState(loadAddress())
  const [editing, setEditing] = useState(!loadAddress())

  function handleSave(addr) {
    setAddress(addr)
    saveAddress(addr)
    setEditing(false)
    toast.success('Address saved!')
  }

  return (
    <div className="bg-white p-6 rounded shadow max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">My Address</h2>
      {editing ? (
        <AddressForm onSave={handleSave} initial={address || {}} />
      ) : address ? (
        <div>
          <div>{address.line1}</div>
          {address.line2 && <div>{address.line2}</div>}
          <div>{address.city}, {address.state} {address.zip}</div>
          <div>{address.country}</div>
          <button className="text-accent underline mt-4" onClick={() => setEditing(true)}>Edit Address</button>
        </div>
      ) : (
        <button className="bg-accent text-white px-4 py-2 rounded" onClick={() => setEditing(true)}>Add Address</button>
      )}
    </div>
  )
}
