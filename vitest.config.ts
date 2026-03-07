import tsconfigPaths from 'vite-tsconfig-paths';
import {defineConfig} from 'vitest/config';

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        globals: true,
        clearMocks: true,
        mockReset: true,
        restoreMocks: true,
        environment: 'node',
        projects: [
            {
                extends: true,
                test: {
                    name: 'integration',
                    include: ['./test/**/*.test.ts'],
                    globalSetup: './test/setupIntegrationTest.ts',
                    testTimeout: 30000,
                    fileParallelism: false,
                    env: {
                        DB_TYPE: 'postgres',
                        POSTGRES_IMAGE: 'postgres:18.2-alpine',
                    },
                },
            },
        ],
    },
});
