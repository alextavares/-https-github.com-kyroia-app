// Diagnóstico específico do problema do chat
async function diagnoseChatIssue() {
    console.log('🔍 Diagnosticando problema do chat em produção...\n');
    // Testar diferentes URLs e verificar respostas
    const urls = [
        'https://seahorse-app-k5pag.ondigitalocean.app',
        'https://seahorse-app-k5pag.ondigitalocean.app/dashboard',
        'https://seahorse-app-k5pag.ondigitalocean.app/dashboard/chat',
        'https://seahorse-app-k5pag.ondigitalocean.app/api/auth/session'
    ];
    console.log('1. Testando URLs sem autenticação:');
    for (const url of urls) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                redirect: 'manual' // Não seguir redirects automaticamente
            });
            console.log(`${url}:`);
            console.log(`   Status: ${response.status}`);
            console.log(`   Redirect: ${response.headers.get('location') || 'Nenhum'}`);
            if (response.status === 200) {
                const text = await response.text();
                const hasLoginForm = text.includes('email') && text.includes('password');
                const hasChat = text.includes('chat') || text.includes('message');
                console.log(`   Tipo: ${hasLoginForm ? 'Login' : hasChat ? 'Chat' : 'Outro'}`);
            }
            console.log();
        }
        catch (error) {
            console.log(`   Erro: ${error.message}\n`);
        }
    }
    // Testar login via API
    console.log('2. Testando login via API:');
    try {
        // Obter CSRF token
        const csrfResponse = await fetch('https://seahorse-app-k5pag.ondigitalocean.app/api/auth/csrf');
        const csrfData = await csrfResponse.json();
        console.log(`✅ CSRF Token obtido: ${csrfData.csrfToken.substring(0, 20)}...`);
        // Fazer login
        const loginData = new URLSearchParams({
            email: 'test@example.com',
            password: 'test123',
            csrfToken: csrfData.csrfToken,
            callbackUrl: 'https://seahorse-app-k5pag.ondigitalocean.app/dashboard/chat'
        });
        const loginResponse = await fetch('https://seahorse-app-k5pag.ondigitalocean.app/api/auth/callback/credentials', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: loginData,
            redirect: 'manual'
        });
        console.log(`Login Status: ${loginResponse.status}`);
        console.log(`Login Redirect: ${loginResponse.headers.get('location') || 'Nenhum'}`);
        // Verificar cookies de sessão
        const cookies = loginResponse.headers.get('set-cookie');
        if (cookies) {
            console.log('✅ Cookies de sessão recebidos');
            console.log(`Cookies: ${cookies.substring(0, 100)}...`);
        }
        else {
            console.log('❌ Nenhum cookie de sessão recebido');
        }
    }
    catch (error) {
        console.error('❌ Erro no teste de login:', error.message);
    }
    // Verificar se há problemas específicos
    console.log('\n3. Possíveis problemas identificados:');
    // Testar se o problema é de CORS ou CSP
    try {
        const testResponse = await fetch('https://seahorse-app-k5pag.ondigitalocean.app/dashboard/chat', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; ChatTest/1.0)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        });
        if (testResponse.status === 307 || testResponse.status === 302) {
            console.log('❌ Problema: Chat sempre redireciona para login');
            console.log('   Possível causa: Middleware de autenticação muito restritivo');
        }
        if (testResponse.status === 500) {
            console.log('❌ Problema: Erro interno do servidor');
            console.log('   Verificar logs do servidor para detalhes');
        }
    }
    catch (error) {
        console.log('❌ Problema de conectividade ou timeout');
    }
    console.log('\n🔧 Recomendações baseadas no diagnóstico:');
    console.log('1. Verificar middleware de autenticação em /dashboard/chat');
    console.log('2. Verificar se NextAuth está configurado corretamente');
    console.log('3. Verificar logs do servidor para erros específicos');
    console.log('4. Testar login manual no navegador');
    console.log('5. Verificar se variáveis NEXTAUTH_* estão corretas');
    console.log('\n📝 Próximos passos:');
    console.log('1. Login manual: https://seahorse-app-k5pag.ondigitalocean.app/auth/signin');
    console.log('2. Email: test@example.com');
    console.log('3. Senha: test123');
    console.log('4. Verificar se consegue acessar /dashboard/chat após login');
}
if (require.main === module) {
    diagnoseChatIssue();
}
export { diagnoseChatIssue };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhZ25vc2UtY2hhdC1pc3N1ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpYWdub3NlLWNoYXQtaXNzdWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsNkNBQTZDO0FBRTdDLEtBQUssVUFBVSxpQkFBaUI7SUFDOUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxREFBcUQsQ0FBQyxDQUFBO0lBRWxFLCtDQUErQztJQUMvQyxNQUFNLElBQUksR0FBRztRQUNYLCtDQUErQztRQUMvQyx5REFBeUQ7UUFDekQsOERBQThEO1FBQzlELGdFQUFnRTtLQUNqRSxDQUFBO0lBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFBO0lBQ2pELEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDO1lBQ0gsTUFBTSxRQUFRLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxFQUFFO2dCQUNoQyxNQUFNLEVBQUUsS0FBSztnQkFDYixRQUFRLEVBQUUsUUFBUSxDQUFDLHVDQUF1QzthQUMzRCxDQUFDLENBQUE7WUFFRixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtZQUN0QixPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7WUFDNUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksUUFBUSxFQUFFLENBQUMsQ0FBQTtZQUUzRSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFFLENBQUM7Z0JBQzVCLE1BQU0sSUFBSSxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFBO2dCQUNsQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxD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