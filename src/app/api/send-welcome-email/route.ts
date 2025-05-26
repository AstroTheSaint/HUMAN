import { Resend } from 'resend'
import { getWelcomeEmailHtml } from '@/lib/email-templates'
import { NextResponse } from 'next/server'
import { CONTACTS } from '@/lib/constants'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json()

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    const data = await resend.emails.send({
      from: 'hello@xn--humn-7z5f.com',
      to: email,
      cc: CONTACTS.JOHNNY.EMAIL,
      replyTo: CONTACTS.JOHNNY.EMAIL,
      subject: `Welcome to HUM人N, ${name}!`,
      html: getWelcomeEmailHtml(name),
    })

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
} 