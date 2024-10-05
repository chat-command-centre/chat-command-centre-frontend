import React from 'react';
import SignInModal from '../components/SignInModal';
import { useNavigate } from 'react-router-dom';

const SignInPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignInModal isOpen={true} onClose={handleClose} />
    </div>
  );
};

export default SignInPage;