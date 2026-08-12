import { pool } from '../src/connections/postgres.js';
import fs from 'fs';
import path from 'path';

const migrationDir = "./migrations";

const files: string[] = fs.readdirSync(migrationDir)
    .filter((file: string) => file.endsWith('.sql'))
    .sort();

for (const file of files) {
    const sql: string = fs.readFileSync(path.join(migrationDir, file), 'utf-8');
    console.log(`Running: ${file}`);

    await pool.query(sql);
    console.log(`Done: ${file}`);
}

await pool.end();