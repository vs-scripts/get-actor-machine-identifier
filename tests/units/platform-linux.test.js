import test from 'tape';
import { getLinuxMachineIDFromFile } from '../../get-actor-machine-identifier.js';
import { fsMock } from '../lib/mocks.js';

// Mock fs module
const mockRequire = (await import('mock-require')).default;
mockRequire('fs', fsMock);

test('getLinuxMachineIDFromFile should return a valid machine ID', async (t) => {
  t.plan(2);
  
  try {
    const machineId = await getLinuxMachineIDFromFile();
    
    t.equal(
      typeof machineId,
      'string',
      'should return a string'
    );
    
    t.match(
      machineId,
      /^[a-f0-9]+$/,
      'should return a valid machine ID (hex characters only)'
    );
  } catch (err) {
    t.fail(`Unexpected error: ${err.message}`);
  } finally {
    // Clean up the mock
    mockRequire.stop('fs');
  }
});

test('getLinuxMachineIDFromFile should handle file read errors', async (t) => {
  t.plan(1);
  
  // Mock readFile to throw an error
  const originalReadFile = fsMock.promises.readFile;
  fsMock.promises.readFile = async () => { 
    throw new Error('File not found'); 
  };
  
  try {
    const machineId = await getLinuxMachineIDFromFile();
    t.equal(
      machineId,
      '',
      'should return empty string on file read error'
    );
  } catch (err) {
    t.fail(`Unexpected error: ${err.message}`);
  } finally {
    // Restore original mock
    fsMock.promises.readFile = originalReadFile;
  }
});
