"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch"; 
import { saveNews } from "../actions";
import { useRouter } from "next/navigation";

// Since switch is headless, we need a wrapper or handle value.
// But standard form submission with checkbox works for Switch if it renders a hidden input.
// Our Custom Switch might not render native input easily reachable by FormData without name.
// Let's check Switch implementation or use a hidden input synced with state.

function NewsForm({ initialData }: { initialData?: any }) {
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        const result = await saveNews(formData, initialData?.id);
        if (result.error) {
            alert(result.error);
        } else {
            router.push("/admin/news");
        }
    }

    return (
        <form action={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="title">タイトル</Label>
                    <Input 
                        id="title" 
                        name="title" 
                        defaultValue={initialData?.title} 
                        required 
                        placeholder="例: アプリのアップデートについて"
                    />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="content">本文</Label>
                    <Textarea 
                        id="content" 
                        name="content" 
                        defaultValue={initialData?.content} 
                        required 
                        className="min-h-[200px]"
                        placeholder="お知らせの内容を入力してください..."
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-2">
                        <input 
                            type="checkbox" 
                            id="isPublished" 
                            name="isPublished" 
                            className="w-4 h-4"
                            defaultChecked={initialData?.is_published}
                        />
                        <Label htmlFor="isPublished">公開する</Label>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => router.back()}>
                    キャンセル
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    保存する
                </Button>
            </CardFooter>
        </form>
    );
}

export default NewsForm;
