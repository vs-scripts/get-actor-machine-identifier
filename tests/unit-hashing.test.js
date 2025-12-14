import test from 'tape';
import { computeSHA256Hash, convertToBase36String, convertStringToBigIntViaHash } from '../get-actor-machine-identifier.js';
import { TEST_STRINGS, EXPECTED_RESULTS } from './fixtures.js';

// Test computeSHA256Hash
test('computeSHA256Hash should produce correct hash for known inputs', async (t) => {
  t.plan(2);
  
  try {
    // Test with empty string
    const emptyHash = await computeSHA256Hash(TEST_STRINGS.EMPTY);
    t.equal(
      Buffer.from(emptyHash).toString('hex'),
      EXPECTED_RESULTS.SHA256_EMPTY,
      'should produce correct hash for empty string'
    );

    // Test with known input
    const testHash = await computeSHA256Hash(TEST_STRINGS.SIMPLE);
    t.equal(
      Buffer.from(testHash).toString('hex'),
      EXPECTED_RESULTS.SHA256_TEST,
      'should produce correct hash for "test" string'
    );
  } catch (err) {
    t.fail(`Unexpected error: ${err.message}`);
  }
});

// Test convertToBase36String
test('convertToBase36String should convert numbers correctly', (t) => {
  t.plan(4);
  
  t.equal(
    convertToBase36String(0n, 1),
    '0',
    'should convert 0 to "0"'
  );
  
  t.equal(
    convertToBase36String(35n, 1),
    'z',
    'should convert 35 to "z"'
  );
  
  t.equal(
    convertToBase36String(36n, 2),
    '10',
    'should convert 36 to "10"'
  );
  
  t.equal(
    convertToBase36String(1295n, 2),
    'zz',
    'should convert 1295 to "zz"'
  );
});

// Test convertStringToBigIntViaHash
test('convertStringToBigIntViaHash should be deterministic', async (t) => {
  t.plan(1);
  
  try {
    const result1 = await convertStringToBigIntViaHash(TEST_STRINGS.SIMPLE);
    const result2 = await convertStringToBigIntViaHash(TEST_STRINGS.SIMPLE);
    
    t.equal(
      result1.toString(),
      result2.toString(),
      'should produce same output for same input'
    );
  } catch (err) {
    t.fail(`Unexpected error: ${err.message}`);
  }
});

// Test error handling
test('computeSHA256Hash should handle errors', async (t) => {
  t.plan(1);
  
  // Mock crypto to throw an error
  const originalCrypto = globalThis.crypto;
  globalThis.crypto = null;
  
  try {
    // This should trigger the Node.js crypto fallback
    const hash = await computeSHA256Hash(TEST_STRINGS.SIMPLE);
    t.ok(hash instanceof Uint8Array, 'should handle missing crypto.subtle');
  } catch (err) {
    t.fail(`Unexpected error: ${err.message}`);
  } finally {
    // Restore original crypto
    globalThis.crypto = originalCrypto;
  }
});
