// Mock for Node.js crypto
const cryptoMock = {
  createHash: () => ({
    update: () => ({
      digest: () => Buffer.from('test-hash')
    })
  }),
  randomUUID: () => 'mocked-uuid-1234-5678-9012-345678901234'
};

// Mock for fs module
const fsMock = {
  promises: {
    readFile: async () => 'mocked-machine-id\n'
  }
};

// Mock for child_process
const childProcessMock = {
  execSync: (command) => {
    if (command.includes('reg query')) {
      return '    MachineGuid    REG_SZ    {mocked-windows-guid}';
    }
    if (command.includes('ioreg')) {
      return 'IOPlatformUUID = "mocked-macos-uuid"';
    }
    return '';
  }
};

// Mock for browser environment
const browserMocks = {
  window: {
    crypto: {
      subtle: {
        digest: async () => new Uint8Array([116, 101, 115, 116, 45, 104, 97, 115, 104])
      },
      getRandomValues: (arr) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      },
      randomUUID: () => 'mocked-browser-uuid-1234-5678-9012-345678901234'
    },
    navigator: {
      userAgent: 'Mozilla/5.0 (mocked) TestBrowser/1.0',
      language: 'en-US',
      userAgentData: {
        platform: 'TestOS'
      }
    },
    screen: {
      width: 1920,
      height: 1080,
      colorDepth: 24
    }
  }
};

module.exports = {
  cryptoMock,
  fsMock,
  childProcessMock,
  browserMocks
};
