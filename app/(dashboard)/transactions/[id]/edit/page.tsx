import { notFound } from 'next/navigation'
import { verifySession } from '@/lib/dal'
import { db } from '@/lib/db'
import { EditTransactionForm } from './edit-transaction-form'

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await verifySession()
  const { id } = await params

  const [transaction, assets] = await Promise.all([
    db.transaction.findFirst({
      where: { id, asset: { userId } },
      include: { asset: { select: { id: true, symbol: true, name: true, currency: true } } },
    }),
    db.asset.findMany({
      where: { userId },
      orderBy: { symbol: 'asc' },
      select: { id: true, symbol: true, name: true, currency: true },
    }),
  ])

  if (!transaction) notFound()

  return (
    <EditTransactionForm
      transaction={{
        id: transaction.id,
        assetId: transaction.assetId,
        txType: transaction.txType,
        quantity: transaction.quantity.toString(),
        price: transaction.price.toString(),
        fee: transaction.fee.toString(),
        currency: transaction.currency,
        executedAt: transaction.executedAt.toISOString().split('T')[0],
        notes: transaction.notes,
      }}
      assets={assets}
    />
  )
}
