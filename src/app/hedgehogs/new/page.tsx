"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createHedgehog } from "@/app/(main)/hedgehogs/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const initialState = {
  error: "",
  success: false as boolean | string,
};

export default function NewHedgehogPage() {
  const router = useRouter();
  const [state, action, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    const data = {
      name: formData.get("name") as string,
      gender: (formData.get("gender") as "male" | "female" | "unknown") || undefined,
      birthDate: (formData.get("birthDate") as string) || undefined,
      welcomeDate: (formData.get("welcomeDate") as string) || undefined,
      features: (formData.get("features") as string) || undefined,
      insuranceNumber: (formData.get("insuranceNumber") as string) || undefined,
    };

    const result = await createHedgehog(data);

    if (result.error) {
      return { ...prevState, error: result.error, success: false };
    }

    return { ...prevState, error: "", success: true };
  }, initialState);

  useEffect(() => {
    if (state.success) {
      router.push("/home");
    }
  }, [state.success, router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[var(--color-background)]">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="text-center">
          <div className="mx-auto bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full p-3 w-16 h-16 flex items-center justify-center text-3xl mb-2">
            🦔
          </div>
          <CardTitle className="text-2xl font-bold text-[var(--color-foreground)]">
            新しい家族を登録
          </CardTitle>
          <CardDescription>
            ハリネズミちゃんの情報を入力してください。
          </CardDescription>
        </CardHeader>
        <form action={action}>
          <CardContent className="space-y-6">
            {/* 名前 */}
            <div className="space-y-2">
              <Label htmlFor="name">お名前 <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                placeholder="ハリー"
                required
                maxLength={50}
                className="bg-white"
              />
            </div>

            {/* 性別 */}
            <div className="space-y-2">
              <Label htmlFor="gender">性別</Label>
              <Select name="gender">
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男の子 (オス)</SelectItem>
                  <SelectItem value="female">女の子 (メス)</SelectItem>
                  <SelectItem value="unknown">不明</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 生年月日 */}
            <div className="space-y-2">
              <Label htmlFor="birthDate">生年月日 (推定可)</Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                className="bg-white"
              />
            </div>

            {/* お迎え日 */}
            <div className="space-y-2">
              <Label htmlFor="welcomeDate">お迎えした日</Label>
              <Input
                id="welcomeDate"
                name="welcomeDate"
                type="date"
                className="bg-white"
              />
            </div>

            {/* 見た目の特徴 */}
            <div className="space-y-2">
              <Label htmlFor="features">特徴・カラー</Label>
              <Textarea
                id="features"
                name="features"
                placeholder="シナモン、ソルト＆ペッパーなど"
                maxLength={200}
                className="bg-white resize-none"
              />
            </div>

             {/* 保険番号 */}
             <div className="space-y-2">
              <Label htmlFor="insuranceNumber">ペット保険番号</Label>
              <Input
                id="insuranceNumber"
                name="insuranceNumber"
                placeholder="任意入力"
                maxLength={50}
                className="bg-white"
              />
            </div>

            {state.error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {state.error}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full text-lg py-6 rounded-full font-bold shadow-md hover:shadow-lg transition-all"
              disabled={isPending}
            >
              {isPending ? "登録中..." : "登録してはじめる"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
