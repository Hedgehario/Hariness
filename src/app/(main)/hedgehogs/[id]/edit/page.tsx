import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateHedgehog, deleteHedgehog } from "../../actions";
import { HedgehogForm } from "@/components/hedgehogs/hedgehog-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";

export default async function EditHedgehogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: hedgehog } = await supabase
    .from("hedgehogs")
    .select("*")
    .eq("id", id)
    .single();

  if (!hedgehog) {
    notFound();
  }

  async function updateAction(prevState: any, formData: FormData) {
      "use server";
      const data = {
        name: formData.get("name") as string,
        gender: (formData.get("gender") as "male" | "female" | "unknown") || undefined,
        birthDate: (formData.get("birthDate") as string) || undefined,
        welcomeDate: (formData.get("welcomeDate") as string) || undefined,
        features: (formData.get("features") as string) || undefined,
        insuranceNumber: (formData.get("insuranceNumber") as string) || undefined,
      };
      return await updateHedgehog(id, data);
  }

  async function deleteAction() {
      "use server";
      // Ensure only authorized user deletes it (RLS checks this too, but good practice)
      await deleteHedgehog(id);
      redirect("/home");
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-20">
       <div className="p-4 safe-area-top">
          <div className="flex items-center justify-between mb-4">
              <Link href="/home">
                   <Button variant="ghost" size="icon">
                       <ArrowLeft className="w-6 h-6 text-stone-600" />
                   </Button>
              </Link>
              
              <form action={deleteAction}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    type="submit"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                      <Trash2 className="w-5 h-5" />
                  </Button>
              </form>
          </div>
          
          <div className="flex justify-center flex-col items-center gap-8">
            <HedgehogForm 
                initialData={{
                    id: hedgehog.id,
                    name: hedgehog.name,
                    gender: hedgehog.gender,
                    birth_date: hedgehog.birth_date,
                    welcome_date: hedgehog.welcome_date,
                    features: hedgehog.features,
                    insurance_number: hedgehog.insurance_number
                }}
                action={updateAction}
                title="個体情報を編集"
                description=""
                submitLabel="変更を保存"
            />
            
            <div className="w-full max-w-md px-4 mt-8 pt-8 border-t border-dashed border-stone-300">
                <p className="text-sm text-stone-500 mb-4 text-center">
                    この個体のデータを削除する場合は、右上のゴミ箱アイコンを押してください。<br/>
                    この操作は取り消せません。
                </p>
            </div>
          </div>
       </div>
    </div>
  );
}
