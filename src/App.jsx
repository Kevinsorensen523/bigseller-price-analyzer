import { useDataStore } from './hooks/useDataStore'
import { useDarkMode } from './hooks/useDarkMode'
import FileUpload from './components/FileUpload'
import SummaryBar from './components/SummaryBar'
import FilterBar from './components/FilterBar'
import ColumnSelector from './components/ColumnSelector'
import DataTable from './components/DataTable'
import ExportMenu from './components/ExportMenu'

export default function App() {
  const [dark, setDark] = useDarkMode()
  const { state, dispatch, groups, summary, orderedVisibleCols, allColumns, uniqueMarketplaces, uniqueStatuses } = useDataStore()

  const hasData = state.rows.length > 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Navbar */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-full px-2 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">B</div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-none">BigSeller Price Analyzer</h1>
              {hasData && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{state.fileName} · {state.rows.length} baris</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasData && (
              <button
                onClick={() => dispatch({ type: 'CLEAR_DATA' })}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                title="Hapus data, simpan pengaturan"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Hapus Data
              </button>
            )}
            <button
              onClick={() => setDark(d => !d)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
              title={dark ? 'Light mode' : 'Dark mode'}
            >
              {dark
                ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              }
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-full px-2 px-4 py-6 space-y-5">
        {/* Error */}
        {state.error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{state.error}</span>
            <button onClick={() => dispatch({ type: 'RESET' })} className="ml-auto text-xs underline">Tutup</button>
          </div>
        )}

        {/* Loading */}
        {state.loading && (
          <div className="flex items-center justify-center gap-3 p-8 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" style={{ borderWidth: '3px' }} />
            <span className="text-sm text-gray-600 dark:text-gray-400">Memproses file...</span>
          </div>
        )}

        {/* Upload Zone */}
        {!hasData && !state.loading && (
          <FileUpload dispatch={dispatch} />
        )}

        {/* Data View */}
        {hasData && (
          <>
            <SummaryBar summary={summary} />

            {/* Toolbar */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <FilterBar
                state={state}
                dispatch={dispatch}
                uniqueMarketplaces={uniqueMarketplaces}
                uniqueStatuses={uniqueStatuses}
                allColumns={allColumns}
              />
              <div className="flex items-center gap-2 flex-shrink-0">
                <ColumnSelector
                  allColumns={allColumns}
                  visibleCols={state.visibleCols}
                  dispatch={dispatch}
                />
                <ExportMenu
                  groups={groups}
                  orderedVisibleCols={orderedVisibleCols}
                  summary={summary}
                />
              </div>
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                Menampilkan <strong>{groups.length}</strong> grup dari <strong>{summary.rowCount}</strong> transaksi
              </span>
              {summary.rowCount !== state.rows.length && (
                <span className="text-blue-500">Filter aktif · {state.rows.length - summary.rowCount} tersembunyi</span>
              )}
            </div>

            <DataTable
              groups={groups}
              state={state}
              dispatch={dispatch}
              orderedVisibleCols={orderedVisibleCols}
              allColumns={allColumns}
            />
          </>
        )}
      </main>
    </div>
  )
}
