interface TitleProps {
  title: string;
}

export default function Title({ title }: TitleProps) {
  return (
    <div className="pb-5">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
    </div>
  );
}
