import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import Button from "../../../components/ui/ButtonComponent";
import Input from "../../../components/ui/InputComponent";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/DropdownMenu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/AlertDialog";
import { MoreVertical, Edit2, Trash2, Check, X } from "lucide-react";

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender?: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
}

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
}

/**
 * Memoized message bubble component.
 * Only re-renders when message content or ownership changes.
 */
export const MessageBubble = React.memo(function MessageBubble({
  message,
  isOwnMessage,
  onEdit,
  onDelete,
}: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleEdit = () => {
    if (onEdit && editContent.trim() !== message.content) {
      onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(message.id);
    }
    setShowDeleteDialog(false);
  };

  // Safely format the timestamp
  const getFormattedTime = () => {
    try {
      const date = new Date(message.created_at);
      if (isNaN(date.getTime())) {
        return "Just now";
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Just now";
    }
  };

  return (
    <div
      className={`flex items-start gap-3 ${
        isOwnMessage ? "flex-row-reverse" : ""
      }`}
    >
      <div
        className={`flex flex-col ${
          isOwnMessage ? "items-end" : "items-start"
        } max-w-[70%]`}
      >
        <div className="relative group">
          <div
            className={`rounded-xl px-4 py-2 shadow-sm ${
              isOwnMessage
                ? "bg-blue-500 text-gray-900"
                : "bg-gray-200 text-gray-900"
            }`}
          >
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="text-sm bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleEdit();
                    } else if (e.key === "Escape") {
                      handleCancelEdit();
                    }
                  }}
                  autoFocus
                />
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleEdit}
                    className="h-6 w-6 p-0"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}
          </div>

          {/* Edit/Delete menu - only show for own messages */}
          {isOwnMessage && !isEditing && (onEdit || onDelete) && (
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 bg-white shadow-sm border"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1 px-1">
          {/* {!isOwnMessage && message.sender && (
            <span className="text-xs font-medium text-gray-600">
              {message.sender.username}
            </span>
          )} */}
          <span className="text-xs text-black-900">{getFormattedTime()}</span>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});
