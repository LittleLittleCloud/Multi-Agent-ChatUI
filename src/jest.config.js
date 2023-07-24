module.exports = {
    rootDir: "./",
    clearMocks: true,
    coverageDirectory: "coverage",
    collectCoverageFrom: ["src/**/*.ts"],
    coveragePathIgnorePatterns: [
      "/node_modules/",
      "types\\.ts",
      "test\\.ts",
    ],
    globals: {
      'ts-jest': {
        tsConfig: '<rootDir>/tsconfig.test.json',
        diagnostics: {
          exclude: ['**'],
        }
      },
      'window': {},
    },
    testPathIgnorePatterns: ["/node_modules/"],
    testEnvironment: "node",
    setupFilesAfterEnv: ["<rootDir>/test/jest.setup.ts"],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/$1',
      // "react-markdown": "<rootDir>/node_modules/react-markdown/react-markdown.min.js",
      // "micromark-extension-gfm": "<rootDir>/node_modules/micromark-extension-gfm/index.js"
    },
    transform: {
      "^.+\\.tsx?$": ["ts-jest", "<rootDir>/tsconfig.test.json"]
    },
    setupFiles: [
      "fake-indexeddb/auto"
    ],
    testTimeout: 60000,
  };