import React from 'react';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/signin');
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <ForgotPasswordModal isOpen={true} onClose={handleClose} />
    </div>
  );
};

export default ForgotPasswordPage;