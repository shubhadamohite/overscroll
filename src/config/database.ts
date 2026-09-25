import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
'postgresql://screentime_user:screentime_pass@localhost:5432/screentime_db'
}); 

pool.on('error' ,(err: Error) => {
    console.error('Unexpected error on idle client', err);
});

export default pool;