import { verifySession } from '@/lib/dal'
import { db } from '@/lib/db'
import { NewTransactionForm } from './new-transaction-form'

export default async function NewTransactionPage() {
  const { userId } = await verifySession()

  const assets = await db.asset.findMany({
    where: { userId },
    orderBy: { symbol: 'asc' },
  })

  return <NewTransactionForm assets={assets} />
}
