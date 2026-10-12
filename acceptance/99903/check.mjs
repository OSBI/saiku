import { existsSync } from 'node:fs';
const marker = new URL('../../docs/throwaway-proof-marker.md', import.meta.url);
if (!existsSync(marker)) {
  console.error('marker missing');
  process.exit(1);
}
console.log('marker present');
