import React, { useState } from 'react';
import ConversationList from '../components/ConversationList';
import ConversationView from '../components/ConversationView';
import TaskList from '../components/TaskList';
import { TaskProvider } from '../contexts/TaskContext';
import { MessageSquareIcon, CheckSquareIcon, Settings, Share2, LogOut } from 'lucide-react';
import SettingsModal from '../components/SettingsModal';
import ShareModal from '../components/ShareModal';
import { Button } from '@/components/ui/button';
import SignInModal from '../components/SignInModal';
import SignUpModal from '../components/SignUpModal';
import { useSupabaseClient } from '../contexts/SupabaseContext';

const Index = () => {
  const supabase = useSupabaseClient();
  const [conversations, setConversations] = useState([
    {
      id: 1,
      title: 'AI Ethics Discussion',
      messages: [
        { id: 1, author: 'Alice', content: 'What are the main ethical concerns surrounding AI development?', timestamp: '2023-04-10T10:00:00Z', chatId: 1, readByIds: [1, 2] },
        { id: 2, author: 'AI Assistant', content: 'The main ethical concerns in AI development include bias in algorithms, privacy issues, job displacement, accountability for AI decisions, and the potential for AI to be used maliciously. For instance, AI systems trained on biased data can perpetuate and amplify societal prejudices.', timestamp: '2023-04-10T10:01:00Z', chatId: 1, readByIds: [1, 2] },
        { id: 3, author: 'Bob', content: 'How can we address the issue of bias in AI algorithms?', timestamp: '2023-04-10T10:02:00Z', chatId: 1, readByIds: [1, 2] },
        { id: 4, author: 'AI Assistant', content: 'Addressing bias in AI algorithms requires a multi-faceted approach. This includes diverse and representative training data, regular audits of AI systems for bias, transparent AI decision-making processes, and diverse teams developing AI. Additionally, implementing ethical guidelines and regulations for AI development can help mitigate bias.', timestamp: '2023-04-10T10:03:00Z', chatId: 1, readByIds: [1, 2] },
        { id: 5, author: 'Charlie', content: 'What role does transparency play in ethical AI development?', timestamp: '2023-04-10T10:04:00Z', chatId: 1, readByIds: [1] },
        { id: 6, author: 'AI Assistant', content: 'Transparency is crucial in ethical AI development. It involves making the decision-making processes of AI systems understandable to users and stakeholders. This includes explaining how AI arrives at its conclusions, what data it uses, and its limitations. Transparency builds trust, allows for better oversight, and helps identify potential biases or errors in AI systems.', timestamp: '2023-04-10T10:05:00Z', chatId: 1, readByIds: [1] },
      ],
      hasUnread: true,
      participants: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }, { id: 3, name: 'Charlie' }],
    },
    {
      id: 2,
      title: 'Climate Change Solutions',
      messages: [
        { id: 7, author: 'Diana', content: 'What are some innovative technologies being developed to combat climate change?', timestamp: '2023-04-11T14:00:00Z', chatId: 2, readByIds: [4, 5] },
        { id: 8, author: 'AI Assistant', content: 'Several innovative technologies are being developed to combat climate change. These include: 1) Direct Air Capture (DAC) systems that remove CO2 directly from the atmosphere. 2) Advanced energy storage solutions like solid-state batteries to support renewable energy integration. 3) Green hydrogen production for clean fuel alternatives. 4) Vertical farming and lab-grown meat to reduce agricultural emissions. 5) Enhanced weathering techniques to accelerate natural CO2 absorption processes.', timestamp: '2023-04-11T14:01:00Z', chatId: 2, readByIds: [4, 5] },
        { id: 9, author: 'Ethan', content: 'How effective is reforestation as a climate change mitigation strategy?', timestamp: '2023-04-11T14:02:00Z', chatId: 2, readByIds: [4, 5] },
        { id: 10, author: 'AI Assistant', content: 'Reforestation is considered an effective climate change mitigation strategy. Trees act as natural carbon sinks, absorbing CO2 from the atmosphere. Studies suggest that global reforestation could capture up to 205 gigatons of carbon, about two-thirds of human-made carbon emissions. However, it\'s important to note that reforestation alone isn\'t sufficient to combat climate change and should be part of a broader strategy including emissions reduction and other mitigation efforts.', timestamp: '2023-04-11T14:03:00Z', chatId: 2, readByIds: [4, 5] },
        { id: 11, author: 'Fiona', content: 'What role can individuals play in combating climate change?', timestamp: '2023-04-11T14:04:00Z', chatId: 2, readByIds: [4] },
        { id: 12, author: 'AI Assistant', content: 'Individuals can play a significant role in combating climate change through various actions: 1) Reducing energy consumption at home and opting for renewable energy sources. 2) Choosing sustainable transportation options like walking, cycling, or using public transit. 3) Adopting a more plant-based diet to reduce the carbon footprint of food consumption. 4) Practicing responsible consumption and reducing waste. 5) Supporting and voting for policies and leaders committed to climate action. 6) Educating others and participating in community initiatives for sustainability.', timestamp: '2023-04-11T14:05:00Z', chatId: 2, readByIds: [4] },
      ],
      hasUnread: false,
      participants: [{ id: 4, name: 'Diana' }, { id: 5, name: 'Ethan' }, { id: 6, name: 'Fiona' }],
    },
    {
      id: 3,
      title: 'Space Exploration Advancements',
      messages: [
        { id: 13, author: 'Grace', content: 'What are the latest advancements in space exploration technology?', timestamp: '2023-04-12T09:00:00Z', chatId: 3, readByIds: [7, 8, 9] },
        { id: 14, author: 'AI Assistant', content: 'Recent advancements in space exploration technology include: 1) Reusable rocket systems like SpaceX\'s Falcon 9. 2) Advanced propulsion systems such as ion drives for deep space missions. 3) Improved life support systems for long-duration space travel. 4) Advanced space telescopes like the James Webb Space Telescope. 5) Miniaturization of satellites (CubeSats) for more affordable space research. 6) 3D printing technology for manufacturing tools and parts in space.', timestamp: '2023-04-12T09:01:00Z', chatId: 3, readByIds: [7, 8, 9] },
        { id: 15, author: 'Hank', content: 'How close are we to establishing a permanent human presence on Mars?', timestamp: '2023-04-12T09:02:00Z', chatId: 3, readByIds: [7, 8] },
        { id: 16, author: 'AI Assistant', content: 'Establishing a permanent human presence on Mars is still a significant challenge, but progress is being made. NASA and private companies like SpaceX are actively working on technologies for Mars missions. Current estimates suggest that the first crewed missions to Mars could happen in the 2030s. However, a permanent settlement would likely come later, possibly in the 2040s or beyond. Challenges include radiation protection, sustainable life support systems, and psychological factors of long-term isolation.', timestamp: '2023-04-12T09:03:00Z', chatId: 3, readByIds: [7, 8] },
        { id: 17, author: 'Ivy', content: 'What potential benefits could space exploration bring to life on Earth?', timestamp: '2023-04-12T09:04:00Z', chatId: 3, readByIds: [7] },
        { id: 18, author: 'AI Assistant', content: 'Space exploration can bring numerous benefits to life on Earth: 1) Technological advancements that find applications in everyday life (e.g., GPS, weather forecasting). 2) Medical discoveries from studying the effects of microgravity on the human body. 3) New materials and manufacturing processes developed for space that have terrestrial applications. 4) Improved understanding of climate change through Earth observation satellites. 5) Potential access to extraterrestrial resources. 6) Inspiring the next generation of scientists and engineers. 7) International cooperation and diplomacy through joint space missions.', timestamp: '2023-04-12T09:05:00Z', chatId: 3, readByIds: [7] },
      ],
      hasUnread: true,
      participants: [{ id: 7, name: 'Grace' }, { id: 8, name: 'Hank' }, { id: 9, name: 'Ivy' }],
    },
  ]);

  const [activeConversation, setActiveConversation] = useState(conversations[0]);
  const [leftPaneCollapsed, setLeftPaneCollapsed] = useState(false);
  const [rightPaneCollapsed, setRightPaneCollapsed] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  /*
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  */

  const toggleLeftPane = () => setLeftPaneCollapsed(!leftPaneCollapsed);
  const toggleRightPane = () => setRightPaneCollapsed(!rightPaneCollapsed);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSendMessage = (message) => {
    const updatedConversations = conversations.map(conv =>
      conv.id === activeConversation.id
        ? {
            ...conv,
            messages: [
              ...conv.messages,
              {
                id: Date.now(),
                author: 'user',
                content: message,
                timestamp: new Date().toISOString(),
                chatId: conv.id,
                readByIds: [1],
              }
            ]
          }
        : conv
    );
    setConversations(updatedConversations);
    setActiveConversation(updatedConversations.find(conv => conv.id === activeConversation.id));
  };

  const handleUpdateMessage = (messageId, newContent) => {
    const updatedConversations = conversations.map(conv =>
      conv.id === activeConversation.id
        ? {
            ...conv,
            messages: conv.messages.map(msg =>
              msg.id === messageId ? { ...msg, content: newContent } : msg
            )
          }
        : conv
    );
    setConversations(updatedConversations);
    setActiveConversation(updatedConversations.find(conv => conv.id === activeConversation.id));
  };

  const handleDeleteMessage = (messageId) => {
    const updatedConversations = conversations.map(conv =>
      conv.id === activeConversation.id
        ? {
            ...conv,
            messages: conv.messages.filter(msg => msg.id !== messageId)
          }
        : conv
    );
    setConversations(updatedConversations);
    setActiveConversation(updatedConversations.find(conv => conv.id === activeConversation.id));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <TaskProvider>
      <div className="flex flex-col h-screen bg-theme-gradient text-foreground relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="shimmer"></div>
        </div>
        <header className="flex justify-between items-center p-1 bg-theme-pane border-b border-border relative z-20">
          <Button onClick={toggleLeftPane} variant="ghost" size="icon">
            <MessageSquareIcon className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-bold">Chat Task Wizard</h1>
          <div className="flex items-center">
            <Button onClick={toggleRightPane} variant="ghost" size="icon" className="mr-2">
              <CheckSquareIcon className="h-4 w-4" />
            </Button>
            <Button onClick={() => setIsSettingsModalOpen(true)} variant="ghost" size="icon" className="mr-2">
              <Settings className="h-4 w-4" />
            </Button>
            <Button onClick={() => setIsShareModalOpen(true)} variant="ghost" size="icon" className="mr-2">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button onClick={handleSignOut} variant="ghost" size="icon">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <div className="flex flex-grow relative z-10 overflow-hidden">
          {(!isMobileView || !leftPaneCollapsed) && (
            <div className={`transition-all duration-300 ${isMobileView ? 'absolute inset-0 z-30' : leftPaneCollapsed ? 'w-0' : 'w-1/4'} border-r border-border overflow-y-auto bg-theme-pane`}>
              <ConversationList
                conversations={conversations}
                activeConversation={activeConversation}
                setActiveConversation={setActiveConversation}
              />
            </div>
          )}
          <div className={`transition-all duration-300 flex flex-col ${isMobileView ? 'w-full' : leftPaneCollapsed && rightPaneCollapsed ? 'w-full' : leftPaneCollapsed || rightPaneCollapsed ? 'w-3/4' : 'w-1/2'} overflow-hidden`}>
            <ConversationView
              conversation={activeConversation}
              onUpdateMessage={handleUpdateMessage}
              onDeleteMessage={handleDeleteMessage}
            />
          </div>
          {(!isMobileView || !rightPaneCollapsed) && (
            <div className={`transition-all duration-300 ${isMobileView ? 'absolute inset-0 z-30' : rightPaneCollapsed ? 'w-0' : 'w-1/4'} border-l border-border overflow-y-auto bg-theme-pane`}>
              <TaskList activeConversationId={activeConversation.id} />
            </div>
          )}
        </div>
        <footer className="bg-theme-pane border-t border-border p-2 text-center text-xs text-muted-foreground relative z-20">
          Chat commands can make mistakes. <a href="#" className="underline">More info</a>
        </footer>
      </div>
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} chatId={activeConversation.id} />
      {/*
      <Button onClick={() => setIsSignInOpen(true)}>Sign In</Button>
      <Button onClick={() => setIsSignUpOpen(true)}>Sign Up</Button>

      <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
      <SignUpModal isOpen={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} />
      */}
    </TaskProvider>
  );
};

export default Index;