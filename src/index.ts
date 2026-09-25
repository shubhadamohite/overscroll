import express, {Express, Request, Response, NextFunction} from 'express';
import userRoutes from './routes/users';
import pool from './config/database';

const app:Express = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

//Uptime endpoint for health check
app.get('/health', async (_req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('Health check DB query failed:', err);
    res.status(503).json({ status: 'error', db: 'disconnected', timestamp: new Date().toISOString() });
  }
});


app.use('/users', userRoutes);

// Central error handler — must be registered last, and must take exactly
// 4 args so Express recognizes it as an error handler (not regular middleware).
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: 'Malformed JSON in request body' });
    return;
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

//listen on port 3000
app.listen(PORT, ()=>{
    console.log(`server running at http://localhost:${PORT}`);
});