'use server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/session'
import { ASSET_TYPES } from '@/lib/asset-types'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type AuthState = {
  errors?: Record<string, string[]>
  message?: string
}

export async function login(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { email, password } = parsed.data

  const user = await db.user.findUnique({ where: { email } })
  if (!user) {
    return { message: 'Invalid email or password' }
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatch) {
    return { message: 'Invalid email or password' }
  }

  await createSession(user.id)
  redirect('/dashboard')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}

export async function register(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const raw = {
    name: formData.get('name') as string | null,
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { name, email, password } = parsed.data

  const existingUser = await db.user.findUnique({ where: { email } })
  if (existingUser) {
    return { message: 'An account with this email already exists' }
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      name: name || null,
    },
  })

  // Seed asset types if not already seeded
  for (const assetType of ASSET_TYPES) {
    await db.assetType.upsert({
      where: { code: assetType.code },
      update: {},
      create: assetType,
    })
  }

  await createSession(user.id)
  redirect('/dashboard')
}
