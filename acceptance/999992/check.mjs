import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const marker = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'THROWAWAY_MARKER.txt');
if (!existsSync(marker)) { process.stderr.write('THROWAWAY_MARKER.txt is missing\n'); process.exit(1); }
