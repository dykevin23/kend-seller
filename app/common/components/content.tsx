import { cn } from "~/lib/utils";

export default function Content({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string | object;
}) {
  return (
    <div className={cn("max-w-[1400px] px-6 py-8 md:px-10", className)}>
      {children}
    </div>
  );
}
