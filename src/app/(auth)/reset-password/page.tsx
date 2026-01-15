import { type Metadata } from 'next';

import { ResetPasswordForm } from './reset-password-form';

export const metadata: Metadata = {
  title: 'パスワードの再設定',
  description: '新しいパスワードを設定してください。',
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
