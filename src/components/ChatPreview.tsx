import React from 'react';
import { useAppContext } from '../context/AppContext';

interface Chat {
  id: string;
  clientName: string;
  message: string;
  time: string;
  unread: boolean;
}

interface ChatPreviewProps {
  chat: Chat;
}

const ChatPreview: React.FC<ChatPreviewProps> = ({ chat }) => {
  const { darkMode } = useAppContext();
  
  return (
    <div className={`flex items-center p-3 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} transition-colors cursor-pointer relative`}>
      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
        {chat.clientName.charAt(0)}
      </div>
      
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex justify-between">
          <h4 className="font-medium truncate">{chat.clientName}</h4>
          <span className="text-xs text-gray-500">{chat.time}</span>
        </div>
        <p className="text-sm text-gray-500 truncate">{chat.message}</p>
      </div>
      
      {chat.unread && (
        <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-indigo-500"></div>
      )}
    </div>
  );
};

export default ChatPreview;