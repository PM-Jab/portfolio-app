'use client'
import { useActionState, useState } from 'react'
import Link from 'next/link'
import { updateTransaction, type TransactionState } from '@/server/actions/transactions'
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
  typeCode: string
}

interface TransactionData {
  id: string
  assetId: string
  txType: string
  quantity: string
  price: string
  fee: string
  currency: string
  executedAt: string
  notes: string | null
}

const TX_TYPES_DEFAULT = ['BUY', 'SELL', 'DIVIDEND', 'DEPOSIT', 'WITHDRAWAL']
const TX_TYPES_CASH = ['DEPOSIT', 'WITHDRAWAL']
const CURRENCIES = ['USD', 'THB', 'EUR', 'GBP', 'JPY', 'BTC']

const initialState: TransactionState = {}

export function EditTransactionForm({
  transaction,
  assets,
}: {
  transaction: TransactionData
  assets: Asset[]
}) {
  const updateWithId = updateTransaction.bind(null, transaction.id)
  const [state, formAction, isPending] = useActionState(updateWithId, initialState)

  const [selectedAssetId, setSelectedAssetId] = useState(transaction.assetId)
  const selectedAsset = assets.find((a) => a.id === selectedAssetId)
  const isCash = selectedAsset?.typeCode === 'cash'
  const txTypes = isCash ? TX_TYPES_CASH : TX_TYPES_DEFAULT

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Transaction</h1>
        <p className="text-muted-foreground mt-1 text-sm">Update this transaction&apos;s details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transaction Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state?.message && (
              <p className="rounded-md bg-red-400/10 px-3 py-2 text-sm text-red-400">
                {state.message}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="assetId">Asset</Label>
              <Select
                name="assetId"
                value={selectedAssetId}
                onValueChange={(v) => setSelectedAssetId(v ?? '')}
                required
              >
                <SelectTrigger id="assetId">
                  <SelectValue placeholder="Select asset">
                    {selectedAsset?.symbol}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false} align="start" className="min-w-64">
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
              <Select name="txType" defaultValue={transaction.txType} required>
                <SelectTrigger id="txType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false} align="start">
                  {txTypes.map((t) => (
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

            <div className={isCash ? 'space-y-2' : 'grid grid-cols-2 gap-4'}>
              <div className="space-y-2">
                <Label htmlFor="quantity">{isCash ? 'Amount' : 'Quantity'}</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  step="any"
                  min="0"
                  defaultValue={transaction.quantity}
                  required
                />
                {state?.errors?.quantity && (
                  <p className="text-xs text-red-400">{state.errors.quantity[0]}</p>
                )}
              </div>

              {isCash ? (
                <input type="hidden" name="price" value="1" />
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="any"
                    min="0"
                    defaultValue={transaction.price}
                    required
                  />
                  {state?.errors?.price && (
                    <p className="text-xs text-red-400">{state.errors.price[0]}</p>
                  )}
                </div>
              )}
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
                  defaultValue={transaction.fee}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select name="currency" defaultValue={transaction.currency} required>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false} align="start">
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
                defaultValue={transaction.executedAt}
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
                defaultValue={transaction.notes ?? ''}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving…' : 'Save Changes'}
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
