import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";

import { MessagesList } from "./MessagesList";
import { UsersList } from "./UsersList";
import { MessageComposer } from "./MessageComposer";

interface User {
  id: number;
  username: string;
  fullName: string;
  role: string;
}

interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  read: boolean;
  createdAt: string;
}

export default function MessagingContainer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messageText, setMessageText] = useState("");

  // Query for getting all users
  const usersQuery = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: !!user,
  });

  // Query for unread message count
  const unreadCountQuery = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread-count"],
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Query for current conversation
  const conversationQuery = useQuery<Message[]>({
    queryKey: ["/api/messages/conversation", selectedUser?.id],
    enabled: !!selectedUser,
  });

  // Mutation for sending a message
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { receiverId: number; content: string }) => {
      const res = await apiRequest("POST", "/api/messages", messageData);
      return await res.json();
    },
    onSuccess: () => {
      // Clear message text
      setMessageText("");
      
      // Invalidate conversation cache to show new message
      queryClient.invalidateQueries({
        queryKey: ["/api/messages/conversation", selectedUser?.id],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for marking all messages from a user as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async (senderId: number) => {
      const res = await apiRequest("PATCH", "/api/messages/read-all", { senderId });
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate conversation cache to update read status
      queryClient.invalidateQueries({
        queryKey: ["/api/messages/conversation", selectedUser?.id],
      });
      
      // Invalidate unread count cache
      queryClient.invalidateQueries({
        queryKey: ["/api/messages/unread-count"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to mark messages as read",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // When a user is selected, mark all messages from that user as read
  useEffect(() => {
    if (selectedUser && user) {
      markAllAsReadMutation.mutate(selectedUser.id);
    }
  }, [selectedUser, user]);

  const handleSendMessage = () => {
    if (!selectedUser || !messageText.trim()) return;
    
    sendMessageMutation.mutate({
      receiverId: selectedUser.id,
      content: messageText.trim(),
    });
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col h-full border-none shadow-none">
        <CardHeader className="pb-4">
          <CardTitle>Messaging</CardTitle>
          <CardDescription>
            Communicate with other researchers in the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 gap-6 p-0">
          <div className="flex flex-col w-1/3 border-r">
            <div className="p-4 font-medium">
              Contacts
              {unreadCountQuery.data?.count > 0 && (
                <Badge className="ml-2" variant="destructive">
                  {unreadCountQuery.data.count} unread
                </Badge>
              )}
            </div>
            <Separator />
            <div className="flex-1 h-[600px]">
              {usersQuery.isLoading ? (
                <div className="p-4 space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <ScrollArea className="h-full p-4">
                  <UsersList
                    users={usersQuery.data || []}
                    selectedUser={selectedUser}
                    onSelectUser={handleUserSelect}
                  />
                </ScrollArea>
              )}
            </div>
          </div>
          
          <div className="flex flex-col w-2/3 h-full">
            {!selectedUser ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <div className="mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium">No conversation selected</h3>
                <p className="max-w-sm mt-2">
                  Select a contact from the list to start messaging
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center p-4 border-b">
                  <Avatar className="w-10 h-10 mr-3">
                    <AvatarFallback>
                      {selectedUser.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedUser.fullName}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedUser.role}
                    </div>
                  </div>
                </div>
                
                <ScrollArea className="flex-1 p-4 h-[500px]">
                  {conversationQuery.isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-16 w-4/5 ml-auto" />
                      <Skeleton className="h-16 w-3/4" />
                      <Skeleton className="h-16 w-4/5 ml-auto" />
                    </div>
                  ) : (
                    <MessagesList
                      messages={conversationQuery.data || []}
                      currentUserId={user?.id}
                    />
                  )}
                </ScrollArea>
                
                <div className="p-4 mt-auto border-t">
                  <MessageComposer
                    value={messageText}
                    onChange={setMessageText}
                    onSend={handleSendMessage}
                    isLoading={sendMessageMutation.isPending}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}