import Link from 'next/link'
import { Plus } from 'lucide-react'
import { verifySession } from '@/lib/dal'
import { db } from '@/lib/db'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const TX_TYPE_COLORS: Record<string, string> = {
  BUY: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  SELL: 'bg-red-400/10 text-red-400 border-red-400/20',
  DIVIDEND: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  DEPOSIT: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  WITHDRAWAL: 'bg-red-400/10 text-red-400 border-red-400/20',
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ assetId?: string }>
}) {
  const { userId } = await verifySession()
  const { assetId } = await searchParams

  const [transactions, assets] = await Promise.all([
    db.transaction.findMany({
      where: {
        asset: { userId },
        ...(assetId ? { assetId } : {}),
      },
      orderBy: { executedAt: 'desc' },
      include: { asset: true },
    }),
    db.asset.findMany({
      where: { userId },
      orderBy: { symbol: 'asc' },
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-1 text-sm">Track your buy, sell, and other transactions.</p>
        </div>
        <Link href="/transactions/new" className={cn(buttonVariants())}>
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Link>
      </div>

      {/* Asset filter */}
      {assets.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filter:</span>
          <Link
            href="/transactions"
            className={`text-xs px-2 py-1 rounded-full border transition-colors ${
              !assetId
                ? 'bg-foreground text-background border-foreground'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </Link>
          {assets.map((a) => (
            <Link
              key={a.id}
              href={`/transactions?assetId=${a.id}`}
              className={`text-xs px-2 py-1 rounded-full border transition-colors font-mono ${
                assetId === a.id
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {a.symbol}
            </Link>
          ))}
        </div>
      )}

      {transactions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <p className="text-muted-foreground text-sm">No transactions yet.</p>
            <Link href="/transactions/new" className={cn(buttonVariants())}>
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Fee</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => {
                const total = parseFloat(tx.quantity.toString()) * parseFloat(tx.price.toString())
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {tx.executedAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${TX_TYPE_COLORS[tx.txType] ?? ''}`}
                      >
                        {tx.txType}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm font-medium">
                      {tx.asset.symbol}
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono">
                      {parseFloat(tx.quantity.toString()).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono">
                      {parseFloat(tx.price.toString()).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8,
                      })}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground font-mono">
                      {parseFloat(tx.fee.toString()).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8,
                      })}
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono">
                      {total.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {tx.notes || '—'}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
