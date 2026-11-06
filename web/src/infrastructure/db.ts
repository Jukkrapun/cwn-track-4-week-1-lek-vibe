// PostgreSQL pool แบบ lazy — ไม่ต่อฐานข้อมูลตอน build
import { Pool, type PoolClient, type QueryResultRow } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error('DATABASE_URL is not configured');
    pool = new Pool({ connectionString, max: 10, connectionTimeoutMillis: 3000, idleTimeoutMillis: 30000 });
    pool.on('error', () => undefined);
  }
  return pool;
}

export type Queryable = Pick<PoolClient, 'query'>;

export async function query<T extends QueryResultRow>(sql: string, params: unknown[] = [], db: Queryable = getPool()): Promise<T[]> {
  const res = await db.query<T>(sql, params);
  return res.rows;
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}
