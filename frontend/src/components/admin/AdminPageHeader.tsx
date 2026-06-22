interface Props {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function AdminPageHeader({ title, description, action }: Props) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[#1a2f5e]">{title}</h1>
        {description && <p className="text-gray-500 text-sm mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  );
}
