import Link from 'next/link'
import { Plus } from 'lucide-react'
import { verifySession } from '@/lib/dal'
import { db } from '@/lib/db'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function DashboardPage() {
  const { userId } = await verifySession()

  const [user, assetCount, transactionCount, recentAssets] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
    db.asset.count({ where: { userId } }),
    db.transaction.count({ where: { asset: { userId } } }),
    db.asset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { assetType: true },
    }),
  ])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back{user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className="text-muted-foreground mt-1">Here&apos;s an overview of your portfolio.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{assetCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{transactionCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Empty state or recent assets */}
      {assetCount === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <p className="text-muted-foreground text-sm">No assets yet. Start by adding your first asset.</p>
            <Link href="/assets/new" className={cn(buttonVariants())}>
              <Plus className="h-4 w-4 mr-2" />
              Add your first asset
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium">Recent Assets</h2>
            <Link href="/assets" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
              View all
            </Link>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentAssets.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-medium">{asset.symbol}</p>
                        <p className="text-xs text-muted-foreground">{asset.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {asset.assetType.displayName}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{asset.currency}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
