type VersionString = `${number}.${number}.${number}`;
const VERSION_MAJOR = 1;
const VERSION_MINOR = 1;
const VERSION_PATCH = 1;
export const gameBackendVersion: VersionString = `${VERSION_MAJOR}.${VERSION_MINOR}.${VERSION_PATCH}`;
export const GAME_NAME = 'Paima Launchpad';
export const PRACTICE_BOT_ADDRESS = '0x0';
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export * from './types.js';
