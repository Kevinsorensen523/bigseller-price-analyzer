import { useState, useRef, useEffect } from 'react'

const inputCls = 'w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const labelCls = 'text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block'

function StatusMultiSelect({ selected, options, dispatch }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const label = selected.length === 0
    ? 'Semua Status'
    : selected.length === 1
      ? selected[0]
      : `${selected.length} status dipilih`

  return (
    <div ref={ref} className="relative min-w-[170px]">
      <label className={labelCls}>Status Pesanan</label>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full py-2 px-3 rounded-lg border text-sm text-left flex items-center justify-between gap-2 transition-colors
          ${open
            ? 'border-blue-500 ring-2 ring-blue-500 bg-white dark:bg-gray-900'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600'
          }
          ${selected.length ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
      >
        <span className="truncate">{label}</span>
        <svg className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full mt-1 z-30 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl min-w-full max-w-[260px] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-800">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Filter Status
            </span>
            {selected.length > 0 && (
              <button
                onClick={() => dispatch({ type: 'SET_FILTER', field: 'status', value: [] })}
                className="text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400"
              >
                Hapus semua
              </button>
            )}
          </div>

          {/* Options */}
          <div className="max-h-56 overflow-y-auto py-1">
            {options.map(opt => {
              const checked = selected.includes(opt)
              return (
                <label
                  key={opt}
                  className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => dispatch({ type: 'TOGGLE_STATUS_FILTER', value: opt })}
                    className="w-4 h-4 accent-blue-500 rounded"
                  />
                  <span className={`text-sm truncate ${checked ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                    {opt}
                  </span>
                </label>
              )
            })}
            {options.length === 0 && (
              <p className="px-3 py-3 text-xs text-gray-400 dark:text-gray-600">Tidak ada data status</p>
            )}
          </div>

          {/* Footer count */}
          {selected.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
              {selected.length} dari {options.length} dipilih
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function FilterBar({ state, dispatch, uniqueMarketplaces, uniqueStatuses, allColumns }) {
  const groupOptions = allColumns.map(c => ({ key: c.key, label: c.label }))

  const activeFilterCount = [
    state.filters.marketplace,
    state.filters.produk,
    state.filters.sku,
    state.filters.dateFrom,
    state.filters.dateTo,
    state.search,
  ].filter(Boolean).length + state.filters.status.length

  function clearAll() {
    dispatch({ type: 'SET_SEARCH', value: '' })
    dispatch({ type: 'SET_FILTER', field: 'marketplace', value: '' })
    dispatch({ type: 'SET_FILTER', field: 'produk', value: '' })
    dispatch({ type: 'SET_FILTER', field: 'sku', value: '' })
    dispatch({ type: 'SET_FILTER', field: 'status', value: [] })
    dispatch({ type: 'SET_FILTER', field: 'dateFrom', value: '' })
    dispatch({ type: 'SET_FILTER', field: 'dateTo', value: '' })
  }

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Search */}
      <div className="flex-1 min-w-[180px]">
        <label className={labelCls}>Cari</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Cari semua kolom..."
            value={state.search}
            onChange={e => dispatch({ type: 'SET_SEARCH', value: e.target.value })}
          />
        </div>
      </div>

      {/* Filter Marketplace */}
      <div className="min-w-[150px]">
        <label className={labelCls}>Marketplace</label>
        <select className={inputCls} value={state.filters.marketplace}
          onChange={e => dispatch({ type: 'SET_FILTER', field: 'marketplace', value: e.target.value })}>
          <option value="">Semua</option>
          {uniqueMarketplaces.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Status multi-select — selalu tampil kalau ada data */}
      {uniqueStatuses.length > 0 && (
        <StatusMultiSelect
          selected={state.filters.status}
          options={uniqueStatuses}
          dispatch={dispatch}
        />
      )}

      {/* Filter Produk */}
      <div className="min-w-[150px]">
        <label className={labelCls}>Produk</label>
        <input className={inputCls} placeholder="Filter produk..."
          value={state.filters.produk}
          onChange={e => dispatch({ type: 'SET_FILTER', field: 'produk', value: e.target.value })} />
      </div>

      {/* Filter SKU */}
      <div className="min-w-[130px]">
        <label className={labelCls}>SKU</label>
        <input className={inputCls} placeholder="Filter SKU..."
          value={state.filters.sku}
          onChange={e => dispatch({ type: 'SET_FILTER', field: 'sku', value: e.target.value })} />
      </div>

      {/* Date From */}
      <div className="min-w-[190px]">
        <label className={labelCls}>Dari Tanggal & Jam</label>
        <input type="datetime-local" className={inputCls} value={state.filters.dateFrom}
          onChange={e => dispatch({ type: 'SET_FILTER', field: 'dateFrom', value: e.target.value })} />
      </div>

      {/* Date To */}
      <div className="min-w-[190px]">
        <label className={labelCls}>Sampai Tanggal & Jam</label>
        <input type="datetime-local" className={inputCls} value={state.filters.dateTo}
          onChange={e => dispatch({ type: 'SET_FILTER', field: 'dateTo', value: e.target.value })} />
      </div>

      {/* Group By */}
      <div className="min-w-[140px]">
        <label className={labelCls}>Group By</label>
        <select className={inputCls} value={state.groupKey}
          onChange={e => dispatch({ type: 'SET_GROUP_KEY', key: e.target.value })}>
          {groupOptions.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
      </div>

      {/* Reset filter */}
      {activeFilterCount > 0 && (
        <div className="flex items-end">
          <button onClick={clearAll}
            className="flex items-center gap-1.5 py-2 px-3 rounded-lg text-sm text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 transition-colors whitespace-nowrap">
            ✕ Reset filter ({activeFilterCount})
          </button>
        </div>
      )}
    </div>
  )
}
