interface TitleProps {
  title: string;
}

export default function Title({ title }: TitleProps) {
  return (
    <div className="pb-4 pl-2">
      <h1 className="text-3xl font-bold pl-2">{title}</h1>
    </div>
  );
}
