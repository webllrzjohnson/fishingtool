import type { ReactNode } from "react";

const widthClasses = {
  wide: "max-w-7xl",
  content: "max-w-6xl",
} as const;

export function PageShell({
  children,
  width = "content",
  className = "",
}: {
  children: ReactNode;
  width?: keyof typeof widthClasses;
  className?: string;
}) {
  return (
    <div className={`mx-auto ${widthClasses[width]} px-4 py-8 sm:py-12 ${className}`}>
      {children}
    </div>
  );
}
