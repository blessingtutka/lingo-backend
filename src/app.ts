import express, { Application } from 'express';
import cors from 'cors';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

//Not Found Routes
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});
export default app;
