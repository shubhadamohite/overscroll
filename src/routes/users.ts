import pool from '../config/database';
import { Request, Response, Router } from 'express';
import { z } from 'zod';

const router = Router();

const userSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.email(),
    created_at: z.coerce.date(),
});

type User = z.infer<typeof userSchema>;

const createUserSchema = z.object({
    name: z.string().min(1, 'name is required'),
    email: z.email('email must be a valid email address'),
});

const loginRequestSchema = z.object({
    email: z.email('email must be a valid email address'),
    password: z.string().min(1, 'password is required'),
});

const signupRequestSchema = z.object({
    name: z.string().min(1, 'name is required'),
    email: z.email('email must be a valid email address'),
    password: z.string().min(1, 'password is required'),
});

const tokenPayloadSchema = z.object({
    userId: z.number(),
    email: z.email(),
});

const authResponseSchema = z.object({
    token: z.string(),
    user: userSchema,
});

type CreateUserRequest = z.infer<typeof createUserSchema>;
type LoginRequest = z.infer<typeof loginRequestSchema>;

interface ErrorResponse {
    error: string;
}

// GET all users
router.get('/', async (req:Request, res:Response<User[] | ErrorResponse>) => {
    try {
        const result = await pool.query<User>('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST a new user
router.post('/', async (req:Request<{}, User | ErrorResponse, CreateUserRequest>, res:Response<User | ErrorResponse>) => {
    const parseResult = createUserSchema.safeParse(req.body);
    if (!parseResult.success) {
        res.status(400).json({ error: parseResult.error.issues.map(issue => issue.message).join(', ') });
        return;
    }
    const { name, email } = parseResult.data;
    try {
        const result = await pool.query<User>(
            'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
            [name, email]
        );
        res.status(201).json(result.rows[0]);
    }   catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;