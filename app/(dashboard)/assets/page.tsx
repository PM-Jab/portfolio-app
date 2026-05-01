import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'
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
import { DeleteAssetButton } from '@/components/assets/delete-asset-button'

export default async function AssetsPage() {
  const { userId } = await verifySession()

  const assets = await db.asset.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { assetType: true },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Assets</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your investment assets.</p>
        </div>
        <Link href="/assets/new" className={cn(buttonVariants())}>
          <Plus className="h-4 w-4 mr-2" />
          Add Asset
        </Link>
      </div>

      {assets.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <p className="text-muted-foreground text-sm">No assets added yet.</p>
            <Link href="/assets/new" className={cn(buttonVariants())}>
              <Plus className="h-4 w-4 mr-2" />
              Add your first asset
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-mono font-medium">{asset.symbol}</TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{asset.assetType.displayName}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{asset.currency}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {asset.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/assets/${asset.id}/edit`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Link>
                      <DeleteAssetButton assetId={asset.id} assetName={asset.symbol} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
