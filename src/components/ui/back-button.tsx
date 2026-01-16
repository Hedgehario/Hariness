'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className }: BackButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("text-stone-600 hover:bg-stone-100 hover:text-stone-900", className)}
      onClick={() => router.back()}
    >
      <ArrowLeft className="h-6 w-6" />
    </Button>
  );
}
