import 'server-only'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'

export async function verifySession() {
  const session = await getSession()
  if (!session?.userId) {
    redirect('/login')
  }
  return { userId: session.userId }
}

export async function getUser() {
  const { userId } = await verifySession()
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      baseCurrency: true,
      createdAt: true,
    },
  })
  return user
}
