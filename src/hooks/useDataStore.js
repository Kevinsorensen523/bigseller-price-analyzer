import { useReducer, useMemo, useEffect, useRef } from 'react'
import { groupData, computeSummary } from '../utils/grouping'

const ALL_COLUMNS = [
  { key: 'waktuPesanan', label: 'Waktu Pesanan' },
  { key: 'noPesanan', label: 'No. Pesanan' },
  { key: 'status', label: 'Status' },
  { key: 'marketplace', label: 'Marketplace' },
  { key: 'toko', label: 'Toko' },
  { key: 'produk', label: 'Nama Produk' },
  { key: 'variasi', label: 'Variasi' },
  { key: 'sku', label: 'SKU' },
  { key: 'skuGudang', label: 'SKU Gudang' },
  { key: 'qty', label: 'Qty' },
  { key: 'harga', label: 'Harga Satuan' },
  { key: 'subtotal', label: 'Subtotal' },
]

const DEFAULT_VISIBLE = ['marketplace', 'toko', 'produk', 'variasi', 'skuGudang', 'qty', 'harga', 'subtotal']

const STORAGE_KEY = 'bigseller-state-v2'

const blankFilters = { marketplace: '', produk: '', sku: '', status: [], dateFrom: '', dateTo: '' }

const initialState = {
  rows: [],
  fileName: null,
  loading: false,
  error: null,
  visibleCols: DEFAULT_VISIBLE,
  groupKey: 'skuGudang',
  sortConfig: { key: null, dir: 'asc' },
  filters: blankFilters,
  search: '',
  expandedGroups: new Set(),
  colOrder: ALL_COLUMNS.map(c => c.key),
  groupSortConfig: { key: null, dir: 'asc' },
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw)
    // rows contain Date objects that JSON serializes to strings — restore them
    const rows = (saved.rows || []).map(r => ({
      ...r,
      waktuPesananDate: r.waktuPesananDate ? new Date(r.waktuPesananDate) : null,
    }))
    return {
      ...initialState,
      rows,
      fileName: saved.fileName || null,
      visibleCols: saved.visibleCols || DEFAULT_VISIBLE,
      groupKey: saved.groupKey || 'skuGudang',
      colOrder: saved.colOrder || ALL_COLUMNS.map(c => c.key),
      filters: { ...blankFilters, ...(saved.filters || {}), status: saved.filters?.status || [] },
      search: saved.search || '',
      sortConfig: saved.sortConfig || { key: null, dir: 'asc' },
      groupSortConfig: saved.groupSortConfig || { key: null, dir: 'asc' },
    }
  } catch {
    return null
  }
}

