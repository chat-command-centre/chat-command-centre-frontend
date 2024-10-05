import React from 'react';
import SignUpModal from '../components/SignUpModal';
import { useNavigate } from 'react-router-dom';

const SignUpPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUpModal isOpen={true} onClose={handleClose} />
    </div>
  );
};

export default SignUpPage;