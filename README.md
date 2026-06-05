# BigSeller Price Analyzer

Aplikasi React untuk analisis harga & pesanan dari ekspor file BigSeller (.xlsx / .csv).

## Tech Stack

- **React 18** + **Vite 5**
- **Tailwind CSS 3** — dark/light mode
- **Papa Parse** — parsing CSV
- **XLSX (SheetJS)** — parsing Excel
- **jsPDF + jspdf-autotable** — export PDF

## Fitur

### Upload & Parsing
- Drag & drop atau klik untuk upload `.xlsx`, `.xls`, `.csv`
- Auto-detect header row — handle file BigSeller yang punya baris judul di atas header
- Parsing angka cerdas: bedakan `58.000` (ribuan) vs `58000.00` (desimal)
- Deteksi **Pesanan Kilat** — baris dengan harga `--` dikategorikan terpisah

### Kolom yang Dikenali
| Kolom di File | Key Internal |
|---|---|
| MarketPlace | `marketplace` |
| Toko MarketPlace / Nama Toko | `toko` |
| No. Pesanan / Nomor Pesanan | `noPesanan` |
| Status Pesanan / Status | `status` |
| Waktu Pesanan Dibuat / Tanggal Pesanan | `waktuPesanan` |
| Nama Produk | `produk` |
| Nama Variasi | `variasi` |
| SKU | `sku` |
| SKU Gudang | `skuGudang` |
| Jumlah | `qty` |
| Harga Satuan | `harga` |
| Subtotal / Subtotal Produk | `subtotal` |

### Tampilan & Analisis
- **Summary Bar** — Qty Order Real, Qty Pesanan Kilat, Total Subtotal (exclude kilat), Avg Price/Unit
- **Smart Grouping** — auto-group by SKU Gudang (bisa diubah ke kolom lain)
- **Collapsible groups** — expand/collapse per group atau semua sekaligus
- **Sort** — per kolom data (row-level) dan per agregat group (Total Qty, Total Subtotal, Avg Harga)
- **Column Selector** — pilih kolom mana yang ditampilkan via checkbox dropdown
- **Pesanan Kilat badge** — highlight oranye di group row dan expanded rows

### Filter
- Cari teks (semua kolom)
- Filter Marketplace (dropdown)
- Filter Status Pesanan (**multi-select** checkbox dropdown)
- Filter Produk & SKU (text input)
- Filter rentang waktu pesanan (**datetime** — tanggal + jam)
- Tombol "Reset filter" dengan counter aktif

### Detail Modal
- Full-screen modal per group
- Semua kolom (No. Pesanan, Status + badge warna, Waktu Pesanan, Toko, dll)
- Sort per kolom di dalam modal
- Pesanan Kilat highlight oranye, subtotal highlight hijau

### Export
- **Excel** — dengan grouping & summary sheet terpisah
- **PDF** — formatted table per group, landscape

### Persistence
- Data & settings disimpan otomatis ke **localStorage** (debounce 500ms)
- Restore otomatis saat refresh
- **Hapus Data** — clear data saja, settings tetap
- Kalau data terlalu besar (quota exceeded), settings tetap tersimpan

## Struktur Proyek

```
src/
├── App.jsx                  # Root layout, navbar, dark mode
├── index.css                # Tailwind base + scrollbar utilities
├── main.jsx
├── components/
│   ├── ColumnSelector.jsx   # Checkbox dropdown pilih kolom
│   ├── DataTable.jsx        # Tabel utama dengan grouping & sort
│   ├── DetailModal.jsx      # Full-screen modal detail per group
│   ├── ExportMenu.jsx       # Dropdown export Excel/PDF
│   ├── FileUpload.jsx       # Drag & drop upload zone
│   ├── FilterBar.jsx        # Semua filter + status multi-select
│   └── SummaryBar.jsx       # 4-5 metric cards
├── hooks/
│   ├── useDarkMode.js       # Dark mode + localStorage persist
│   └── useDataStore.js      # useReducer state management + localStorage
└── utils/
    ├── exportUtils.js       # Export ke Excel & PDF
    ├── grouping.js          # Group data + compute summary
    └── parser.js            # Parse xlsx/csv, detect header row, handle angka
```

## Menjalankan

```bash
npm install
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173)

```bash
npm run build   # build production ke dist/
```

## Catatan Teknis

- **Auto-detect header** — `findHeaderRowIndex()` scan 10 baris pertama, cari baris dengan ≥2 match kolom yang dikenal. Ini handle file BigSeller yang punya baris judul sebelum header.
- **Parsing angka** — deteksi format IDR (`58.000,00`), US (`58,000.00`), ribuan tanpa desimal (`58.000`), dan desimal polos (`58000.00`).
- **Pesanan Kilat** — harga `--` atau `-` atau kosong → `isPesananKilat: true`. Total Subtotal & Avg Price dihitung dari order real saja.
- **localStorage key** — `bigseller-state-v2`. Ganti ke `v3` kalau ada breaking change di struktur state.
