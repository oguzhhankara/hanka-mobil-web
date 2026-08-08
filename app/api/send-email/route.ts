import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { name, phone, date, service, location, note } = await req.json();
  
  try {
    await resend.emails.send({
      from: 'Hanka Mobil <onboarding@resend.dev>', 
      to: 'oguzhkara@gmail.com', // BURAYA KENDİ MAİLİNİ YAZ.
      subject: '🚗 Yeni Randevu Talebi Var!',
      html: `
        <h1>Yeni Randevu Geldi!</h1>
        <p><strong>Müşteri:</strong> ${name}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
        <p><strong>Hizmet:</strong> ${service}</p>
        <p><strong>Tarih:</strong> ${date.replace('T', ' ')}</p>
        <p><strong>Konum:</strong> ${location}</p>
        <p><strong>Not:</strong> ${note}</p>
      `
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}