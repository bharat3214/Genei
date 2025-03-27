import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  read: boolean;
  createdAt: string;
}

interface MessagesListProps {
  messages: Message[];
  currentUserId?: number;
}

export function MessagesList({ messages, currentUserId }: MessagesListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center text-muted-foreground">
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isCurrentUserSender = message.senderId === currentUserId;
        const messageDate = new Date(message.createdAt);
        
        return (
          <div
            key={message.id}
            className={cn(
              "flex flex-col max-w-[80%] rounded-lg p-3",
              isCurrentUserSender
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-muted"
            )}
          >
            <div className="break-words">{message.content}</div>
            <div
              className={cn(
                "text-xs mt-1",
                isCurrentUserSender ? "text-primary-foreground/70" : "text-muted-foreground"
              )}
            >
              {format(messageDate, "h:mm a")}
              {isCurrentUserSender && (
                <span className="ml-2">
                  {message.read ? "Read" : "Sent"}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}