function saveToStorage(state) {
  try {
    const payload = {
      rows: state.rows,
      fileName: state.fileName,
      visibleCols: state.visibleCols,
      groupKey: state.groupKey,
      colOrder: state.colOrder,
      filters: state.filters,
      search: state.search,
      sortConfig: state.sortConfig,
      groupSortConfig: state.groupSortConfig,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch (e) {
    // Quota exceeded — save everything except rows
    try {
      const payload = {
        rows: [],
        fileName: null,
        visibleCols: state.visibleCols,
        groupKey: state.groupKey,
        colOrder: state.colOrder,
        filters: state.filters,
        search: state.search,
        sortConfig: state.sortConfig,
        groupSortConfig: state.groupSortConfig,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch { /* ignore */ }
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, loading: action.value, error: null }
    case 'SET_DATA': return {
      ...state,
      rows: action.rows,
      fileName: action.fileName,
      loading: false,
      error: null,
      expandedGroups: new Set(),
    }
    case 'SET_ERROR': return { ...state, loading: false, error: action.error }
    case 'RESET': {
      try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
      return { ...initialState }
    }
    case 'CLEAR_DATA': {
      const next = { ...state, rows: [], fileName: null, expandedGroups: new Set() }
      return next
    }
    case 'TOGGLE_COL': {
      const vis = state.visibleCols.includes(action.key)
        ? state.visibleCols.filter(k => k !== action.key)
        : [...state.visibleCols, action.key]
      return { ...state, visibleCols: vis }
    }
    case 'SET_GROUP_KEY': return { ...state, groupKey: action.key, expandedGroups: new Set() }
    case 'SET_SORT': {
      const dir = state.sortConfig.key === action.key && state.sortConfig.dir === 'asc' ? 'desc' : 'asc'
      return { ...state, sortConfig: { key: action.key, dir } }
    }
    case 'SET_FILTER': return { ...state, filters: { ...state.filters, [action.field]: action.value } }
    case 'TOGGLE_STATUS_FILTER': {
      const cur = state.filters.status
      const next = cur.includes(action.value)
        ? cur.filter(s => s !== action.value)
        : [...cur, action.value]
      return { ...state, filters: { ...state.filters, status: next } }
    }
    case 'SET_SEARCH': return { ...state, search: action.value }
    case 'TOGGLE_GROUP': {
      const next = new Set(state.expandedGroups)
      next.has(action.key) ? next.delete(action.key) : next.add(action.key)
      return { ...state, expandedGroups: next }
    }
    case 'EXPAND_ALL': return { ...state, expandedGroups: new Set(action.keys) }
    case 'COLLAPSE_ALL': return { ...state, expandedGroups: new Set() }
    case 'REORDER_COLS': return { ...state, colOrder: action.order }
    case 'SET_GROUP_SORT': {
      const dir = state.groupSortConfig.key === action.key && state.groupSortConfig.dir === 'asc' ? 'desc' : 'asc'
      return { ...state, groupSortConfig: { key: action.key, dir } }
    }
    default: return state
  }
}

export function useDataStore() {
  const [state, dispatch] = useReducer(reducer, null, () => loadFromStorage() ?? initialState)

  // Debounced localStorage save — avoid writing on every keystroke
  const saveTimer = useRef(null)
  useEffect(() => {
    if (state.loading) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveToStorage(state), 500)
    return () => clearTimeout(saveTimer.current)
  }, [state])

  const filteredRows = useMemo(() => {
    let rows = state.rows
    const { marketplace, produk, sku, status, dateFrom, dateTo } = state.filters
    const search = state.search.toLowerCase()
    if (marketplace) rows = rows.filter(r => r.marketplace?.toLowerCase().includes(marketplace.toLowerCase()))
    if (produk) rows = rows.filter(r => r.produk?.toLowerCase().includes(produk.toLowerCase()))
    if (sku) rows = rows.filter(r => r.sku?.toLowerCase().includes(sku.toLowerCase()) || r.skuGudang?.toLowerCase().includes(sku.toLowerCase()))
    if (status.length) rows = rows.filter(r => status.includes(r.status))
    if (dateFrom) {
      const from = new Date(dateFrom) // datetime-local: "2024-01-15T10:30" sudah include jam
      rows = rows.filter(r => r.waktuPesananDate && r.waktuPesananDate >= from)
    }
    if (dateTo) {
      const to = new Date(dateTo)
      rows = rows.filter(r => r.waktuPesananDate && r.waktuPesananDate <= to)
    }
    if (search) rows = rows.filter(r =>
      Object.values(r).some(v => v && typeof v !== 'object' && String(v).toLowerCase().includes(search))
    )
    return rows
  }, [state.rows, state.filters, state.search])

  const groups = useMemo(() => {
    let gs = groupData(filteredRows, state.groupKey)
    if (state.groupSortConfig.key) {
      gs = gs.sort((a, b) => {
        const va = a[state.groupSortConfig.key]
        const vb = b[state.groupSortConfig.key]
        const res = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb))
        return state.groupSortConfig.dir === 'asc' ? res : -res
      })
    } else if (state.sortConfig.key) {
      gs = gs.sort((a, b) => {
        const va = a.items[0]?.[state.sortConfig.key] ?? a.key
        const vb = b.items[0]?.[state.sortConfig.key] ?? b.key
        const res = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb))
        return state.sortConfig.dir === 'asc' ? res : -res
      })
    }
    return gs
  }, [filteredRows, state.groupKey, state.sortConfig, state.groupSortConfig])

  const summary = useMemo(() => computeSummary(filteredRows), [filteredRows])

  const orderedVisibleCols = useMemo(() => {
    return state.colOrder
      .filter(k => state.visibleCols.includes(k))
      .map(k => ALL_COLUMNS.find(c => c.key === k))
      .filter(Boolean)
  }, [state.colOrder, state.visibleCols])

  const uniqueMarketplaces = useMemo(() =>
    [...new Set(state.rows.map(r => r.marketplace).filter(Boolean))], [state.rows])

  const uniqueStatuses = useMemo(() =>
    [...new Set(state.rows.map(r => r.status).filter(Boolean))].sort(), [state.rows])

  return {
    state,
    dispatch,
    filteredRows,
    groups,
    summary,
    orderedVisibleCols,
    allColumns: ALL_COLUMNS,
    uniqueMarketplaces,
    uniqueStatuses,
  }
}
