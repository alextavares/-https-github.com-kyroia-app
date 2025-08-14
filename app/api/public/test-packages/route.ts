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
  <style>
    body { font-family: sans-serif; padding: 20px; background: #1a1a1a; color: white; }
    .package { margin: 20px 0; padding: 15px; border: 1px solid #333; border-radius: 8px; background: #2a2a2a; }
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
  <p style="color: #94a3b8;">Nota: Os links abaixo precisam de autenticação. Faça login primeiro em /auth/signin</p>
  
  ${packages.map(pkg => `
    <div class="package">
      <h3>${pkg.name} <span class="status" id="status-${pkg.id}">Não testado</span></h3>
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
        <button onclick="testFetch('${pkg.id}')" class="link" style="border: none; cursor: pointer; background: #7c3aed;">
          🔍 Testar com Fetch
        </button>
      </div>
      
      <div id="result-${pkg.id}" style="margin-top: 10px; padding: 10px; background: #1a1a1a; border-radius: 5px; display: none;"></div>
    </div>
  `).join('')}
  
  <script>
    async function testFetch(packageId) {
      const resultDiv = document.getElementById('result-' + packageId);
      const statusSpan = document.getElementById('status-' + packageId);
      
      resultDiv.style.display = 'block';
      resultDiv.innerHTML = '⏳ Testando...';
      statusSpan.textContent = 'Testando...';
      statusSpan.className = 'status';
      
      try {
        const response = await fetch('/dashboard/credits/purchase/' + packageId, {
          method: 'GET',
          credentials: 'same-origin',
          redirect: 'manual'
        });
        
        if (response.ok || response.type === 'opaqueredirect') {
          resultDiv.innerHTML = '<span style="color: #4ade80;">✅ Success: Status ' + response.status + '</span>';
          statusSpan.textContent = 'OK';
          statusSpan.className = 'status success';
        } else if (response.status === 404) {
          resultDiv.innerHTML = '<span style="color: #f87171;">❌ Error 404: Página não encontrada</span>';
          statusSpan.textContent = '404';
          statusSpan.className = 'status error';
        } else if (response.status === 401 || response.status === 307) {
          resultDiv.innerHTML = '<span style="color: #fbbf24;">⚠️ Redirecionamento para login (Status ' + response.status + ')</span>';
          statusSpan.textContent = 'Login Req';
          statusSpan.className = 'status';
        } else {
          resultDiv.innerHTML = '<span style="color: #f87171;">❌ Error: Status ' + response.status + ' - ' + response.statusText + '</span>';
          statusSpan.textContent = 'Erro ' + response.status;
          statusSpan.className = 'status error';
        }
        
        // Tentar pegar o conteúdo se possível
        if (response.status === 404) {
          try {
            const text = await response.text();
            if (text.includes('This page could not be found')) {
              resultDiv.innerHTML += '<br><small style="color: #94a3b8;">Next.js 404 padrão detectado</small>';
            }
          } catch {}
        }
      } catch (error) {
        resultDiv.innerHTML = '<span style="color: #f87171;">❌ Fetch error: ' + error.message + '</span>';
        statusSpan.textContent = 'Erro';
        statusSpan.className = 'status error';
      }
    }
    
    // Auto-teste ao carregar
    window.addEventListener('load', () => {
      console.log('Página de teste carregada. Use os botões para testar cada link.');
    });
  </script>
</body>
</html>
    `
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      }
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Failed to fetch packages',
      details: error.message 
    }, { status: 500 })
  }
}