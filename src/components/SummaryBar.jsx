const IDR = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export default function SummaryBar({ summary }) {
  const hasKilat = summary.totalQtyKilat > 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
      {/* Total Transaksi */}
      <Card
        color="blue"
        icon="📋"
        label="Total Transaksi"
        value={summary.rowCount.toLocaleString('id-ID')}
      />

      {/* Qty Order Real */}
      <Card
        color="green"
        icon="📦"
        label="Qty Order Real"
        value={summary.totalQtyReal.toLocaleString('id-ID')}
        sub={hasKilat ? `+${summary.totalQtyKilat.toLocaleString('id-ID')} kilat` : null}
      />

      {/* Qty Pesanan Kilat */}
      {hasKilat && (
        <Card
          color="orange"
          icon="⚡"
          label="Qty Pesanan Kilat"
          value={summary.totalQtyKilat.toLocaleString('id-ID')}
          sub="tidak ada harga (--)"
        />
      )}

      {/* Total Subtotal (real orders only) */}
      <Card
        color="yellow"
        icon="💰"
        label="Total Subtotal"
        value={IDR(summary.totalSubtotal)}
        sub={hasKilat ? 'exclude pesanan kilat' : null}
      />

      {/* Avg Price */}
      <Card
        color="purple"
        icon="📊"
        label="Avg Price / Unit"
        value={IDR(summary.avgPricePerUnit)}
        sub={hasKilat ? 'dari order real' : null}
      />
    </div>
  )
}

function Card({ color, icon, label, value, sub }) {
  const colorMap = {
    blue:   'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    green:  'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
    orange: 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300',
    yellow: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300',
    purple: 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
  }
  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-medium uppercase tracking-wide opacity-75">{label}</span>
      </div>
      <p className="text-xl font-bold truncate">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
    </div>
  )
}
