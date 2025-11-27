import { NextResponse } from 'next/server'

export async function POST() {
  console.log('TEST API CALLED!')
  return NextResponse.json({ success: true, message: 'Test works!' })
}
