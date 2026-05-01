'use server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/dal'

const assetSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(20).toUpperCase(),
  name: z.string().min(1, 'Name is required').max(100),
  typeCode: z.string().min(1, 'Asset type is required'),
  currency: z.string().min(1, 'Currency is required'),
})

export type AssetState = {
  errors?: Record<string, string[]>
  message?: string
}

export type AssetInlineResult = {
  errors?: Record<string, string[]>
  message?: string
  asset?: { id: string; symbol: string; name: string; currency: string }
}

export async function createAsset(_prevState: AssetState, formData: FormData): Promise<AssetState> {
  const { userId } = await verifySession()

  const raw = {
    symbol: formData.get('symbol'),
    name: formData.get('name'),
    typeCode: formData.get('typeCode'),
    currency: formData.get('currency'),
  }

  const parsed = assetSchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  await db.asset.create({
    data: {
      ...parsed.data,
      userId,
    },
  })

  revalidatePath('/assets')
  revalidatePath('/dashboard')
  redirect('/assets')
}

export async function updateAsset(id: string, _prevState: AssetState, formData: FormData): Promise<AssetState> {
  const { userId } = await verifySession()

  const asset = await db.asset.findFirst({ where: { id, userId } })
  if (!asset) {
    return { message: 'Asset not found' }
  }

  const raw = {
    symbol: formData.get('symbol'),
    name: formData.get('name'),
    typeCode: formData.get('typeCode'),
    currency: formData.get('currency'),
  }

  const parsed = assetSchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  await db.asset.update({
    where: { id },
    data: parsed.data,
  })

  revalidatePath('/assets')
  revalidatePath('/dashboard')
  redirect('/assets')
}

export async function createAssetInline(
  _prevState: AssetInlineResult,
  formData: FormData,
): Promise<AssetInlineResult> {
  const { userId } = await verifySession()

  const raw = {
    symbol: formData.get('symbol'),
    name: formData.get('name'),
    typeCode: formData.get('typeCode'),
    currency: formData.get('currency'),
  }

  const parsed = assetSchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const existing = await db.asset.findFirst({
    where: { userId, symbol: parsed.data.symbol },
  })
  if (existing) {
    return { asset: { id: existing.id, symbol: existing.symbol, name: existing.name, currency: existing.currency } }
  }

  const asset = await db.asset.create({
    data: { ...parsed.data, userId },
    select: { id: true, symbol: true, name: true, currency: true },
  })

  revalidatePath('/assets')
  revalidatePath('/dashboard')
  return { asset }
}

export async function deleteAsset(id: string) {
  const { userId } = await verifySession()

  const asset = await db.asset.findFirst({ where: { id, userId } })
  if (!asset) {
    return { message: 'Asset not found' }
  }

  await db.asset.delete({ where: { id } })

  revalidatePath('/assets')
  revalidatePath('/dashboard')
}
