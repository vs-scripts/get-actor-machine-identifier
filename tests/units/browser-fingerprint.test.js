import test from 'tape';
import { generateBrowserFingerprint } from '../../get-actor-machine-identifier.js';
import { browserMocks } from '../lib/mocks.js';

// Save original globals
const originalWindow = global.window;
const originalNavigator = global.navigator;
const originalScreen = global.screen;

// Setup browser environment
global.window = browserMocks.window;
global.navigator = browserMocks.window.navigator;
global.screen = browserMocks.window.screen;

test('generateBrowserFingerprint should return a non-empty string', (t) => {
  t.plan(2);
  
  try {
    const fingerprint = generateBrowserFingerprint();
    
    t.equal(
      typeof fingerprint,
      'string',
      'should return a string'
    );
    
    t.true(
      fingerprint.length > 0,
      'should return a non-empty string'
    );
  } catch (err) {
    t.fail(`Unexpected error: ${err.message}`);
  }
});

test('generateBrowserFingerprint should include browser and OS information', (t) => {
  t.plan(1);
  
  try {
    const fingerprint = generateBrowserFingerprint();
    const parts = fingerprint.split('|');
    
    t.equal(
      parts.length,
      7,
      'should include all fingerprint components'
    );
  } catch (err) {
    t.fail(`Unexpected error: ${err.message}`);
  }
});

test('generateBrowserFingerprint should handle missing userAgentData', (t) => {
  t.plan(1);
  
  // Save original
  const originalUserAgentData = global.navigator.userAgentData;
  delete global.navigator.userAgentData;
  
  try {
    const fingerprint = generateBrowserFingerprint();
    t.pass('should handle missing userAgentData');
  } catch (err) {
    t.fail(`Unexpected error: ${err.message}`);
  } finally {
    // Restore
    global.navigator.userAgentData = originalUserAgentData;
  }
});

// Clean up after tests
test.onFinish(() => {
  global.window = originalWindow;
  global.navigator = originalNavigator;
  global.screen = originalScreen;
});
