import { cn } from "~/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string | object;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white p-4 rounded-2xl border border-muted space-y-5",
        className
      )}
    >
      {children}
    </div>
  );
}
