import { Router } from 'express';
import authenticate from '../../middlewares/authenticate';
import * as authController from './auth.controller';
const authRoutes = Router();

authRoutes.post('/login', authController.login);
authRoutes.get('/profile', authenticate, authController.userProfile);
authRoutes.put('/update', authenticate, authController.updateUserProfile);
authRoutes.patch('/change-password', authenticate, authController.changeUserPassword);
authRoutes.post('/password-reset-request', authController.requestPasswordReset);
authRoutes.post('/password-reset', authController.resetPassword);
authRoutes.put('/update-security', authenticate, authController.updateUserSecuritySetting);
authRoutes.put('/update-notification', authenticate, authController.updateUserNotificationSetting);
authRoutes.post('/email-verification-request', authenticate, authController.requestEmailVerification);
authRoutes.get('/verify-email', authController.verifyEmail);

export default authRoutes;
