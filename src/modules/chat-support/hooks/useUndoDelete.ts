import { useEffect, useRef, useState } from "react";
import type { Message } from "../types";

export type DeletedMessageState = {
  message: Message;
  deleteForEveryone: boolean;
  timeoutId: NodeJS.Timeout | null;
} | null;

export function useUndoDelete(args: {
  messages: Message[];
  onDeleteMessage: (messageId: string, deleteForEveryone: boolean) => void;
  onRestoreMessage: (message: Message) => void;
}) {
  const { messages, onDeleteMessage, onRestoreMessage } = args;

  const [deletedMessage, setDeletedMessage] = useState<DeletedMessageState>(
    null
  );
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearExistingTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleDeleteMessage = (messageId: string, deleteForEveryone: boolean) => {
    // Clear any existing deletion timeout
    clearExistingTimeout();

    // Find the message before deleting it
    const messageToDelete = messages.find((msg) => msg.id === messageId);
    if (!messageToDelete) return;

    // Delete the message
    onDeleteMessage(messageId, deleteForEveryone);

    // Set up undo functionality with a 7-second timeout
    const timeoutId = setTimeout(() => {
      setDeletedMessage(null);
      timeoutRef.current = null;
    }, 7000);

    timeoutRef.current = timeoutId;

    // Store the deleted message info for potential undo
    setDeletedMessage({
      message: messageToDelete,
      deleteForEveryone,
      timeoutId,
    });
  };

  const handleUndoDelete = () => {
    if (!deletedMessage) return;

    // Clear the timeout
    clearExistingTimeout();

    // Restore the message
    onRestoreMessage(deletedMessage.message);

    // Clear the deleted message state
    setDeletedMessage(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearExistingTimeout();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { deletedMessage, handleDeleteMessage, handleUndoDelete };
}

