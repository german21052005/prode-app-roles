
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './src/auth.js';
import matchRoutes from './src/matches.js';
import predictionRoutes from './src/predictions.js';
import scoreRoutes from './src/scores.js';
import userRoutes from './src/users.js';
import { bootstrap } from './src/bootstrap.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => res.json({ ok: true }));

app.use('/auth', authRoutes);
app.use('/matches', matchRoutes);
app.use('/predictions', predictionRoutes);
app.use('/scores', scoreRoutes);
app.use('/users', userRoutes);

const port = process.env.PORT || 3000;

bootstrap().then(() => {
  app.listen(port, () => console.log('Backend running on port', port));
}).catch(err => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
