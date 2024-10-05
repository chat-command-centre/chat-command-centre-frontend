import React, { createContext, useContext, useState } from 'react';

const TaskContext = createContext();

export const useTaskContext = () => useContext(TaskContext);

const mockTasks = [
  {
    id: 1,
    title: 'Analyze AI ethics implications',
    readyForInput: true,
    readyForOutput: false,
    context: 'Conversation 1',
    description: 'Analyze the ethical implications of AI development discussed in the conversation.',
    contextMessage: 'The main ethical concerns in AI development include bias in algorithms, privacy issues, job displacement, accountability for AI decisions, and the potential for AI to be used maliciously.',
  },
  {
    id: 2,
    title: 'Summarize climate change solutions',
    readyForInput: false,
    readyForOutput: true,
    context: 'Conversation 2',
    description: 'Create a summary of innovative technologies being developed to combat climate change.',
    contextMessage: 'Several innovative technologies are being developed to combat climate change. These include: 1) Direct Air Capture (DAC) systems that remove CO2 directly from the atmosphere. 2) Advanced energy storage solutions like solid-state batteries to support renewable energy integration.',
  },
  {
    id: 3,
    title: 'Draft AI transparency guidelines',
    readyForInput: true,
    readyForOutput: false,
    context: 'Conversation 1',
    description: 'Create a draft of guidelines for ensuring transparency in AI systems based on the discussion.',
    contextMessage: 'Transparency is crucial in ethical AI development. It involves making the decision-making processes of AI systems understandable to users and stakeholders.',
  },
];

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(mockTasks);
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  const addTask = (task) => {
    setTasks((prevTasks) => [...prevTasks, { ...task, id: Date.now() }]);
  };

  const updateTask = (id, updates) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const removeTask = (id) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  const toggleTaskExpansion = (id) => {
    setExpandedTaskId(expandedTaskId === id ? null : id);
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, removeTask, expandedTaskId, toggleTaskExpansion }}>
      {children}
    </TaskContext.Provider>
  );
};