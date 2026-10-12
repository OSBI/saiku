import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const marker = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'docs', 'throwaway-proof-marker.md');
if (!existsSync(marker)) {
  console.error('docs/throwaway-proof-marker.md is missing');
  process.exit(1);
}
console.log('marker present');
