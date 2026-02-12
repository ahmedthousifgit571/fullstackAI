import express from 'express';
import type { Request, Response } from 'express';
import { handleChat } from './controllers/chat.controller';

const router = express.Router();
router.get('/', (req: Request, res: Response) => {
   res.send('FullStack AI Server is running');
});

router.post('/api/chat', handleChat);

router.get('/api/hello', (req: Request, res: Response) => {
   res.json({ message: 'hello world 2' });
});

export default router;
