import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
async function verifyProductionUser() {
    console.log('🔍 Verificando usuário de teste em produção...\n');
    try {
        const testEmail = 'test@example.com';
        const testPassword = 'test123';
        // Verificar se o usuário existe
        const existingUser = await prisma.user.findUnique({
            where: { email: testEmail }
        });
        if (existingUser) {
            console.log('✅ Usuário de teste encontrado:');
            console.log(`   Email: ${existingUser.email}`);
            console.log(`   Nome: ${existingUser.name}`);
            console.log(`   Plano: ${existingUser.planType}`);
            console.log(`   Criado em: ${existingUser.createdAt}`);
            // Verificar se a senha está correta
            if (existingUser.passwordHash) {
                const isPasswordValid = await bcrypt.compare(testPassword, existingUser.passwordHash);
                console.log(`   Senha válida: ${isPasswordValid ? '✅ SIM' : '❌ NÃO'}`);
                if (!isPasswordValid) {
                    console.log('\n🔧 Atualizando senha do usuário de teste...');
                    const newHashedPassword = await bcrypt.hash(testPassword, 10);
                    await prisma.user.update({
                        where: { email: testEmail },
                        data: { passwordHash: newHashedPassword }
                    });
                    console.log('✅ Senha atualizada com sucesso');
                }
            }
            else {
                console.log('❌ Usuário não tem senha (OAuth only)');
            }
            return true;
        }
        else {
            console.log('❌ Usuário de teste NÃO encontrado em produção');
            console.log('\n🔧 Criando usuário de teste...');
            const hashedPassword = await bcrypt.hash(testPassword, 10);
            const newUser = await prisma.user.create({
                data: {
                    email: testEmail,
                    name: 'Test User Production',
                    passwordHash: hashedPassword,
                    planType: 'PRO', // Dar acesso PRO para testar todos os modelos
                    profession: 'Developer',
                    organization: 'Test Organization'
                }
            });
            console.log('✅ Usuário de teste criado com sucesso:');
            console.log(`   Email: ${newUser.email}`);
            console.log(`   ID: ${newUser.id}`);
            console.log(`   Plano: ${newUser.planType}`);
            return true;
        }
    }
    catch (error) {
        console.error('❌ Erro ao verificar/criar usuário:', error.message);
        return false;
    }
}
async function testLoginCredentials() {
    console.log('\n🧪 Testando credenciais de login...\n');
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'test@example.com' }
        });
        if (user && user.passwordHash) {
            const isPasswordValid = await bcrypt.compare('test123', user.passwordHash);
            if (isPasswordValid) {
                console.log('✅ CREDENCIAIS VÁLIDAS PARA LOGIN:');
                console.log('   Email: test@example.com');
                console.log('   Senha: test123');
                console.log('   Plano:', user.planType);
                return {
                    email: 'test@example.com',
                    password: 'test123',
                    userId: user.id,
                    planType: user.planType
                };
            }
            else {
                console.log('❌ Senha inválida');
            }
        }
        else {
            console.log('❌ Usuário não encontrado ou sem senha');
        }
    }
    catch (error) {
        console.error('❌ Erro ao testar credenciais:', error.message);
    }
    return null;
}
async function main() {
    console.log('🚀 Verificação completa do usuário de produção\n');
    const userExists = await verifyProductionUser();
    if (userExists) {
        const credentials = await testLoginCredentials();
        if (credentials) {
            console.log('\n🎉 USUÁRIO DE TESTE PRONTO PARA USO!');
            console.log('\n📝 Instruções para login manual:');
            console.log('1. Acesse: https://seahorse-app-k5pag.ondigitalocean.app/auth/signin');
            console.log('2. Email: test@example.com');
            console.log('3. Senha: test123');
            console.log('4. Após login, vá para: /dashboard/chat');
        }
        else {
            console.log('\n❌ PROBLEMA COM CREDENCIAIS');
        }
    }
    else {
        console.log('\n❌ FALHA NA CONFIGURAÇÃO DO USUÁRIO');
    }
    await prisma.$disconnect();
}
if (require.main === module) {
    main();
}
export { verifyProductionUser, testLoginCredentials };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5LXByb2R1Y3Rpb24tdXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInZlcmlmeS1wcm9kdWN0aW9uLXVzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQTtBQUN0QyxPQUFPLE1BQU0sTUFBTSxVQUFVLENBQUE7QUFFN0IsS0FBSyxVQUFVLG9CQUFvQjtJQUNqQyxPQUFPLENBQUMsR0FBRyxDQUFDLGtEQUFrRCxDQUFDLENBQUE7SUFFL0QsSUFBSSxDQUFDO1FBQ0gsTUFBTSxTQUFTLEdBQUcsa0JBQWtCLENBQUE7UUFDcEMsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFBO1FBRTlCLGdDQUFnQztRQUNoQyxNQUFNLFlBQVksR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1lBQ2hELEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUU7U0FDNUIsQ0FBQyxDQUFBO1FBRUYsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUNqQixPQUFPLENBQUMsR0FBRyxDQUFDLGdDQUFnQyxDQUFDLENBQUE7WUFDN0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFBO1lBQzlDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtZQUM1QyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7WUFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsWUFBWSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUE7WUFFdEQsb0NBQW9DO1lBQ3BDLElBQUksWUFBWSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUM5QixNQUFNLGVBQWUsR0FBRyxNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxZ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