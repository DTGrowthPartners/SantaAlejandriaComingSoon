import { cn } from "@/lib/utils";

interface MaterialIconProps {
  name: string;
  className?: string;
}

const MaterialIcon = ({ name, className }: MaterialIconProps) => (
  <span
    className={cn("material-symbols-outlined", className)}
    style={{ fontSize: "inherit", lineHeight: 1 }}
    aria-hidden="true"
  >
    {name}
  </span>
);

export default MaterialIcon;
