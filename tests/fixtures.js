// Test data for hash computation
const TEST_STRINGS = {
  EMPTY: '',
  SIMPLE: 'test',
  SPECIAL_CHARS: 'test!@#$%^&*()_+{}|:"<>?',
  UNICODE: '测试 🚀',
  LONG: 'a'.repeat(10000)
};

// Expected results for known inputs
const EXPECTED_RESULTS = {
  SHA256_EMPTY: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  SHA256_TEST: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
  BASE36_0: '0',
  BASE36_35: 'z',
  BASE36_36: '10',
  BASE36_1295: 'zz',
  UUID_REGEX: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  IDENTIFIER_REGEX: /^[a-z0-9]{3}-[a-z0-9]{6}-[a-z0-9]{9}$/i
};

// Platform-specific test data
const PLATFORM_DATA = {
  WINDOWS: {
    REGISTRY_OUTPUT: '    MachineGuid    REG_SZ    {12345678-1234-5678-9012-345678901234}',
    EXPECTED_ID: '12345678-1234-5678-9012-345678901234'
  },
  LINUX: {
    MACHINE_ID: 'a1b2c3d4e5f6g7h8i9j0',
    EXPECTED_ID: 'a1b2c3d4e5f6g7h8i9j0'
  },
  MACOS: {
    IOREG_OUTPUT: '    "IOPlatformUUID" = "12345678-1234-5678-9012-345678901234"',
    EXPECTED_UUID: '12345678-1234-5678-9012-345678901234'
  }
};

module.exports = {
  TEST_STRINGS,
  EXPECTED_RESULTS,
  PLATFORM_DATA
};
