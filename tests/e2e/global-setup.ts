import { chromium, FullConfig } from '@playwright/test';
import { mockUsers } from '../fixtures/auth.fixtures';

async function globalSetup(config: FullConfig) {
  // Create test database entries if needed
  console.log('🔧 Setting up test environment...');
  
  // You can add database seeding here if needed
  // For now, we're using mocks
  
  // Store auth state for reuse
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const baseUrl = process.env.BASE_URL || 'http://localhost:3025'
  // Navigate to login and create authenticated state
  await page.goto(`${baseUrl}/auth/signin`);
  
  // If using real auth, login here and save state
  // For mocks, we'll handle it in individual tests
  
  await browser.close();
  
  console.log('✅ Test environment ready!');
}

export default globalSetup;