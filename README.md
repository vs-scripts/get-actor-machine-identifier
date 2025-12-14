# get-actor-machine-identifier

A cross-platform JavaScript library to generate unique actor machine identifiers. Works in both Node.js (LTS 18+) and modern browsers.

## Features

- 🌐 **Cross-platform**: Works in Node.js and browsers
- 🔒 **Cryptographically secure**: Uses SHA-256 hashing
- 📦 **ESM only**: Modern JavaScript module format
- 🎯 **Unique identifiers**: 3-6-9 base36 format

## Installation

```bash
npm install get-actor-machine-identifier
```

## Usage

### Node.js

```javascript
import { getActorMachineIdentifier } from 'get-actor-machine-identifier';

const identifier = await getActorMachineIdentifier();
console.log(identifier); // e.g., "a3f-2k9m1x-7n8p4q2r5"
```

### Browser

```javascript
import { getActorMachineIdentifier } from './get-actor-machine-identifier.js';

const identifier = await getActorMachineIdentifier();
console.log(identifier);
```

## Output Format

The identifier uses a 3-6-9 base36 format:
- **3 characters**: Random component
- **6 characters**: Machine-based component (derived from machine ID)
- **9 characters**: GUID-based component (derived from UUID)

Example: `a3f-2k9m1x-7n8p4q2r5`

## Requirements

- Node.js: LTS 18.0.0 or higher
- Browser: Modern browser with Web Crypto API support

## License

MIT

