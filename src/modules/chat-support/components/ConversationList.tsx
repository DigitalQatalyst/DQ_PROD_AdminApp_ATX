import React, { useState, useMemo } from "react";
import Input from "../../../components/ui/InputComponent";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/Avatar";
import { Badge } from "../../../components/ui/Badge";
import { Search, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Skeleton from "../../../components/ui/SkeletonComponent";

export interface Conversation {
  id: string;
  type: "direct" | "group";
  community_id: string | null;
  created_at: string;
  name?: string;
  other_user?: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
  community?: {
    name: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count: number;
  participant_count: number;
}

export interface ConversationListProps {
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  refreshTrigger?: number;
  conversations?: Conversation[];
  isLoading?: boolean;
}

// Helpers
function sortByMostRecent(conversations: Conversation[]) {
  return [...conversations].sort((a, b) => {
    const dateA = new Date(
      a.last_message?.created_at || a.created_at,
    ).getTime();
    const dateB = new Date(
      b.last_message?.created_at || b.created_at,
    ).getTime();
    return dateB - dateA;
  });
}

function conversationMatchesSearch(conv: Conversation, query: string) {
  return (
    conv.name?.toLowerCase().includes(query) ||
    false ||
    conv.other_user?.username?.toLowerCase().includes(query) ||
    false ||
    conv.community?.name.toLowerCase().includes(query) ||
    false ||
    conv.last_message?.content.toLowerCase().includes(query) ||
    false
  );
}

// Components
export function ConversationListSkeleton() {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-card">
      <div className="p-4 border-b border-border h-[72px] flex items-center flex-shrink-0">
        <Skeleton className="h-10 w-full bg-gray-200" />
      </div>
      <div className="p-2 space-y-2 flex-1 overflow-y-auto min-h-0">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="space-y-1 flex-1 min-w-0">
              <Skeleton className="h-4 w-1/3 bg-gray-200" />
              <Skeleton className="h-3 w-1/2 bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyConversationState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
      <Users className="h-12 w-12 mb-4 opacity-20" />
      <p className="text-sm font-medium">No conversations yet</p>
    </div>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: () => void;
}

export const ConversationItem = React.memo(
  ({ conversation, isSelected, onSelect }: ConversationItemProps) => {
    const otherUser = conversation.other_user;
    const name = conversation.name || otherUser?.username || "Unknown";
    const avatar = otherUser?.avatar_url;

    return (
      <div
        onClick={onSelect}
        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
          isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted/50"
        }`}
      >
        <Avatar className="flex-shrink-0">
          <AvatarImage src={avatar || undefined} />
          <AvatarFallback className="bg-blue-600 text-primary-foreground">
            {name.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-semibold text-sm truncate flex-1">
              {name}
            </span>
            {conversation.last_message && (
              <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                {formatDistanceToNow(
                  new Date(conversation.last_message.created_at),
                  { addSuffix: true },
                )}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground truncate flex-1">
              {conversation.last_message?.content || "No messages"}
            </p>
            {conversation.unread_count > 0 && (
              <Badge
                variant="default"
                className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] flex-shrink-0"
              >
                {conversation.unread_count}
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  },
);

export const ConversationList = React.memo(function ConversationList({
  selectedConversationId,
  onSelectConversation,
  refreshTrigger,
  conversations: externalConversations,
  isLoading: externalLoading,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const conversations = externalConversations || [];
  const isLoading = externalLoading !== undefined ? externalLoading : false;

  // Memoize filtered conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery) return sortByMostRecent(conversations);
    const query = searchQuery.toLowerCase();
    return sortByMostRecent(
      conversations.filter((conv) => conversationMatchesSearch(conv, query)),
    );
  }, [conversations, searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (isLoading) {
    return <ConversationListSkeleton />;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-card">
      <div className="p-4 border-b border-border flex-shrink-0 h-[72px] flex items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredConversations.length === 0 ? (
          <EmptyConversationState />
        ) : (
          <div className="p-2">
            {filteredConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isSelected={selectedConversationId === conv.id}
                onSelect={() => onSelectConversation(conv.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
