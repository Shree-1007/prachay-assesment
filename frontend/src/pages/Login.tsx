import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FileText } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Email is required');
      return;
    }

    setIsSubmitting(true);
    const success = await login(email);
    setIsSubmitting(false);

    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid email. Try employee@test.com, director@test.com, or accounts@test.com');
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-muted/40 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <FileText size={24} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
          Expense Voucher System
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Sign in to your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-border">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              placeholder="e.g., employee@test.com"
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-2 text-muted-foreground">Demo Accounts</span>
              </div>
            </div>
            <div className="mt-6 text-sm text-center text-muted-foreground">
              <p>employee@test.com</p>
              <p>director@test.com</p>
              <p>accounts@test.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
