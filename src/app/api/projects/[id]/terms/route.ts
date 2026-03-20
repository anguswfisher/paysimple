import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    terms: [
      { category: 'contract_basics', field_name: 'contract_sum', value: 450000 },
      { category: 'payment_terms', field_name: 'payment_frequency', value: 'monthly' }
    ]
  })
}

export async function PATCH() {
  return NextResponse.json({ message: 'Terms updated' })
}
