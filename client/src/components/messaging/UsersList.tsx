import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface User {
  id: number;
  username: string;
  fullName: string;
  role: string;
}

interface UsersListProps {
  users: User[];
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
}

export function UsersList({ users, selectedUser, onSelectUser }: UsersListProps) {
  if (users.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        No other users found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div
          key={user.id}
          className={cn(
            "flex items-center p-3 rounded-md cursor-pointer hover:bg-muted transition-colors",
            selectedUser?.id === user.id && "bg-muted"
          )}
          onClick={() => onSelectUser(user)}
        >
          <Avatar className="w-10 h-10 mr-3">
            <AvatarFallback>{user.fullName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <div className="font-medium truncate">{user.fullName}</div>
            <div className="text-sm text-muted-foreground truncate">
              {user.role}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}