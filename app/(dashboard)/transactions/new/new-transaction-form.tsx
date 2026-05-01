'use client'
import { useState, useTransition, useActionState } from 'react'
import Link from 'next/link'
import { PlusIcon, XIcon } from 'lucide-react'
import { createTransaction, type TransactionState } from '@/server/actions/transactions'
import { createAssetInline } from '@/server/actions/assets'
import { ASSET_TYPES } from '@/lib/asset-types'
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

export function NewTransactionForm({ assets: initialAssets }: { assets: Asset[] }) {
  const [state, formAction, isPending] = useActionState(createTransaction, initialState)

  const [assetList, setAssetList] = useState<Asset[]>(initialAssets)
  const [selectedAssetId, setSelectedAssetId] = useState('')
  const [showNewAsset, setShowNewAsset] = useState(initialAssets.length === 0)

  const [inlineErrors, setInlineErrors] = useState<Record<string, string[]>>({})
  const [inlineMessage, setInlineMessage] = useState('')
  const [isPendingAsset, startAssetTransition] = useTransition()

  const today = new Date().toISOString().split('T')[0]

  const handleAssetSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setInlineErrors({})
    setInlineMessage('')
    startAssetTransition(async () => {
      const result = await createAssetInline({}, formData)
      if (result.asset) {
        setAssetList((prev) => {
          const exists = prev.some((a) => a.id === result.asset!.id)
          return exists ? prev : [...prev, result.asset!]
        })
        setSelectedAssetId(result.asset.id)
        setShowNewAsset(false)
      } else {
        if (result.errors) setInlineErrors(result.errors)
        if (result.message) setInlineMessage(result.message)
      }
    })
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Transaction</h1>
        <p className="text-muted-foreground mt-1 text-sm">Record a new transaction.</p>
      </div>

      {/* Inline new-asset form — sibling of the transaction form, never nested */}
      {showNewAsset && (
        <form onSubmit={handleAssetSubmit}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">New Asset</CardTitle>
                {assetList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowNewAsset(false)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Close"
                  >
                    <XIcon className="size-4" />
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {inlineMessage && (
                <p className="rounded bg-red-400/10 px-2 py-1.5 text-xs text-red-400">
                  {inlineMessage}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="new-symbol" className="text-xs">Symbol</Label>
                  <Input
                    id="new-symbol"
                    name="symbol"
                    placeholder="AAPL"
                    className="h-7 text-xs"
                    required
                  />
                  {inlineErrors.symbol && (
                    <p className="text-xs text-red-400">{inlineErrors.symbol[0]}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="new-name" className="text-xs">Name</Label>
                  <Input
                    id="new-name"
                    name="name"
                    placeholder="Apple Inc."
                    className="h-7 text-xs"
                    required
                  />
                  {inlineErrors.name && (
                    <p className="text-xs text-red-400">{inlineErrors.name[0]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Type</Label>
                  <Select name="typeCode" required>
                    <SelectTrigger size="sm">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSET_TYPES.map((t) => (
                        <SelectItem key={t.code} value={t.code}>
                          {t.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {inlineErrors.typeCode && (
                    <p className="text-xs text-red-400">{inlineErrors.typeCode[0]}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Currency</Label>
                  <Select name="currency" defaultValue="USD" required>
                    <SelectTrigger size="sm">
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
                  {inlineErrors.currency && (
                    <p className="text-xs text-red-400">{inlineErrors.currency[0]}</p>
                  )}
                </div>
              </div>

              <Button type="submit" size="sm" disabled={isPendingAsset} className="w-full">
                {isPendingAsset ? 'Creating…' : 'Create Asset'}
              </Button>
            </CardContent>
          </Card>
        </form>
      )}

      {/* Transaction form */}
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

            {/* Asset selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="assetId">Asset</Label>
                {/* type="button" prevents this from submitting the transaction form */}
                <button
                  type="button"
                  onClick={() => setShowNewAsset((v) => !v)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  {showNewAsset ? (
                    <><XIcon className="size-3" /> Cancel</>
                  ) : (
                    <><PlusIcon className="size-3" /> New asset</>
                  )}
                </button>
              </div>
              <Select
                value={selectedAssetId}
                onValueChange={(v) => setSelectedAssetId(v ?? '')}
                name="assetId"
                required
              >
                <SelectTrigger id="assetId">
                  <SelectValue
                    placeholder={
                      assetList.length === 0
                        ? 'Create an asset above first'
                        : 'Select asset'
                    }
                  >
                    {assetList.find((a) => a.id === selectedAssetId)?.symbol}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {assetList.map((asset) => (
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
                {isPending ? 'Adding…' : 'Add Transaction'}
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
