
"use client";

import React from 'react';
import { useRadioPlayer } from '@/hooks/use-radio-player';
import { cn } from '@/lib/utils';

export default function RadioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentRadio } = useRadioPlayer();

  return (
      <div className={cn("pb-20 md:pb-0", currentRadio && "md:pb-24")}>
          {children}
      </div>
  );
}
