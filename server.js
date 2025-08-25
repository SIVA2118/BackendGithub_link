import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/users.js';

dotenv.config();
const app = express();


app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));


connectDB();

app.get('/', (req, res) => res.send({ status: 'OK', message: 'Backend running' }));


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
