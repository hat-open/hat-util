import type { Config } from 'jest';


const config: Config = {
    testEnvironment: 'jsdom',
    preset: 'ts-jest',
    extensionsToTreatAsEsm: ['.ts']
};

export default config;
