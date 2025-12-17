import test from 'tape';
import { getWindowsMachineGUIDFromRegistry } from '../../get-actor-machine-identifier.js';
import { PLATFORM_DATA } from '../fixtures.js';
import { childProcessMock } from '../mocks.js';

// Mock child_process module
const mockRequire = (await import('mock-require')).default;

// Mock the child_process module
mockRequire('child_process', childProcessMock);

test('getWindowsMachineGUIDFromRegistry should return a valid GUID', async (t) => {
  t.plan(2);
  
  try {
    const guid = await getWindowsMachineGUIDFromRegistry();
    
    t.equal(
      typeof guid,
      'string',
      'should return a string'
    );
    
    t.match(
      guid,
      /^\{[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\}$/i,
      'should return a valid GUID format'
    );
  } catch (err) {
    t.fail(`Unexpected error: ${err.message}`);
  } finally {
    // Clean up the mock
    mockRequire.stop('child_process');
  }
});

test('getWindowsMachineGUIDFromRegistry should handle command failure', async (t) => {
  t.plan(1);
  
  // Mock execSync to throw an error
  const originalExecSync = childProcessMock.execSync;
  childProcessMock.execSync = () => { 
    throw new Error('Command failed'); 
  };
  
  try {
    const guid = await getWindowsMachineGUIDFromRegistry();
    t.equal(
      guid,
      '',
      'should return empty string on command failure'
    );
  } catch (err) {
    t.fail(`Unexpected error: ${err.message}`);
  } finally {
    // Restore original mock
    childProcessMock.execSync = originalExecSync;
  }
});
