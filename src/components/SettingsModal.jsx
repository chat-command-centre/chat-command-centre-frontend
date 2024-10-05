import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from 'next-themes';

// Mock action library - in a real app, this would be imported from a separate file
const actionLibrary = [
  { id: 'web_search', name: 'Web Search', integration: 'google' },
  { id: 'code_execution', name: 'Code Execution', integration: 'github' },
  { id: 'data_analysis', name: 'Data Analysis', integration: 'excel' },
  { id: 'image_generation', name: 'Image Generation', integration: 'dall-e' },
];

const SettingsModal = ({ isOpen, onClose, chat }) => {
  const [enabledActions, setEnabledActions] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [newParticipant, setNewParticipant] = useState('');
  const [newParticipantPermission, setNewParticipantPermission] = useState('can_view');
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (chat) {
      setEnabledActions(chat.enabledActions || []);
      setParticipants(chat.participants || []);
    }
  }, [chat]);

  const handleSave = () => {
    // Save the enabled actions and participants for the chat
    console.log('Saving enabled actions:', enabledActions);
    console.log('Saving participants:', participants);
    onClose();
  };

  const toggleAction = (actionId) => {
    setEnabledActions((prev) =>
      prev.includes(actionId)
        ? prev.filter((id) => id !== actionId)
        : [...prev, actionId]
    );
  };

  const addParticipant = () => {
    if (newParticipant) {
      setParticipants([...participants, { id: Date.now(), name: newParticipant, permission: newParticipantPermission }]);
      setNewParticipant('');
      setNewParticipantPermission('can_view');
    }
  };

  const removeParticipant = (id) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const updateParticipantPermission = (id, permission) => {
    setParticipants(participants.map(p => p.id === id ? { ...p, permission } : p));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Chat Settings</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="participants">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
          <TabsContent value="participants">
            <div className="space-y-4">
              <h3 className="font-semibold">Current Participants:</h3>
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${participant.name}`} />
                      <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{participant.name}</span>
                    <Select
                      value={participant.permission}
                      onValueChange={(value) => updateParticipantPermission(participant.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select permission" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="can_view">Can View</SelectItem>
                        <SelectItem value="can_respond">Can Respond</SelectItem>
                        <SelectItem value="can_initiate">Can Initiate Conversation</SelectItem>
                        <SelectItem value="can_invite">Can Invite Others</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="destructive" size="sm" onClick={() => removeParticipant(participant.id)}>Remove</Button>
                  </div>
                ))}
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Input
                  placeholder="Username or Email"
                  value={newParticipant}
                  onChange={(e) => setNewParticipant(e.target.value)}
                />
                <Select value={newParticipantPermission} onValueChange={setNewParticipantPermission}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select permission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="can_view">Can View</SelectItem>
                    <SelectItem value="can_respond">Can Respond</SelectItem>
                    <SelectItem value="can_initiate">Can Initiate Conversation</SelectItem>
                    <SelectItem value="can_invite">Can Invite Others</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addParticipant}>Add</Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="tools">
            <div className="space-y-4">
              <h3 className="font-semibold">Available Tools:</h3>
              <div className="space-y-2">
                {actionLibrary.map((action) => (
                  <div key={action.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={action.id}
                      checked={enabledActions.includes(action.id)}
                      onCheckedChange={() => toggleAction(action.id)}
                    />
                    <Label htmlFor={action.id}>{action.name}</Label>
                    <span className="text-sm text-gray-500">({action.integration})</span>
                    <Button size="sm" variant="outline">Configure</Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="appearance">
            <div className="space-y-4">
              <h3 className="font-semibold">Theme:</h3>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
