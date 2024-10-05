import React, { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreVertical, Pencil, Trash2, Share2, Flag } from 'lucide-react';
import DeleteConfirmModal from './DeleteConfirmModal';
import ShareModal from './ShareModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ReactMarkdown from 'react-markdown';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import ChatBar from './ChatBar'; // Import the ChatBar component

const ConversationView = ({ conversation, onSendMessage, onUpdateMessage, onDeleteMessage }) => {
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  const handleEditClick = (message) => {
    setEditingMessageId(message.id);
    setEditedContent(message.content);
  };

  const handleEditSubmit = () => {
    onUpdateMessage(editingMessageId, editedContent);
    setEditingMessageId(null);
  };

  const handleDeleteClick = (messageId) => {
    setSelectedMessageId(messageId);
    setDeleteModalOpen(true);
  };

  const handleShareClick = (messageId) => {
    setSelectedMessageId(messageId);
    setShareModalOpen(true);
  };

  const handleReportMessage = (messageId) => {
    console.log(`Reporting message: ${messageId}`);
    // Implement report message logic here
  };

  const renderMessage = (content) => {
    return (
      <ReactMarkdown
        components={{
          inlineMath: ({ value }) => <InlineMath math={value} />,
          math: ({ value }) => <BlockMath math={value} />,
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <div className="bg-theme-pane backdrop-blur-md p-4 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-foreground">{conversation.title}</h2>
      <div className="space-y-4 flex-grow overflow-y-auto">
        {conversation.messages.map((message) => (
          <div
            key={message.id}
            className={`p-2 rounded ${
              message.author === 'user' ? 'bg-message-user text-right' : 'bg-message-assistant'
            }`}
          >
            <div className="flex items-center mb-2 justify-between">
              <div className="flex items-center">
                <Avatar className="h-6 w-6 mr-2">
                  <img src={`https://api.dicebear.com/6.x/initials/svg?seed=${message.author}`} alt={message.author} />
                </Avatar>
                <span className="text-sm text-muted-foreground">{message.author}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleEditClick(message)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDeleteClick(message.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShareClick(message.id)}>
                    <Share2 className="mr-2 h-4 w-4" />
                    <span>Share</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleReportMessage(message.id)}>
                    <Flag className="mr-2 h-4 w-4" />
                    <span>Report</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {editingMessageId === message.id ? (
              <div className="flex items-center">
                <Input
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="flex-grow mr-2"
                />
                <Button onClick={handleEditSubmit} size="sm">Save</Button>
              </div>
            ) : (
              <div className="text-left text-foreground">{renderMessage(message.content)}</div>
            )}
            <small className="text-xs text-muted-foreground block mt-1">
              {new Date(message.timestamp).toLocaleString()} - Read by: {message.readByIds.length}
            </small>
          </div>
        ))}
      </div>
      {/* Add margin around the ChatBar */}
      <div className="m-4">
        <ChatBar onSendMessage={onSendMessage} />
      </div>
      {/* Modals */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          onDeleteMessage(selectedMessageId);
          setDeleteModalOpen(false);
        }}
        itemName="message"
      />
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        chatId={conversation.id}
        messageId={selectedMessageId}
      />
    </div>
  );
};

export default ConversationView;