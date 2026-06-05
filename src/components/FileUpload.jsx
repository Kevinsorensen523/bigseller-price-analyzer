import { useRef, useState } from 'react'
import { parseFile } from '../utils/parser'

export default function FileUpload({ dispatch }) {
  const inputRef = useRef()
  const [dragging, setDragging] = useState(false)

  async function handleFile(file) {
    if (!file) return
    dispatch({ type: 'SET_LOADING', value: true })
    try {
      const rows = await parseFile(file)
      if (rows.length === 0) throw new Error('File tidak berisi data yang valid')
      dispatch({ type: 'SET_DATA', rows, fileName: file.name })
    } catch (e) {
      dispatch({ type: 'SET_ERROR', error: e.message })
    }
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
        ${dragging
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
          : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-900'
        }`}
      onClick={() => inputRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <div className="flex flex-col items-center gap-3">
        <svg className="w-14 h-14 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Upload File BigSeller
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Drag & drop atau klik untuk pilih file <span className="font-medium text-blue-500">.xlsx</span> / <span className="font-medium text-blue-500">.csv</span>
          </p>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-600">
          Kolom: MarketPlace, Toko, Nama Produk, Nama Variasi, SKU, SKU Gudang, Jumlah, Harga Satuan, Subtotal
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  )
}
