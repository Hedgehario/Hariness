'use client';

import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';

import { cn } from '@/lib/utils';

// Drawerのルートコンポーネント
function Drawer({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />;
}

// トリガー
function DrawerTrigger({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

// ポータル
function DrawerPortal({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal {...props} />;
}

// 閉じるボタン
function DrawerClose({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

// オーバーレイ（背景）
function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn('fixed inset-0 z-50 bg-black/50', className)}
      {...props}
    />
  );
}

// コンテンツ（本体）
function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          'bg-background fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto max-h-[96vh] flex-col rounded-t-2xl border-t shadow-lg',
          className
        )}
        {...props}
      >
        {/* ドラッグハンドル（スワイプ可能であることを示すバー） */}
        <div className="mx-auto mt-3 h-1.5 w-12 flex-shrink-0 rounded-full bg-stone-300" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

// ヘッダー
function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="drawer-header" className={cn('grid gap-1.5 p-4 text-center', className)} {...props} />
  );
}

// フッター
function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  );
}

// タイトル
function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  );
}

// 説明
function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
};
