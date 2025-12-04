import { cn } from "~/lib/utils";

export default function Content({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string | object;
}) {
  return <div className={cn("px-5 md:px-20 py-10", className)}>{children}</div>;
}
