import {
  Briefcase,
  Car,
  Gift,
  Gamepad2,
  LayoutGrid,
  Receipt,
  Shapes,
  ShoppingBag,
  Store,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  utensils: UtensilsCrossed,
  car: Car,
  "shopping-bag": ShoppingBag,
  "gamepad-2": Gamepad2,
  receipt: Receipt,
  shapes: Shapes,
  layers: LayoutGrid,
  briefcase: Briefcase,
  gift: Gift,
  store: Store,
  wallet: Wallet,
};

/** Ikon kategori dari nama ikon yang disimpan di database. */
export function CategoryIcon({
  icon,
  color,
  size = 18,
}: {
  icon: string;
  color: string;
  size?: number;
}) {
  const Icon = ICONS[icon] ?? Shapes;
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control"
      style={{ backgroundColor: `${color}1a`, color }}
      aria-hidden="true"
    >
      <Icon size={size} />
    </span>
  );
}
