'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-navy">Create Account</CardTitle>
          <CardDescription>
            Start your free trial of PaySimple
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              type="text"
              placeholder="Enter your company name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              required
            />
          </div>
          <Button className="w-full bg-navy hover:bg-navy/90">
            Create Account
          </Button>
          <div className="text-center">
            <Link href="/login" className="text-sm text-steel hover:underline">
              Already have an account? Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
