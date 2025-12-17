import test from 'tape';
import { getMacOSPlatformUUID } from '../../get-actor-machine-identifier.js';
import { PLATFORM_DATA } from '../lib/fixtures.js';
import { childProcessMock } from '../mocks.js';

// Mock child_process module
const mockRequire = (await import('mock-require')).default;
mockRequire('child_process', childProcessMock);

test('getMacOSPlatformUUID should return a valid UUID', async (t) => {
  t.plan(2);
  
  try {
    const uuid = await getMacOSPlatformUUID();
    
    t.equal(
      typeof uuid,
      'string',
      'should return a string'
    );
    
    t.match(
      uuid,
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      'should return a valid UUID format'
    );
  } catch (err) {
    t.fail(`Unexpected error: ${err.message}`);
  } finally {
    // Clean up the mock
    mockRequire.stop('child_process');
  }
});

test('getMacOSPlatformUUID should handle command failure', async (t) => {
  t.plan(1);
  
  // Mock execSync to throw an error
  const originalExecSync = childProcessMock.execSync;
  childProcessMock.execSync = () => { 
    throw new Error('Command failed'); 
  };
  
  try {
    const uuid = await getMacOSPlatformUUID();
    t.equal(
      uuid,
      undefined,
      'should return undefined on command failure'
    );
  } catch (err) {
    t.fail(`Unexpected error: ${err.message}`);
  } finally {
    // Restore original mock
    childProcessMock.execSync = originalExecSync;
  }
});
