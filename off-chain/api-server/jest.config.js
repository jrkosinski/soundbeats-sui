module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir:
    "/Users/taralgurung/Desktop/Soundbeats/soundbeats-sui/off-chain/api-server/src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",

  // Add custom module name mapping here
  moduleNameMapper: {
    "^sui-monorepo$": "<rootDir>/sui/package.json",
    "^kite$": "<rootDir>/.atom/packages/kite/package.json",
    // Add additional mappings for other conflicting modules
  },
};
