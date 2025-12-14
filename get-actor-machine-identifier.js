#!/usr/bin/env node

/**
 * Cross-platform actor machine identifier generator
 * Generates a unique 3-6-9 base36 identifier based on machine characteristics
 * Works in both Node.js (LTS) and modern browsers
 */

/**
 * Get crypto implementation based on environment
 * @returns {Promise<Crypto|typeof import('crypto')>}
 */
async function getCryptographyProvider() {
  // Browser: Web Crypto API
  if (typeof window !== "undefined" && window.crypto) {
    return window.crypto;
  }

  // Node.js: built-in crypto module
  if (typeof process !== "undefined" && process.versions?.node) {
    const cryptoModule = await import("crypto");

    // Node.js crypto module doesn't have a default export in ESM
    return cryptoModule.default || cryptoModule;
  }

  throw new Error("No crypto implementation available");
}

/**
 * Create SHA-256 hash of a string (cross-platform)
 * @param {string} str - String to hash
 * @returns {Promise<Uint8Array>} Hash bytes
 */
async function computeSHA256Hash(inputString) {
  const cryptoProvider = await getCryptographyProvider();
  
  // Browser: Web Crypto API
  if (cryptoProvider.subtle && typeof cryptoProvider.subtle.digest === "function") {
    const textEncoder = new TextEncoder();
    const encodedData = textEncoder.encode(inputString);
    const hashedBuffer = await cryptoProvider.subtle.digest("SHA-256", encodedData);
    return new Uint8Array(hashedBuffer);
  }
  
  // Node.js: crypto module
  if (cryptoProvider.createHash) {
    const hash = cryptoProvider.createHash("sha256").update(inputString).digest();
    return new Uint8Array(hash);
  }
  
  throw new Error("SHA-256 not available");
}

/**
 * Generate UUID (cross-platform)
 * @returns {Promise<string>} UUID string
 */
async function generateRandomUUID() {
  const crypto = await getCryptographyProvider();
  
  // Browser: Web Crypto API
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Node.js: crypto module
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback: manual UUID generation
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const randomValue = (Math.random() * 16) | 0;
    const uuidByteValue = character === "x" ? randomValue : (randomValue & 0x3) | 0x8;
    return uuidByteValue.toString(16);
  });
}

/**
 * Convert BigInt to base36 string with fixed length
 * @param {bigint} num - Number to convert
 * @param {number} length - Desired output length
 * @returns {string} Base36 string
 */
function convertToBase36String(inputNumber, outputLength) {
  const base36Characters = "0123456789abcdefghijklmnopqrstuvwxyz";

  let encodedResult = "";
  while (inputNumber > 0) {
    const remainder = inputNumber % 36n;
    encodedResult = base36Characters[Number(remainder)] + encodedResult;
    inputNumber = inputNumber / 36n;
  }

  return encodedResult.padStart(outputLength, "0");
}

/**
 * Convert string to BigInt via SHA-256 hash
 * @param {string} str - String to convert
 * @returns {Promise<bigint>} Numeric representation
 */
async function convertStringToBigIntViaHash(inputString) {
  const hashedValue = await computeSHA256Hash(inputString);

  let resultNumber = 0n;
  for (const currentByte of hashedValue) {
    resultNumber = (resultNumber << 8n) + BigInt(currentByte);
  }

  return resultNumber;
}

/**
 * Get Windows machine identifier from registry
 * @returns {Promise<string>} Windows machine GUID
 */
async function getWindowsMachineGUIDFromRegistry() {
  const { execSync } = await import("child_process");

  const out = execSync(
    'reg query HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography /v MachineGuid'
  ).toString();

  return out.split(/\s+/).pop() || "";
}

/**
 * Get Linux machine identifier from /etc/machine-id
 * @returns {Promise<string>} Linux machine ID
 */
async function getLinuxMachineIDFromFile() {
  const fileSystem = await import("fs");

  const machineIdentifier = await fileSystem.promises.readFile("/etc/machine-id", "utf-8");

  return machineIdentifier.trim();
}

/**
 * Get macOS machine identifier from ioreg
 * @returns {Promise<string>} macOS platform UUID
 */
async function getMacOSPlatformUUID() {
  const { execSync: executeCommandSync } = await import("child_process");

  const commandOutput = executeCommandSync("ioreg -rd1 -c IOPlatformExpertDevice | grep IOPlatformUUID").toString();
  
  return commandOutput.split('"').slice(-2)[0];
}

/**
 * Get browser machine identifier from navigator and screen properties
 * @returns {string} Browser-based machine identifier
 */
function generateBrowserFingerprint() {
  const navigator = window.navigator;
  const browserScreen = window.screen;

  // Use modern User-Agent Client Hints API if available, fallback to userAgent parsing
  const operatingSystemPlatform = navigator.userAgentData?.platform || 
                                (navigator.userAgent.match(/\(([^)]+)\)/) || [])[1] || 
                                "unknown";
  return [
    navigator.userAgent,
    operatingSystemPlatform,
    navigator.language,
    browserScreen.width,
    browserScreen.height,
    browserScreen.colorDepth,
    new Date().getTimezoneOffset(),
  ].join("|");
}

/**
 * Get machine-specific identifier string
 * Routes to platform-specific implementation
 * @returns {Promise<string>} Machine identifier
 */
async function getMachineSpecificIdentifier() {
  const isNode = typeof process !== "undefined" && process.versions?.node;

  if (isNode) {
    const os = process.platform;
    if (os === "win32") {
      return await getWindowsMachineId();
    } else if (os === "linux") {
      return await getLinuxMachineId();
    } else if (os === "darwin") {
      return await getMacOSMachineId();
    }
  } else if (typeof window !== "undefined") {
    return getBrowserMachineId();
  }

  throw new Error("Cannot determine machine identifier");
}

/**
 * Generate a unique actor machine identifier
 * Format: 3-6-9 base36 segments (random-machine-guid)
 * @returns {Promise<string>} Actor machine identifier
 */
export async function generateActorMachineIdentifier() {
  const random3 = BigInt(Math.floor(Math.random() * 36 ** 3));
  const machineIdentifierString = await getMachineSpecificIdentifier();
  const machineIdentifierNumeric = (await convertStringToBigIntViaHash(machineIdentifierString)) % 36n ** 6n;
  const uniqueIdentifier = await generateRandomUUID();
  const uniqueIdentifierNumeric = (await convertStringToBigIntViaHash(uniqueIdentifier)) % 36n ** 9n;

  const random3Base36 = convertBigIntToBase36String(random3, 3);
  const machine6Base36 = convertBigIntToBase36String(machineIdentifierNumeric, 6);
  const guid9Base36 = convertBigIntToBase36String(uniqueIdentifierNumeric, 9);

  const identifierSegments = [random3Base36, machine6Base36, guid9Base36];
  identifierSegments.sort(() => Math.random() - 0.5);

  return identifierSegments.join("-");
}
