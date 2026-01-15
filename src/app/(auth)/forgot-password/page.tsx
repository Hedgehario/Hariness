import { type Metadata } from 'next';

import { ForgotPasswordForm } from './forgot-password-form';

export const metadata: Metadata = {
  title: 'パスワードをお忘れの方',
  description: 'パスワードリセット用のメールを送信します。',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
