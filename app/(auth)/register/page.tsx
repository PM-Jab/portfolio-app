'use client'
import { useActionState } from 'react'
import Link from 'next/link'
import { register, type AuthState } from '@/server/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: AuthState = {}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, initialState)

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold tracking-tight">Create account</CardTitle>
        <CardDescription>Set up your personal portfolio tracker</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.message && (
            <p className="text-sm text-red-400 bg-red-400/10 rounded-md px-3 py-2">
              {state.message}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              autoComplete="name"
            />
            {state?.errors?.name && (
              <p className="text-xs text-red-400">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            {state?.errors?.email && (
              <p className="text-xs text-red-400">{state.errors.email[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              required
            />
            {state?.errors?.password && (
              <p className="text-xs text-red-400">{state.errors.password[0]}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-foreground underline underline-offset-4 hover:opacity-80">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
