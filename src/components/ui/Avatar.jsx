import { UserCog } from "lucide-react";
import { initials } from "../../lib/format";

const TONES = {
  brand: "bg-brand-50 text-brand-700 ring-brand-600/10",
  steel: "bg-steel-100 text-steel-500 ring-steel-500/10",
};

export default function Avatar({ person, tone = "brand", size = "h-8 w-8 text-[11px]" }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ring-1 ring-inset ${TONES[tone]} ${size}`}
    >
      {person ? person.avatarInitials || initials(person.name) : <UserCog className="h-3.5 w-3.5" />}
    </span>
  );
}
