import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API anahtarı eksik. Lütfen yapılandırın.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { messages, tenant, contextData } = body;

    // Build the system prompt
    const systemPrompt = `Sen "SektörPanel" isimli SaaS platformunun resmi yapay zeka asistanısın. 
Şu an "${tenant?.company_name || 'Bilinmeyen'}" adlı işletmeye hizmet veriyorsun. Bu işletmenin sektörü: ${tenant?.sector || 'Bilinmiyor'}.
Görevin, bu işletmenin verilerini analiz ederek sorularına çok zekice, kısa, net ve profesyonel cevaplar vermek.

İşte işletmenin güncel veritabanı özeti (Context):
- Müşteriler: Toplam ${contextData?.customersCount || 0} müşteri.
- Bekleyen Siparişler/İşler: ${contextData?.pendingOrdersCount || 0} adet.
- Bu Ayki Gelir: ${contextData?.monthlyRevenue || 0} TL.
- Bugün Randevu: ${contextData?.todayApptsCount || 0} adet.

Kurallar:
1. Kısa ve öz cevap ver. Madde işaretleri kullanmaktan çekinme.
2. İşletme verilerini kullanarak stratejik tavsiyeler ver.
3. Asla kod yazma, sen bir iş yönetim ve analiz asistanısın.
4. Sıcak, profesyonel ve teşvik edici bir ton kullan.`;

    // Filter messages to format correctly for Anthropic
    // Anthropic expects messages array with role 'user' or 'assistant'
    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.text
    }));

    // We only pass the latest messages to save tokens if needed, but for context we'll pass all.
    // Ensure the array doesn't start with an assistant message without a user prompt
    if (formattedMessages.length > 0 && formattedMessages[0].role === 'assistant') {
      formattedMessages.shift();
    }

    const response = await anthropic.messages.create({
      model: "claude-4-6-sonnet-latest",
      max_tokens: 1024,
      system: systemPrompt,
      messages: formattedMessages,
    });

    // Extract text from response
    // Claude SDK returns an array of content blocks.
    const responseText = response.content.map(block => 'text' in block ? block.text : '').join('');

    return NextResponse.json({ reply: responseText });
    
  } catch (error: any) {
    console.error('Anthropic API Error:', error);
    return NextResponse.json(
      { error: 'Yapay zeka asistanı şu an yanıt veremiyor. Hata: ' + (error.message || 'Bilinmeyen hata') },
      { status: 500 }
    );
  }
}
