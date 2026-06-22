import { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function AdminEmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
        <Icon size={24} className="text-gray-300" />
      </div>
      <p className="font-semibold text-[#1a2f5e] mb-1">{title}</p>
      {description && <p className="text-gray-400 text-sm max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
