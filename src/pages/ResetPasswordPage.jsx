import React from 'react';
import ResetPasswordModal from '../components/ResetPasswordModal';
import { useNavigate, useParams } from 'react-router-dom';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  const handleClose = () => {
    navigate('/signin');
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <ResetPasswordModal isOpen={true} onClose={handleClose} resetToken={token} />
    </div>
  );
};

export default ResetPasswordPage;