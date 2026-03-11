import React, { useEffect, useRef } from 'react';
interface EmojiPickerProps {
    onEmojiSelect: (emoji: string) => void;
    onClose: () => void;
}
export function EmojiPicker({ onEmojiSelect, onClose }: EmojiPickerProps) {
    const pickerRef = useRef<HTMLDivElement>(null);
    // Common emojis that work well across platforms
    const emojis = [
        '😊',
        '😂',
        '👍',
        '❤️',
        '🙏',
        '👏',
        '🎉',
        '🔥',
        '💯',
        '✅',
        '⭐',
        '🤔',
        '😍',
        '👌',
        '🙌',
        '👋',
        '🤝',
        '👀',
        '💪',
        '🚀',
        '⚡',
        '💡',
        '📊',
        '📈',
        '✨',
        '🌟',
        '💼',
        '📱',
        '💻',
        '📝',
        '🔍',
        '🗓️',
        '⏰',
        '💬',
        '📞',
        '📧',
    ];
    // Categories
    const categories = [
        {
            name: 'Smileys',
            emoji: '😊',
        },
        {
            name: 'Gestures',
            emoji: '👍',
        },
        {
            name: 'Objects',
            emoji: '💼',
        },
        {
            name: 'Symbols',
            emoji: '⭐',
        },
    ];
    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);
    return (
        <div
            ref={pickerRef}
            className="absolute bottom-12 left-0 bg-white rounded-lg shadow-lg border border-gray-200 w-64 z-10"
        >
            <div className="p-2 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-700">Emojis</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-sm"
                    >
                        &times;
                    </button>
                </div>
            </div>
            <div className="p-2 border-b border-gray-200">
                <div className="flex space-x-2 overflow-x-auto py-1">
                    {categories.map((category) => (
                        <button
                            key={category.name}
                            className="flex flex-col items-center min-w-[40px] p-1 rounded hover:bg-gray-100"
                        >
                            <span className="text-xl">{category.emoji}</span>
                            <span className="text-xs text-gray-500">{category.name}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="p-2 max-h-60 overflow-y-auto">
                <div className="grid grid-cols-6 gap-1">
                    {emojis.map((emoji, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                onEmojiSelect(emoji);
                                onClose();
                            }}
                            className="w-9 h-9 flex items-center justify-center text-xl hover:bg-gray-100 rounded"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
            <div className="p-2 border-t border-gray-200">
                <div className="flex items-center">
                    <span className="text-xs text-gray-500">Recently Used</span>
                </div>
                <div className="flex mt-1">
                    {emojis.slice(0, 6).map((emoji, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                onEmojiSelect(emoji);
                                onClose();
                            }}
                            className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 rounded"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
