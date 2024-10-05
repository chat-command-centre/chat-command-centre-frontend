import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Link, Users } from 'lucide-react';

const ShareModal = ({ isOpen, onClose, chatId }) => {
  const [embedCode, setEmbedCode] = useState(`<iframe src="https://yourdomain.com/embed/${chatId}" width="100%" height="500px"></iframe>`);
  const [chatLink, setChatLink] = useState(`https://yourdomain.com/chat/${chatId}`);
  const [inviteEmail, setInviteEmail] = useState('');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You might want to show a toast notification here
  };

  const handleInvite = () => {
    // Implement invite logic here
    console.log('Inviting:', inviteEmail);
    setInviteEmail('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Chat</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="embed">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="embed">Embed</TabsTrigger>
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="invite">Invite</TabsTrigger>
          </TabsList>
          <TabsContent value="embed">
            <div className="space-y-2">
              <Input value={embedCode} readOnly />
              <Button onClick={() => copyToClipboard(embedCode)} className="w-full">
                <Copy className="mr-2 h-4 w-4" /> Copy Embed Code
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="link">
            <div className="space-y-2">
              <Input value={chatLink} readOnly />
              <Button onClick={() => copyToClipboard(chatLink)} className="w-full">
                <Link className="mr-2 h-4 w-4" /> Copy Link
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="invite">
            <div className="space-y-2">
              <Input
                placeholder="Enter email or username"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <Button onClick={handleInvite} className="w-full">
                <Users className="mr-2 h-4 w-4" /> Invite to Chat
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;