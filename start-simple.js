// Script simples para iniciar o servidor Next.js
const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando InnerAI Clone...');
console.log('📁 Diretório:', __dirname);

// Verificar se node_modules existe
const fs = require('fs');
const nodeModulesPath = path.join(__dirname, 'node_modules');

if (!fs.existsSync(nodeModulesPath)) {
    console.log('❌ node_modules não encontrado. Execute: npm install');
    process.exit(1);
}

// Tentar encontrar o Next.js
const nextPath = path.join(nodeModulesPath, 'next', 'dist', 'bin', 'next');
if (fs.existsSync(nextPath)) {
    console.log('✅ Next.js encontrado em:', nextPath);
    
    const command = `node "${nextPath}" dev -p 3000 -H 0.0.0.0`;
    console.log('🔧 Executando:', command);
    
    const child = exec(command, { cwd: __dirname });
    
    child.stdout.on('data', (data) => {
        console.log(data.toString());
    });
    
    child.stderr.on('data', (data) => {
        console.log('Erro:', data.toString());
    });
    
    child.on('close', (code) => {
        console.log(`Processo finalizado com código: ${code}`);
    });
} else {
    console.log('❌ Next.js não encontrado. Instalação pode estar incompleta.');
    console.log('💡 Tente executar: npm install --force');
}