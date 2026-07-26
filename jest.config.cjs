/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: "node",
    roots: ["<rootDir>/tests"],
    transform: {
        "^.+\\.ts$": ["@swc/jest"]
    },
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1"
    },
    collectCoverageFrom: [
        "src/**/*.ts",
        "!src/server/server.ts",
        "!src/server/bootstrap.ts",
        "!src/connections/**/*.ts",
        "!src/types/**/*.d.ts"
    ],
    coverageDirectory: "coverage",
    clearMocks: true
};
