import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Activity } from "@/lib/types";

interface ActivityFeedProps {
  activities?: Activity[];
  isLoading?: boolean;
  onViewAll?: () => void;
}

export default function ActivityFeed({ 
  activities, 
  isLoading = false,
  onViewAll
}: ActivityFeedProps) {
  // Function to determine the icon for each activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "drug_candidate_created":
        return { icon: "science", bgColor: "bg-primary-100", textColor: "text-primary-600" };
      case "property_analysis":
        return { icon: "analytics", bgColor: "bg-success-100", textColor: "text-success-600" };
      case "literature_update":
        return { icon: "menu_book", bgColor: "bg-gray-100", textColor: "text-gray-600" };
      case "molecule_created":
        return { icon: "hub", bgColor: "bg-primary-100", textColor: "text-primary-600" };
      case "project_created":
        return { icon: "assignment", bgColor: "bg-warning-100", textColor: "text-warning-600" };
      default:
        return { icon: "notifications", bgColor: "bg-gray-100", textColor: "text-gray-600" };
    }
  };

  return (
    <Card className="shadow">
      <CardHeader className="px-6 py-5 border-b border-gray-200">
        <CardTitle className="text-lg font-medium leading-6 text-gray-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : activities && activities.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {activities.map((activity) => {
              const { icon, bgColor, textColor } = getActivityIcon(activity.type);
              return (
                <li key={activity.id} className="py-4">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <span className={`material-icons rounded-full h-8 w-8 flex items-center justify-center ${bgColor} ${textColor}`}>
                        {icon}
                      </span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">{activity.description}</h3>
                        <p className="text-sm text-gray-500">
                          {activity.createdAt ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true }) : "Recently"}
                        </p>
                      </div>
                      {activity.metadata && (
                        <p className="text-sm text-gray-500">
                          {Object.entries(activity.metadata).map(([key, value]) => (
                            typeof value !== 'object' ? `${key}: ${value}` : null
                          )).filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="py-4 text-center text-gray-500">
            No recent activity
          </div>
        )}
        
        <div className="mt-6">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={onViewAll}
          >
            View all activity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
