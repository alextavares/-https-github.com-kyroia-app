import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
    testDir: './',
    fullyParallel: false,
    retries: 0,
    workers: 1,
    reporter: 'list',
    use: {
        baseURL: 'http://localhost:3050',
        trace: 'on',
        screenshot: 'on',
        headless: false,
    },
    projects: [
        {
            name: 'chromium',
            use: Object.assign({}, devices['Desktop Chrome']),
        },
    ],
    // Não iniciar servidor - usar o existente
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheXdyaWdodC50ZW1wLmNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBsYXl3cmlnaHQudGVtcC5jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUV6RCxlQUFlLFlBQVksQ0FBQztJQUMxQixPQUFPLEVBQUUsSUFBSTtJQUNiLGFBQWEsRUFBRSxLQUFLO0lBQ3BCLE9BQU8sRUFBRSxDQUFDO0lBQ1YsT0FBTyxFQUFFLENBQUM7SUFDVixRQUFRLEVBQUUsTUFBTTtJQUNoQixHQUFHLEVBQUU7UUFDSCxPQUFPLEVBQUUsdUJBQXVCO1FBQ2hDLEtBQUssRUFBRSxJQUFJO1FBQ1gsVUFBVSxFQUFFLElBQUk7UUFDaEIsUUFBUSxFQUFFLEtBQUs7S0FDaEI7SUFDRCxRQUFRLEVBQUU7UUFDUjtZQUNFLElBQUksRUFBRSxVQUFVO1lBQ2hCLEdBQUcsb0JBQU8sT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUU7U0FDdEM7S0FDRjtJQUNELDBDQUEwQztDQUMzQyxDQUFDLENBQUMifQ==