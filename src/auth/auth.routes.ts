import { Router } from 'express';
import { register, login, userProfile, updateUserProfile, changeUserPassword } from './auth.controller';
import authenticate from '../middlewares/authenticate';
const authRoutes = Router();

authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.get('/profile', authenticate, userProfile);
authRoutes.patch('/update', authenticate, updateUserProfile);
authRoutes.patch('/change-password', authenticate, changeUserPassword);

export default authRoutes;
