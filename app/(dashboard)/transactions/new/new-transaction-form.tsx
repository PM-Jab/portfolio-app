'use client'
import { useActionState } from 'react'
import Link from 'next/link'
import { createTransaction, type TransactionState } from '@/server/actions/transactions'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Asset {
  id: string
  symbol: string
  name: string
  currency: string
}

const TX_TYPES = ['BUY', 'SELL', 'DIVIDEND', 'DEPOSIT', 'WITHDRAWAL']
const CURRENCIES = ['USD', 'THB', 'EUR', 'GBP', 'JPY', 'BTC']

const initialState: TransactionState = {}

export function NewTransactionForm({ assets }: { assets: Asset[] }) {
  const [state, formAction, isPending] = useActionState(createTransaction, initialState)

  // Today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Transaction</h1>
        <p className="text-muted-foreground mt-1 text-sm">Record a new transaction.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transaction Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state?.message && (
              <p className="text-sm text-red-400 bg-red-400/10 rounded-md px-3 py-2">
                {state.message}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="assetId">Asset</Label>
              <Select name="assetId" required>
                <SelectTrigger id="assetId">
                  <SelectValue placeholder="Select asset" />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.symbol} — {asset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state?.errors?.assetId && (
                <p className="text-xs text-red-400">{state.errors.assetId[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="txType">Type</Label>
              <Select name="txType" required>
                <SelectTrigger id="txType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {TX_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state?.errors?.txType && (
                <p className="text-xs text-red-400">{state.errors.txType[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  required
                />
                {state?.errors?.quantity && (
                  <p className="text-xs text-red-400">{state.errors.quantity[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  required
                />
                {state?.errors?.price && (
                  <p className="text-xs text-red-400">{state.errors.price[0]}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fee">Fee (optional)</Label>
                <Input
                  id="fee"
                  name="fee"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  defaultValue="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select name="currency" defaultValue="USD" required>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="executedAt">Date</Label>
              <Input
                id="executedAt"
                name="executedAt"
                type="date"
                defaultValue={today}
                required
              />
              {state?.errors?.executedAt && (
                <p className="text-xs text-red-400">{state.errors.executedAt[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                name="notes"
                placeholder="Any notes about this transaction"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Adding...' : 'Add Transaction'}
              </Button>
              <Link href="/transactions" className={cn(buttonVariants({ variant: 'ghost' }))}>
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
