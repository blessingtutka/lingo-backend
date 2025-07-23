type CallStatus = 'REQUESTING' | 'ONGOING' | 'MISSED' | 'REJECTED' | 'ENDED';

interface CreateUserInput {
    name: string;
    email: string;
    password: string;
}

interface UpdateUserInput {
    name?: string;
    email?: string;
}

interface ChangePasswordInput {
    userId: string;
    currentPassword: string;
    newPassword: string;
}

interface ResetPasswordInput {
    email: string;
    token: string;
    newPassword: string;
}
