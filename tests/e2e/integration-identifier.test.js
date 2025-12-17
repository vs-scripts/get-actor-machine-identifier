import test from 'tape';
import { generateActorMachineIdentifier } from '../../get-actor-machine-identifier.js';
import { EXPECTED_RESULTS } from '../lib/fixtures.js';

// Mock the platform-specific functions
const mockRequire = (await import('mock-require')).default;
const { fsMock, childProcessMock, browserMocks } = await import('../mocks.js');

// Setup environment based on test context
function setupEnvironment(platform) {
  // Clear all mocks first
  mockRequire.stopAll();
  
  // Mock process and window based on platform
  if (platform === 'browser') {
    global.window = browserMocks.window;
    global.navigator = browserMocks.window.navigator;
    global.screen = browserMocks.window.screen;
    global.process = undefined;
  } else {
    // Node.js environment
    global.process = {
      versions: { node: '18.0.0' },
      platform: platform
    };
    global.window = undefined;
    
    // Platform-specific mocks
    mockRequire('fs', fsMock);
    mockRequire('child_process', childProcessMock);
  }
}

// Test the main export function
test('generateActorMachineIdentifier should return a valid identifier', async (t) => {
  t.plan(6); // 2 assertions per platform
  
  const platforms = ['win32', 'linux', 'darwin'];
  
  for (const platform of platforms) {
    setupEnvironment(platform);
    
    try {
      const identifier = await generateActorMachineIdentifier();
      
      t.equal(
        typeof identifier,
        'string',
        `[${platform}] should return a string`
      );
      
      t.match(
        identifier,
        EXPECTED_RESULTS.IDENTIFIER_REGEX,
        `[${platform}] should match the expected format`
      );
    } catch (err) {
      t.fail(`[${platform}] Unexpected error: ${err.message}`);
    }
  }
});

// Test browser environment
test('generateActorMachineIdentifier should work in browser environment', async (t) => {
  t.plan(2);
  
  setupEnvironment('browser');
  
  try {
    const identifier = await generateActorMachineIdentifier();
    
    t.equal(
      typeof identifier,
      'string',
      'should return a string in browser environment'
    );
    
    t.match(
      identifier,
      EXPECTED_RESULTS.IDENTIFIER_REGEX,
      'should match the expected format in browser environment'
    );
  } catch (err) {
    t.fail(`Unexpected error in browser test: ${err.message}`);
  }
});

// Test error handling
test('generateActorMachineIdentifier should handle platform detection failure', async (t) => {
  t.plan(1);
  
  // Simulate an unsupported environment
  global.process = undefined;
  global.window = undefined;
  
  try {
    await generateActorMachineIdentifier();
    t.fail('should throw an error for unsupported environment');
  } catch (err) {
    t.equal(
      err.message,
      'Cannot determine machine identifier',
      'should throw expected error for unsupported environment'
    );
  }
});

// Clean up after all tests
test.onFinish(() => {
  // Clean up mocks
  mockRequire.stopAll();
  
  // Clean up globals
  global.window = undefined;
  global.navigator = undefined;
  global.screen = undefined;
  global.process = undefined;
});
