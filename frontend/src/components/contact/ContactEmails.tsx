import { Mail } from "lucide-react";
import { CONTACT_INFO } from "@/constants/navigation";

type ContactEmailsProps = {
  variant: "inline" | "card" | "text";
};

const linkClass =
  "text-[#c9a84c] hover:underline break-all";

export default function ContactEmails({ variant }: ContactEmailsProps) {
  const { emails } = CONTACT_INFO;

  if (variant === "text") {
    return (
      <>
        <a href={`mailto:${emails[0]}`} className={linkClass}>
          {emails[0]}
        </a>
        {" or "}
        <a href={`mailto:${emails[1]}`} className={linkClass}>
          {emails[1]}
        </a>
      </>
    );
  }

  if (variant === "card") {
    return (
      <>
        {emails.map((email) => (
          <p key={email} className="text-gray-600 text-sm break-all leading-relaxed w-full">
            <a href={`mailto:${email}`} className="hover:text-[#1a2f5e] transition-colors">
              {email}
            </a>
          </p>
        ))}
      </>
    );
  }

  return (
    <div className="space-y-3">
      {emails.map((email, index) => (
        <a
          key={email}
          href={`mailto:${email}`}
          className="flex items-center gap-3 text-white/60 hover:text-white text-sm transition-colors group"
        >
          <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#c9a84c] transition-colors">
            <Mail size={13} />
          </span>
          <span className={index === 1 ? "break-all" : undefined}>{email}</span>
        </a>
      ))}
    </div>
  );
}
