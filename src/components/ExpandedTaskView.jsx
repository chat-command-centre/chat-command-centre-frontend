import React from 'react';
import { Link } from 'react-router-dom';

const ExpandedTaskView = ({ task }) => {
  const truncateMessage = (message, maxLength = 100) => {
    if (message.length <= maxLength) return message;
    return message.substr(0, maxLength - 3) + '...';
  };

  return (
    <div className="mt-2 p-2 bg-task-item rounded">
      <p className="text-sm text-foreground mb-2">{task.description}</p>
      <p className="text-xs text-muted-foreground">
        Context:{' '}
        <Link
          to={`/conversation/${task.context.split(' ')[1]}`}
          className="text-primary hover:text-primary/80 underline"
        >
          {truncateMessage(task.contextMessage)}
        </Link>
      </p>
    </div>
  );
};

export default ExpandedTaskView;