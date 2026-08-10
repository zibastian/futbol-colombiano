// Engancha el resolutor para que `node` pueda importar los .ts de src/data/.
import { register } from 'node:module';
register('./resolver-ts.mjs', import.meta.url);
