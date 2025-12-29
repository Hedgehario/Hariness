import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateHedgehog } from "../../actions"; // existing actions file
import { HedgehogForm } from "@/components/hedgehogs/hedgehog-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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

  async function action(prevState: any, formData: FormData) {
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

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-20">
       <div className="p-4 safe-area-top">
          <Link href="/home" className="inline-block mb-4">
               <Button variant="ghost" size="icon">
                   <ArrowLeft className="w-6 h-6 text-stone-600" />
               </Button>
          </Link>
          
          <div className="flex justify-center">
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
                action={action}
                title="個体情報を編集"
                description=""
                submitLabel="変更を保存"
            />
          </div>
       </div>
    </div>
  );
}
