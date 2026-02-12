import React from 'react'

export default function SpecsTable({specs}){
  return (
    <table className="w-full text-sm">
      <tbody>
        {Object.entries(specs || {}).map(([k,v]) => (
          <tr key={k} className="border-t">
            <td className="py-2 text-slate-600 font-medium">{k}</td>
            <td className="py-2">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
