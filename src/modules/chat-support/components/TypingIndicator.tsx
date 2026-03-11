import React from "react";

export function TypingIndicator() {
  return (
    <div className="flex items-center space-x-2 text-gray-500 text-sm">
      <div className="w-8 h-8 rounded-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
          alt="Manor Hassan"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex space-x-1">
        <div
          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
          style={{
            animationDelay: "0ms",
          }}
        ></div>
        <div
          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
          style={{
            animationDelay: "300ms",
          }}
        ></div>
        <div
          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
          style={{
            animationDelay: "600ms",
          }}
        ></div>
      </div>
      <span>Manor is typing...</span>
    </div>
  );
}

