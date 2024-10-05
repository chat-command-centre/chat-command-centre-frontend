import React from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import ExpandedTaskView from './ExpandedTaskView';
import { CheckSquareIcon } from 'lucide-react';

const TaskList = ({ activeConversationId }) => {
  const taskContext = useTaskContext();
  
  if (!taskContext) {
    return <div>Loading tasks...</div>;
  }

  const { tasks, expandedTaskId, toggleTaskExpansion } = taskContext;

  // Filter tasks for the active conversation
  const filteredTasks = tasks.filter(task => task.context === `Conversation ${activeConversationId}`);

  return (
    <div className="bg-theme-pane backdrop-blur-md p-4 h-screen overflow-y-auto">
      <ul className="space-y-2">
        {filteredTasks.map((task) => (
          <li
            key={task.id}
            className="bg-task-item p-2 rounded shadow transition-all duration-300 hover:shadow-md"
          >
            <div
              className="cursor-pointer flex items-center"
              onClick={() => toggleTaskExpansion(task.id)}
            >
              <CheckSquareIcon className="h-5 w-5 mr-2" />
              <h3 className="font-semibold text-foreground">{task.title}</h3>
              {task.active && (
                <span className="ml-auto w-2 h-2 bg-green-500 rounded-full"></span>
              )}
            </div>
            {expandedTaskId === task.id && <ExpandedTaskView task={task} />}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;