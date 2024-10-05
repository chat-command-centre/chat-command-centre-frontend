import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from 'react-router-dom';
import { useSupabaseClient } from '../contexts/SupabaseContext';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const supabase = useSupabaseClient();

  const handleResetLink = async () => {
    setError('');
    setMessage('');
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    // Implement forgot password logic here
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://yourdomain.com/reset-password', // Update with your reset password URL
    });
    if (error) {
      setError(error.message);
    } else {
      setMessage('Password reset email sent.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Forgot Password</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {message && <p className="text-green-500 text-sm">{message}</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="flex justify-between">
            <Link to="/signin" onClick={onClose} className="text-sm text-blue-500 hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleResetLink}>Send Reset Link</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal;