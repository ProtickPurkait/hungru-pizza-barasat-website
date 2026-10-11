import { CakeSlice, CupSoda, Drumstick, Hamburger, Leaf, Pizza, Popcorn, Smile, type LucideProps } from "lucide-react";
import type { IconKey } from "@/data/types";

const icons: Record<IconKey, React.ComponentType<LucideProps>> = {
  pizza: Pizza,
  leaf: Leaf,
  drumstick: Drumstick,
  smile: Smile,
  popcorn: Popcorn,
  burger: Hamburger,
  drink: CupSoda,
  dessert: CakeSlice,
};

export function ServiceIcon({ icon, ...props }: { icon: IconKey } & LucideProps) {
  const Icon = icons[icon] ?? Pizza;
  return <Icon aria-hidden="true" {...props} />;
}
