import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    globalSetup: require.resolve('./tests/e2e/global-setup.ts'),
    use: {
        baseURL: process.env.BASE_URL || 'http://localhost:3025',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        headless: true,
        // Add extra HTTP headers for testing
        extraHTTPHeaders: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    },
    projects: [
        {
            name: 'chromium',
            use: Object.assign({}, devices['Desktop Chrome']),
        },
    ],
    webServer: undefined,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheXdyaWdodC5jb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwbGF5d3JpZ2h0LmNvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRXpELGVBQWUsWUFBWSxDQUFDO0lBQzFCLE9BQU8sRUFBRSxhQUFhO0lBQ3RCLGFBQWEsRUFBRSxJQUFJO0lBQ25CLFVBQVUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0lBQzVCLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9CLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO0lBQ3ZDLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLFdBQVcsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLDZCQUE2QixDQUFDO0lBQzNELEdBQUcsRUFBRTtRQUNILE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSx1QkFBdUI7UUFDeEQsS0FBSyxFQUFFLGdCQUFnQjtRQUN2QixVQUFVLEVBQUUsaUJBQWlCO1FBQzdCLFFBQVEsRUFBRSxJQUFJO1FBQ2QscUNBQXFDO1FBQ3JDLGdCQUFnQixFQUFFO1lBQ2hCLFFBQVEsRUFBRSxrQkFBa0I7WUFDNUIsY0FBYyxFQUFFLGtCQUFrQjtTQUNuQztLQUNGO0lBQ0QsUUFBUSxFQUFFO1FBQ1I7WUFDRSxJQUFJLEVBQUUsVUFBVTtZQUNoQixHQUFHLG9CQUFPLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFFO1NBQ3RDO0tBQ0Y7SUFDRCxTQUFTLEVBQUUsU0FBUztDQUNyQixDQUFDLENBQUMifQ==