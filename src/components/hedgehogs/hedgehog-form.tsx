"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { deleteHedgehog } from "@/app/(main)/hedgehogs/actions";
import { Trash2 } from "lucide-react";

type HedgehogFormProps = {
  initialData?: {
    id: string;
    name: string;
    gender?: "male" | "female" | "unknown";
    birth_date?: string | null;
    welcome_date?: string | null;
    features?: string | null;
    insurance_number?: string | null;
  };
  action: (prevState: any, formData: FormData) => Promise<any>;
  title: string;
  description: string;
  submitLabel: string;
};

const initialState = {
  error: "",
  success: false as boolean | string,
};

export function HedgehogForm({
  initialData,
  action: serverAction,
  title,
  description,
  submitLabel,
}: HedgehogFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(serverAction, initialState);
  const [isDeleting, startDeleteTransition] = useTransition();

  useEffect(() => {
    if (state.success) {
      router.push("/home");
      router.refresh();
    }
  }, [state.success, router]);

  const handleDelete = () => {
    if (!initialData?.id) return;
    if (!confirm("本当に削除しますか？この操作は取り消せません。")) return;

    startDeleteTransition(async () => {
      const result = await deleteHedgehog(initialData.id);
      if (result.error) {
        alert(result.error);
      } else {
        router.push("/home");
        router.refresh();
      }
    });
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-none bg-white">
      <CardHeader className="text-center">
        <div className="mx-auto bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full p-3 w-16 h-16 flex items-center justify-center text-3xl mb-2">
          🦔
        </div>
        <CardTitle className="text-2xl font-bold text-[var(--color-foreground)]">
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          {/* 名前 */}
          <div className="space-y-2">
            <Label htmlFor="name">
              お名前 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="ハリー"
              required
              maxLength={50}
              className="bg-white"
              defaultValue={initialData?.name}
            />
          </div>

          {/* 性別 */}
          <div className="space-y-2">
            <Label htmlFor="gender">性別</Label>
            <Select name="gender" defaultValue={initialData?.gender || undefined}>
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
              defaultValue={initialData?.birth_date || ""}
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
              defaultValue={initialData?.welcome_date || ""}
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
              defaultValue={initialData?.features || ""}
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
              defaultValue={initialData?.insurance_number || ""}
            />
          </div>

          {state.error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {state.error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full text-lg py-6 rounded-full font-bold shadow-md hover:shadow-lg transition-all"
            disabled={isPending || isDeleting}
          >
            {isPending ? "保存中..." : submitLabel}
          </Button>

          {initialData && (
            <button
             type="button"
             onClick={handleDelete}
             disabled={isDeleting || isPending}
             className="text-sm text-red-500 hover:text-red-700 flex items-center justify-center gap-1 w-full py-2 hover:bg-red-50 rounded-lg transition-colors"
            >
                <Trash2 className="w-4 h-4" />
                この個体を削除する
            </button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
