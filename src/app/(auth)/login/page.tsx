import { LoginForm } from './login-form';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ログイン',
  description: 'Harinessにログインして、ハリネズミの記録を始めましょう。',
};

export default function LoginPage() {
  return <LoginForm />;
}
