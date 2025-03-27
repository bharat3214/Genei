import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconColor?: string;
  iconBgColor?: string;
  linkText?: string;
  linkHref?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  iconColor = "text-primary-600",
  iconBgColor = "bg-primary-100",
  linkText,
  linkHref
}: StatsCardProps) {
  return (
    <Card className="overflow-hidden shadow">
      <div className="p-5">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", iconBgColor)}>
            <span className={cn("material-icons", iconColor)}>{icon}</span>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-semibold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {linkText && linkHref && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <a href={linkHref} className="font-medium text-primary-600 hover:text-primary-500">
              {linkText}
            </a>
          </div>
        </div>
      )}
    </Card>
  );
}
