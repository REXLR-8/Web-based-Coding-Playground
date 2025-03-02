import React from 'react';

interface ConsoleProps {
  messages: string[];
  theme: string;
}

const Console: React.FC<ConsoleProps> = ({ messages, theme }) => {
  const getMessageClass = (message: string) => {
    if (message.startsWith('[error]')) {
      return 'text-red-500';
    } else if (message.startsWith('[warn]')) {
      return 'text-yellow-500';
    } else if (message.startsWith('[info]')) {
      return 'text-blue-500';
    }
    return 'text-green-500';
  };

  return (
    <div className={`p-4 font-mono text-sm ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} h-full overflow-auto`}>
      {messages.length === 0 ? (
        <div className="text-gray-500 italic">Console output will appear here...</div>
      ) : (
        messages.map((message, index) => (
          <div key={index} className={`mb-1 ${getMessageClass(message)}`}>
            {message}
          </div>
        ))
      )}
    </div>
  );
};

export default Console;