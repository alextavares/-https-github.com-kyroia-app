const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    testMatch: ['<rootDir>/tests/**/*.test.(ts|tsx|js)'],
    setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
    },
    clearMocks: true,
    restoreMocks: true,
    verbose: true,
    // Silencia warnings de ESM de next/edge em ambiente de testes Node
    transformIgnorePatterns: ['/node_modules/'],
};
export default config;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiamVzdC5jb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJqZXN0LmNvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxNQUFNLE1BQU0sR0FBVztJQUNyQixNQUFNLEVBQUUsU0FBUztJQUNqQixlQUFlLEVBQUUsTUFBTTtJQUN2QixLQUFLLEVBQUUsQ0FBQyxXQUFXLENBQUM7SUFDcEIsb0JBQW9CLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDO0lBQ3hELFNBQVMsRUFBRSxDQUFDLHVDQUF1QyxDQUFDO0lBQ3BELGtCQUFrQixFQUFFLENBQUMsK0JBQStCLENBQUM7SUFDckQsZ0JBQWdCLEVBQUU7UUFDaEIsVUFBVSxFQUFFLGNBQWM7S0FDM0I7SUFDRCxTQUFTLEVBQUU7UUFDVCxpQkFBaUIsRUFBRSxDQUFDLFNBQVMsRUFBRSxFQUFFLFFBQVEsRUFBRSx5QkFBeUIsRUFBRSxDQUFDO0tBQ3hFO0lBQ0QsVUFBVSxFQUFFLElBQUk7SUFDaEIsWUFBWSxFQUFFLElBQUk7SUFDbEIsT0FBTyxFQUFFLElBQUk7SUFDYixtRUFBbUU7SUFDbkUsdUJBQXVCLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztDQUM1QyxDQUFBO0FBRUQsZUFBZSxNQUFNLENBQUEifQ==