import React, { useEffect, useState, useRef } from 'react';
import {
    SendIcon,
    PaperclipIcon,
    MicIcon,
    SmileIcon,
    XIcon,
    CornerUpLeftIcon,
    TrashIcon,
    StopCircleIcon,
} from 'lucide-react';
import {
    FileAttachment,
    ReplyingTo,
    ALLOWED_FILE_TYPES,
    MAX_FILE_SIZE,
    MAX_RECORDING_TIME,
} from '../types';
import { EmojiPicker } from './EmojiPicker';
import { startAudioRecording, stopAudioRecording } from '../utils/mediaUtils';
interface ChatInputProps {
    onSendMessage: (
        content: string,
        attachment?: FileAttachment,
        replyToId?: string,
        voiceMessage?: {
            duration: number;
            audioUrl?: string;
        },
    ) => void;
    isDisabled?: boolean;
    replyingTo?: ReplyingTo | null;
    onCancelReply?: () => void;
}
export function ChatInput({
    onSendMessage,
    isDisabled = false,
    replyingTo = null,
    onCancelReply,
}: ChatInputProps) {
    const [message, setMessage] = useState('');
    const [attachment, setAttachment] = useState<FileAttachment | null>(null);
    const [isAttachToApplication, setIsAttachToApplication] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [recordingComplete, setRecordingComplete] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const mediaRecorderRef = useRef<{
        mediaRecorder: MediaRecorder;
        audioChunks: Blob[];
        stream: MediaStream;
    } | null>(null);
    const audioPreviewRef = useRef<HTMLAudioElement>(null);
    useEffect(() => {
        // Focus input when replying
        if (replyingTo) {
            inputRef.current?.focus();
        }
    }, [replyingTo]);
    useEffect(() => {
        // Cleanup recording timer on unmount
        return () => {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
            // Stop any ongoing recording
            if (mediaRecorderRef.current) {
                const { mediaRecorder, stream } = mediaRecorderRef.current;
                if (mediaRecorder.state !== 'inactive') {
                    mediaRecorder.stop();
                }
                stream.getTracks().forEach((track) => track.stop());
            }
            // Clean up any created object URLs
            if (recordedAudioUrl) {
                URL.revokeObjectURL(recordedAudioUrl);
            }
        };
    }, []);
    // Update recording timer
    useEffect(() => {
        if (isRecording) {
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime((prev) => {
                    if (prev >= MAX_RECORDING_TIME) {
                        stopRecording();
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
        } else {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
                recordingTimerRef.current = null;
            }
        }
        return () => {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
        };
    }, [isRecording]);
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle voice message submission
        if (recordingComplete && !isDisabled) {
            onSendMessage('', undefined, replyingTo?.messageId, {
                duration: recordingTime,
                audioUrl: recordedAudioUrl || undefined,
            });
            setRecordingComplete(false);
            setRecordingTime(0);
            setRecordedAudioUrl(null);
            if (onCancelReply) {
                onCancelReply();
            }
            return;
        }
        // Handle regular message submission
        if ((message.trim() || attachment) && !isDisabled) {
            onSendMessage(message, attachment || undefined, replyingTo?.messageId);
            setMessage('');
            setAttachment(null);
            setIsAttachToApplication(false);
            if (onCancelReply) {
                onCancelReply();
            }
        }
    };
    const validateFile = (file: File): boolean => {
        // Check file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            setFileError(
                'File type not supported. Please upload a valid document or image file.',
            );
            return false;
        }
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            setFileError(
                `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
            );
            return false;
        }
        setFileError(null);
        return true;
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (validateFile(file)) {
                const fileSize =
                    file.size < 1024 * 1024
                        ? `${(file.size / 1024).toFixed(1)} KB`
                        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
                setAttachment({
                    id: Date.now().toString(),
                    name: file.name,
                    size: fileSize,
                    type: file.type.split('/')[1] || 'file',
                    url: URL.createObjectURL(file),
                });
            }
            // Reset the input value so the same file can be selected again
            e.target.value = '';
        }
    };
    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file && validateFile(file)) {
                    const fileSize =
                        file.size < 1024 * 1024
                            ? `${(file.size / 1024).toFixed(1)} KB`
                            : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
                    setAttachment({
                        id: Date.now().toString(),
                        name: 'Pasted Image',
                        size: fileSize,
                        type: 'image',
                        url: URL.createObjectURL(file),
                    });
                    break;
                }
            }
        }
    };
    const handleEmojiSelect = (emoji: string) => {
        setMessage((prev) => prev + emoji);
        inputRef.current?.focus();
    };
    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };
    const formatRecordingTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    const toggleRecording = async () => {
        if (isDisabled) return;
        if (!isRecording && !recordingComplete) {
            await startRecording();
        } else if (isRecording) {
            await stopRecording();
        }
    };
    const startRecording = async () => {
        try {
            // Request microphone access and start recording
            const recorderData = await startAudioRecording();
            mediaRecorderRef.current = recorderData;
            setIsRecording(true);
            setRecordingTime(0);
            setRecordingComplete(false);
            setRecordedAudioUrl(null);
        } catch (error) {
            console.error('Failed to start recording:', error);
            alert('Could not access microphone. Please check permissions.');
        }
    };
    const stopRecording = async () => {
        if (!mediaRecorderRef.current) return;
        setIsRecording(false);
        if (recordingTime > 0) {
            try {
                const { mediaRecorder, audioChunks, stream } = mediaRecorderRef.current;
                // Stop recording and get the audio data
                const recording = await stopAudioRecording(
                    mediaRecorder,
                    audioChunks,
                    stream,
                    recordingTime,
                );
                // Save the audio URL for playback
                setRecordedAudioUrl(recording.url);
                setRecordingComplete(true);
            } catch (error) {
                console.error('Failed to stop recording:', error);
                alert('There was a problem with the recording.');
            }
        }
        // Reset the recorder reference
        mediaRecorderRef.current = null;
    };
    const cancelRecording = () => {
        // Stop any ongoing recording
        if (mediaRecorderRef.current) {
            const { mediaRecorder, stream } = mediaRecorderRef.current;
            if (mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
            }
            stream.getTracks().forEach((track) => track.stop());
            mediaRecorderRef.current = null;
        }
        // Clean up any created object URLs
        if (recordedAudioUrl) {
            URL.revokeObjectURL(recordedAudioUrl);
            setRecordedAudioUrl(null);
        }
        setIsRecording(false);
        setRecordingComplete(false);
        setRecordingTime(0);
    };
    const playRecordedAudio = () => {
        if (audioPreviewRef.current && recordedAudioUrl) {
            audioPreviewRef.current.play();
        }
    };
    return (
        <div className="border-t border-gray-200 p-3 bg-white">
            {/* Reply indicator */}
            {replyingTo && (
                <div className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center">
                        <CornerUpLeftIcon
                            size={16}
                            className="text-gray-500 mr-2 flex-shrink-0"
                        />
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500">
                                Replying to{' '}
                                <span className="font-medium">
                                    {replyingTo.sender === 'me' ? 'yourself' : replyingTo.name}
                                </span>
                            </p>
                            <p className="text-sm text-gray-700 truncate max-w-[200px] md:max-w-[300px] lg:max-w-[400px]">
                                {replyingTo.content}
                            </p>
                        </div>
                    </div>
                    <button
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 flex-shrink-0"
                        onClick={onCancelReply}
                    >
                        <XIcon size={16} />
                    </button>
                </div>
            )}
            {attachment && (
                <div className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center min-w-0">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-2 flex-shrink-0">
                            <span className="text-xs font-medium uppercase">
                                {attachment.type.substring(0, 3)}
                            </span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate max-w-[200px] md:max-w-[300px] lg:max-w-[400px]">
                                {attachment.name}
                            </p>
                            <p className="text-xs text-gray-500">{attachment.size}</p>
                        </div>
                    </div>
                    <button
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 flex-shrink-0"
                        onClick={() => setAttachment(null)}
                    >
                        <XIcon size={16} />
                    </button>
                </div>
            )}
            {fileError && (
                <div className="mb-2 p-2 bg-red-50 rounded-lg border border-red-200 text-red-600 text-sm">
                    <p>{fileError}</p>
                    <button
                        className="text-xs underline mt-1"
                        onClick={() => setFileError(null)}
                    >
                        Dismiss
                    </button>
                </div>
            )}
            {attachment && (
                <div className="mb-2">
                    <label className="flex items-center text-sm text-gray-600">
                        <input
                            type="checkbox"
                            checked={isAttachToApplication}
                            onChange={() => setIsAttachToApplication(!isAttachToApplication)}
                            className="mr-2 h-4 w-4 rounded text-blue-500 focus:ring-blue-500"
                            disabled={isDisabled}
                        />
                        Attach to Application
                    </label>
                </div>
            )}
            {/* Voice recording UI */}
            {recordingComplete && (
                <div className="mb-2 p-2 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
                    <div className="flex items-center flex-1">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-2">
                            <MicIcon size={16} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700">Voice message</p>
                            <div className="flex items-center">
                                <p className="text-xs text-gray-500 mr-2">
                                    {formatRecordingTime(recordingTime)}
                                </p>
                                {recordedAudioUrl && (
                                    <button
                                        onClick={playRecordedAudio}
                                        className="text-blue-500 hover:text-blue-700 text-xs"
                                    >
                                        Preview
                                    </button>
                                )}
                                <audio
                                    ref={audioPreviewRef}
                                    src={recordedAudioUrl || ''}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50"
                        onClick={cancelRecording}
                    >
                        <TrashIcon size={16} />
                    </button>
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-center">
                <button
                    type="button"
                    className={`p-2 ${isDisabled ? 'text-gray-300' : 'text-gray-400 hover:text-gray-600'} rounded-full hover:bg-gray-100 flex-shrink-0`}
                    onClick={() => !isDisabled && fileInputRef.current?.click()}
                    disabled={isDisabled || isRecording || recordingComplete}
                >
                    <PaperclipIcon size={20} />
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isDisabled || isRecording || recordingComplete}
                    accept={ALLOWED_FILE_TYPES.join(',')}
                />
                <div className="relative flex-shrink-0">
                    <button
                        type="button"
                        className={`p-2 ${showEmojiPicker ? 'text-blue-500' : isDisabled ? 'text-gray-300' : 'text-gray-400 hover:text-gray-600'} rounded-full hover:bg-gray-100`}
                        onClick={() => !isDisabled && toggleEmojiPicker()}
                        disabled={isDisabled || isRecording || recordingComplete}
                    >
                        <SmileIcon size={20} />
                    </button>
                    {showEmojiPicker && (
                        <EmojiPicker
                            onEmojiSelect={handleEmojiSelect}
                            onClose={() => setShowEmojiPicker(false)}
                        />
                    )}
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onPaste={handlePaste}
                    placeholder={
                        isDisabled
                            ? 'Reconnecting...'
                            : isRecording
                                ? 'Recording voice message...'
                                : recordingComplete
                                    ? 'Press send to deliver voice message'
                                    : 'Type your message here...'
                    }
                    className="chat-input flex-1 mx-2 py-2 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-0"
                    disabled={isDisabled || isRecording || recordingComplete}
                />
                {/* Recording button with different states */}
                {!message.trim() && !attachment && !recordingComplete && (
                    <button
                        type="button"
                        onClick={toggleRecording}
                        disabled={isDisabled}
                        className={`p-2 rounded-full flex-shrink-0 ${isRecording ? 'bg-red-500 text-white animate-pulse' : isDisabled ? 'text-gray-300 bg-gray-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                    >
                        {isRecording ? <StopCircleIcon size={20} /> : <MicIcon size={20} />}
                    </button>
                )}
                <button
                    type="submit"
                    className={`p-2 rounded-full flex-shrink-0 ${!isDisabled && (message.trim() || attachment || recordingComplete) ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400'}`}
                    disabled={
                        isDisabled || (!message.trim() && !attachment && !recordingComplete)
                    }
                >
                    <SendIcon size={20} />
                </button>
            </form>
            {isRecording && (
                <div className="mt-2 text-center">
                    <div className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-500 rounded-full text-xs">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                        Recording {formatRecordingTime(recordingTime)} /{' '}
                        {formatRecordingTime(MAX_RECORDING_TIME)}
                        {recordingTime >= MAX_RECORDING_TIME - 10 && (
                            <span className="ml-1 font-medium">
                                {recordingTime >= MAX_RECORDING_TIME
                                    ? "Time's up!"
                                    : 'Almost done!'}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
