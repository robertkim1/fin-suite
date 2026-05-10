import { TrendingUp, MapPin } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Module = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

export const MODULES: Module[] = [
  {
    id: "balance-tracker",
    label: "Balance Tracker",
    href: "/balance-tracker",
    icon: TrendingUp,
  },
  {
    id: "cost-of-living",
    label: "Cost of Living",
    href: "/cost-of-living",
    icon: MapPin,
  },
];
