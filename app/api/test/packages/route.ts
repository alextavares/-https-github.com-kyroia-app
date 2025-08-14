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
    .package { margin: 20px 0; padding: 15px; border: 1px solid #333; border-radius: 8px; }
    .link { display: inline-block; margin: 5px; padding: 10px 20px; background: #0070f3; color: white; text-decoration: none; border-radius: 5px; }
    .link:hover { background: #0051cc; }
    pre { background: #2a2a2a; padding: 10px; border-radius: 5px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>Test Credit Package Links</h1>
  <p>Total packages found: ${packages.length}</p>
  
  ${packages.map(pkg => `
    <div class="package">
      <h3>${pkg.name}</h3>
      <pre>ID: ${pkg.id}
Credits: ${pkg.credits}
Price: ${pkg.currency} ${pkg.price}
Plan Type: ${pkg.planType || 'N/A'}</pre>
      
      <div>
        <a href="/dashboard/credits/purchase/${pkg.id}" class="link">
          Open Purchase Page (Link)
        </a>
        <button onclick="window.location.href='/dashboard/credits/purchase/${pkg.id}'" class="link" style="border: none; cursor: pointer;">
          Open Purchase Page (JS)
        </button>
        <button onclick="testFetch('${pkg.id}')" class="link" style="border: none; cursor: pointer;">
          Test with Fetch
        </button>
      </div>
      
      <div id="result-${pkg.id}" style="margin-top: 10px;"></div>
    </div>
  `).join('')}
  
  <script>
    async function testFetch(packageId) {
      const resultDiv = document.getElementById('result-' + packageId);
      resultDiv.innerHTML = 'Testing...';
      
      try {
        const response = await fetch('/dashboard/credits/purchase/' + packageId, {
          method: 'GET',
          credentials: 'same-origin'
        });
        
        if (response.ok) {
          resultDiv.innerHTML = '<span style="color: #4ade80;">✓ Success: ' + response.status + '</span>';
        } else {
          resultDiv.innerHTML = '<span style="color: #f87171;">✗ Error: ' + response.status + ' ' + response.statusText + '</span>';
        }
      } catch (error) {
        resultDiv.innerHTML = '<span style="color: #f87171;">✗ Fetch error: ' + error.message + '</span>';
      }
    }
  </script>
</body>
</html>
    `
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      }
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Failed to fetch packages',
      details: error.message 
    }, { status: 500 })
  }
}