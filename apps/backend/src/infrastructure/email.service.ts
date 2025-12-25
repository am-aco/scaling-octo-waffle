export interface PasswordResetEmail {
    to: string;
    resetToken: string;
}

export class EmailService {
    constructor(private baseUrl: string) {}

    async sendPasswordResetEmail(data: PasswordResetEmail): Promise<void> {
        const resetUrl = `${this.baseUrl}/reset-password?token=${data.resetToken}`;

        console.log('\n========================================');
        console.log('📧 PASSWORD RESET EMAIL (SIMULATED)');
        console.log('========================================');
        console.log(`To: ${data.to}`);
        console.log(`Subject: Reset Your Password`);
        console.log('');
        console.log('Hello,');
        console.log('');
        console.log('You requested to reset your password. Click the link below to reset it:');
        console.log('');
        console.log(`  ${resetUrl}`);
        console.log('');
        console.log('This link will expire in 1 hour.');
        console.log('');
        console.log('If you did not request this, please ignore this email.');
        console.log('');
        console.log('========================================\n');
    }
}
