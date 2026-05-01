'use client'
import { useActionState } from 'react'
import Link from 'next/link'
import { createAsset, type AssetState } from '@/server/actions/assets'
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

const CURRENCIES = ['USD', 'THB', 'EUR', 'GBP', 'JPY', 'BTC']

const initialState: AssetState = {}

export default function NewAssetPage() {
  const [state, formAction, isPending] = useActionState(createAsset, initialState)

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Asset</h1>
        <p className="text-muted-foreground mt-1 text-sm">Add a new asset to your portfolio.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Asset Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state?.message && (
              <p className="text-sm text-red-400 bg-red-400/10 rounded-md px-3 py-2">
                {state.message}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                name="symbol"
                placeholder="e.g. AAPL, BTC, GOLD"
                required
              />
              {state?.errors?.symbol && (
                <p className="text-xs text-red-400">{state.errors.symbol[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Apple Inc."
                required
              />
              {state?.errors?.name && (
                <p className="text-xs text-red-400">{state.errors.name[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="typeCode">Asset Type</Label>
              <Select name="typeCode" required>
                <SelectTrigger id="typeCode">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_TYPES.map((type) => (
                    <SelectItem key={type.code} value={type.code}>
                      {type.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state?.errors?.typeCode && (
                <p className="text-xs text-red-400">{state.errors.typeCode[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select name="currency" defaultValue="USD" required>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state?.errors?.currency && (
                <p className="text-xs text-red-400">{state.errors.currency[0]}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Adding...' : 'Add Asset'}
              </Button>
              <Link href="/assets" className={cn(buttonVariants({ variant: 'ghost' }))}>
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
