import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import bodyParser from 'body-parser';
import authRoutes from './modules/auth/auth.routes';
import callRoutes from './modules/call/call.routes';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/call', callRoutes);

//Not Found Routes
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});
export default app;
