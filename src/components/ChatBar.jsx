import React, { useState } from 'react';
import { Send, Mic, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ChatBar = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center">
      <Button type="button" variant="ghost" size="icon" className="rounded-full">
        <Image className="h-5 w-5" />
      </Button>
      <Input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-grow bg-transparent border-none focus:ring-0 text-white mx-2"
      />
      <Button type="submit" variant="ghost" size="icon" className="rounded-full">
        <Send className="h-5 w-5" />
      </Button>
      <Button type="button" variant="ghost" size="icon" className="rounded-full">
        <Mic className="h-5 w-5" />
      </Button>
    </form>
  );
};

export default ChatBar;