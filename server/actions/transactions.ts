'use server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/dal'
import { TxType } from '@/lib/generated/prisma/enums'

const transactionSchema = z.object({
  assetId: z.string().min(1, 'Asset is required'),
  txType: z.nativeEnum(TxType),
  quantity: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Quantity must be a positive number'),
  price: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, 'Price must be a non-negative number'),
  fee: z.string().optional(),
  currency: z.string().min(1, 'Currency is required'),
  executedAt: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
})

export type TransactionState = {
  errors?: Record<string, string[]>
  message?: string
}

export async function createTransaction(_prevState: TransactionState, formData: FormData): Promise<TransactionState> {
  const { userId } = await verifySession()

  const raw = {
    assetId: formData.get('assetId'),
    txType: formData.get('txType'),
    quantity: formData.get('quantity'),
    price: formData.get('price'),
    fee: formData.get('fee') || '0',
    currency: formData.get('currency'),
    executedAt: formData.get('executedAt'),
    notes: formData.get('notes') || undefined,
  }

  const parsed = transactionSchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  // Verify asset belongs to user
  const asset = await db.asset.findFirst({
    where: { id: parsed.data.assetId, userId },
  })
  if (!asset) {
    return { message: 'Asset not found' }
  }

  await db.transaction.create({
    data: {
      assetId: parsed.data.assetId,
      txType: parsed.data.txType,
      quantity: parsed.data.quantity,
      price: parsed.data.price,
      fee: parsed.data.fee || '0',
      currency: parsed.data.currency,
      executedAt: new Date(parsed.data.executedAt),
      notes: parsed.data.notes || null,
    },
  })

  revalidatePath('/transactions')
  redirect('/transactions')
}

export async function deleteTransaction(id: string) {
  const { userId } = await verifySession()

  // Verify transaction belongs to user via asset
  const transaction = await db.transaction.findFirst({
    where: {
      id,
      asset: { userId },
    },
  })

  if (!transaction) {
    return { message: 'Transaction not found' }
  }

  await db.transaction.delete({ where: { id } })
  revalidatePath('/transactions')
}
