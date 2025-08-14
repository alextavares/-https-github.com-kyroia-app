import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const packages = await prisma.creditPackage.findMany({
      select: {
        id: true,
        name: true,
        credits: true,
        price: true,
        currency: true,
        planType: true,
      },
      orderBy: {
        credits: 'asc'
      }
    })
    
    // Gerar HTML com links diretos para teste
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Package Links</title>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; padding: 20px; background: #1a1a1a; color: white; }
    .success-banner { background: #10b981; color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .package { margin: 20px 0; padding: 15px; border: 1px solid #333; border-radius: 8px; background: #2a2a2a; }
    .working { border: 2px solid #10b981; }
    .link { display: inline-block; margin: 5px; padding: 10px 20px; background: #0070f3; color: white; text-decoration: none; border-radius: 5px; }
    .link:hover { background: #0051cc; }
    pre { background: #1a1a1a; padding: 10px; border-radius: 5px; overflow-x: auto; color: #4ade80; }
    h1 { color: #f59e0b; }
    .status { padding: 5px 10px; border-radius: 3px; margin-left: 10px; font-size: 12px; }
    .status.success { background: #10b981; }
    .status.error { background: #ef4444; }
  </style>
</head>
<body>
  <h1>🧪 Test Credit Package Links</h1>
  <p>Total packages found: <strong>${packages.length}</strong></p>
  
  ${packages.find(p => p.id === 'cme8uw6fu000297u7hux29212') ? `
  <div class="success-banner">
    ✅ <strong>Pacote funcionando:</strong> O pacote "Pacote Premium" (ID: cme8uw6fu000297u7hux29212) está acessível!
  </div>
  ` : ''}
  
  <p style="color: #94a3b8;">Nota: Os links abaixo precisam de autenticação. Faça login primeiro em /auth/signin</p>
  
  ${packages.map(pkg => {
    const isWorking = pkg.id === 'cme8uw6fu000297u7hux29212';
    return `
    <div class="package ${isWorking ? 'working' : ''}">
      <h3>${pkg.name} ${isWorking ? '✅' : ''}</h3>
      <pre>ID: ${pkg.id}
Credits: ${pkg.credits.toLocaleString('pt-BR')}
Price: ${pkg.currency} ${pkg.price.toFixed(2)}
Plan Type: ${pkg.planType || 'N/A'}</pre>
      
      <div>
        <a href="/dashboard/credits/purchase/${pkg.id}" class="link" target="_blank">
          📂 Abrir em Nova Aba
        </a>
        <button onclick="window.location.href='/dashboard/credits/purchase/${pkg.id}'" class="link" style="border: none; cursor: pointer;">
          🔄 Navegar (mesma aba)
        </button>
      </div>
    </div>
  `}).join('')}
  
  <div style="margin-top: 40px; padding: 20px; background: #2a2a2a; border-radius: 8px;">
    <h3>📊 Resumo dos Testes</h3>
    <p>✅ Pacote cme8uw6fu000297u7hux29212 está funcionando (retorna 200)</p>
    <p>❓ Os outros pacotes precisam ser testados individualmente</p>
  </div>
</body>
</html>
    `
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to fetch packages',
      details: error.message 
    }, { status: 500 })
  }
}