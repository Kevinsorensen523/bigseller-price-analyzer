import Papa from 'papaparse'
import * as XLSX from 'xlsx'

const COLUMN_MAP = {
  'marketplace': 'marketplace',
  'toko marketplace': 'toko',
  'nama toko': 'toko',
  'toko': 'toko',
  'no. pesanan': 'noPesanan',
  'no pesanan': 'noPesanan',
  'nomor pesanan': 'noPesanan',
  'order id': 'noPesanan',
  'nama produk': 'produk',
  'nama variasi': 'variasi',
  'variasi': 'variasi',
  'sku': 'sku',
  'sku gudang': 'skuGudang',
  'jumlah': 'qty',
  'harga satuan': 'harga',
  'subtotal': 'subtotal',
  'subtotal produk': 'subtotal',
  'status pesanan': 'status',
  'status': 'status',
  'status order': 'status',
  'waktu pesanan dibuat': 'waktuPesanan',
  'tanggal pesanan': 'waktuPesanan',
  'tanggal order': 'waktuPesanan',
  'order time': 'waktuPesanan',
  'waktu pembayaran': 'waktuPesanan',
  'create time': 'waktuPesanan',
}

const NUMERIC_KEYS = new Set(['qty', 'harga', 'subtotal'])

// Parse tanggal dari berbagai format BigSeller ke objek Date (atau null)
function parseDate(val) {
  if (!val) return null
  // XLSX serial number
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val)
    if (d) return new Date(d.y, d.m - 1, d.d)
    return null
  }
  const s = String(val).trim()
  if (!s || s === '--' || s === '-') return null
  // Try native parse (handles "2024-01-15 10:30:00", ISO, dll)
  const d = new Date(s)
  if (!isNaN(d.getTime())) return d
  // DD/MM/YYYY atau DD-MM-YYYY
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/)
  if (m) return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]))
  return null
}

function toNumber(val) {
  if (typeof val === 'number') return Math.round(val)
  if (typeof val === 'string') {
    const s = val.replace(/[^0-9.,-]/g, '')
    if (!s) return 0

    const dotCount = (s.match(/\./g) || []).length
    const commaCount = (s.match(/,/g) || []).length
    let n

    if (dotCount > 1) {
      // "58.000.000" — dots are thousands separators
      n = parseFloat(s.replace(/\./g, '').replace(',', '.'))
    } else if (commaCount > 1) {
      // "58,000,000" — commas are thousands separators
      n = parseFloat(s.replace(/,/g, ''))
    } else if (dotCount === 1 && commaCount === 1) {
      // both present — whichever is last is decimal: "58.000,00" or "58,000.00"
      const lastDot = s.lastIndexOf('.')
      const lastComma = s.lastIndexOf(',')
      if (lastComma > lastDot) {
        n = parseFloat(s.replace(/\./g, '').replace(',', '.'))
      } else {
        n = parseFloat(s.replace(/,/g, ''))
      }
    } else if (dotCount === 1) {
      // single dot — check if it's a thousands separator: "58.000" (3 digits after dot)
      const afterDot = s.split('.')[1]
      if (afterDot && afterDot.length === 3) {
        n = parseFloat(s.replace('.', ''))
      } else {
        // decimal: "58000.00"
        n = parseFloat(s)
      }
    } else {
      // commas only or plain integer
      n = parseFloat(s.replace(/,/g, ''))
    }

    return isNaN(n) ? 0 : Math.round(n)
  }
  return 0
}

function normalizeRow(raw) {
  const row = {}
  for (const [key, val] of Object.entries(raw)) {
    const normalized = key.trim().toLowerCase().replace(/\s+/g, ' ')
    const mapped = COLUMN_MAP[normalized]
    if (mapped) {
      const strVal = String(val ?? '').trim()
      if (NUMERIC_KEYS.has(mapped)) {
        // "--" means Pesanan Kilat — harga bukan 0, tapi memang tidak ada
        if (mapped === 'harga' && (strVal === '--' || strVal === '-' || strVal === '')) {
          row.isPesananKilat = true
          row[mapped] = 0
        } else {
          row[mapped] = toNumber(val)
        }
      } else if (mapped === 'waktuPesanan') {
        const d = parseDate(val)
        row.waktuPesanan = strVal         // raw string untuk display
        row.waktuPesananDate = d          // Date object untuk filter range
      } else {
        row[mapped] = strVal
      }
    }
  }
  if (!row.isPesananKilat) row.isPesananKilat = false
  return row
}

function findHeaderRowIndex(sheet) {
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1')
  const knownHeaders = new Set(Object.keys(COLUMN_MAP))

  for (let r = range.s.r; r <= Math.min(range.s.r + 10, range.e.r); r++) {
    let matchCount = 0
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })]
      if (cell && typeof cell.v === 'string') {
        const normalized = cell.v.trim().toLowerCase().replace(/\s+/g, ' ')
        if (knownHeaders.has(normalized)) matchCount++
      }
    }
    if (matchCount >= 2) return r
  }
  return 0
}

export async function parseFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()

  if (ext === 'csv') {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data.map(normalizeRow).filter(r => r.produk || r.skuGudang))
        },
        error: reject,
      })
    })
  }

  if (ext === 'xlsx' || ext === 'xls') {
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const headerRow = findHeaderRowIndex(ws)
    const raw = XLSX.utils.sheet_to_json(ws, { defval: '', range: headerRow })
    return raw.map(normalizeRow).filter(r => r.produk || r.skuGudang)
  }

  throw new Error('Format file tidak didukung. Gunakan .xlsx, .xls, atau .csv')
}
