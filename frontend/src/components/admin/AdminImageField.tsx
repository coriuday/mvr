import { Image as ImageIcon } from "lucide-react";
import { CloudinaryImageUpload } from "./CloudinaryImageUpload";

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}

/** Single image field — Cloudinary upload + paste URL. */
export function AdminImageField({ value, onChange, folder, label = "Image" }: Props) {
  return (
    <CloudinaryImageUpload
      value={value}
      onChange={onChange}
      folder={folder}
      label={label}
      aspectRatio="video"
    />
  );
}

export function AdminImageFieldPlaceholder() {
  return (
    <div className="border border-dashed border-gray-200 rounded-lg p-4 flex items-center gap-2 text-gray-400 text-sm">
      <ImageIcon size={16} />
      No image
    </div>
  );
}
