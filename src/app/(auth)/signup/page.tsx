import { SignupForm } from "./signup-form";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "新規登録",
  description: "Harinessアカウントを作成して、ハリネズミの健康管理を始めましょう。",
};

export default function SignupPage() {
  return <SignupForm />;
}
