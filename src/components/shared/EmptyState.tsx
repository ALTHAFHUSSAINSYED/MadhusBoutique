import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionText,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4 max-w-md mx-auto space-y-4">
      <div className="w-16 h-16 rounded-full bg-[#f6efe2] border border-[#dfb15b]/40 flex items-center justify-center mx-auto text-[#6b1426]">
        <Sparkles className="w-7 h-7 text-[#b8860b]" />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-serif text-xl font-bold text-[#4a1220]">{title}</h3>
        <p className="text-xs text-stone-500 leading-relaxed">{description}</p>
      </div>
      {(actionText && (actionHref || onAction)) && (
        <div className="pt-2">
          {actionHref ? (
            <Button asChild>
              <Link href={actionHref}>{actionText}</Link>
            </Button>
          ) : (
            <Button onClick={onAction}>{actionText}</Button>
          )}
        </div>
      )}
    </div>
  );
}
