import { type Metadata } from 'next';

import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'ログイン',
  description: 'Harinessにログインして、ハリネズミの記録を始めましょう。',
};

export default function LoginPage() {
  return <LoginForm />;
}
