interface TitleProps {
  title: string;
}

export default function Title({ title }: TitleProps) {
  return (
    <div className="pb-4">
      <h1 className="text-3xl font-bold">{title}</h1>
    </div>
  );
}
