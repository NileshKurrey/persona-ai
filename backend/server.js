import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatRouter from './src/routes/chat.route.js';

const app = express();
const PORT = process.env.PORT || 8080;
app.use(cors({origin: '*'}));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api', chatRouter);

app.listen(PORT, () => {
  console.log(`Chai Persona Bot backend running on http://localhost:${PORT}`);
});
