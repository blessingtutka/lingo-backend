import { Router } from 'express';
import authenticate from '../middlewares/authenticate';
import * as authController from './auth.controller';
const authRoutes = Router();

authRoutes.post('/login', authController.login);
authRoutes.get('/profile', authenticate, authController.userProfile);
authRoutes.patch('/update', authenticate, authController.updateUserProfile);
authRoutes.patch('/change-password', authenticate, authController.changeUserPassword);
authRoutes.patch('/password-reset-request', authenticate, authController.requestPasswordReset);
authRoutes.patch('/password-reset', authenticate, authController.resetPassword);
authRoutes.patch('/update-security', authenticate, authController.updateUserSecuritySetting);
authRoutes.patch('/update-notification', authenticate, authController.updateUserNotificationSetting);
authRoutes.patch('/send-email-verification', authController.requestEmailVerification);
authRoutes.patch('/verify-email', authController.verifyEmail);

export default authRoutes;
