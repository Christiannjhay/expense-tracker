'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const validateUsername = (value: string) => {
    if (!value.trim()) {
      return 'Username is required';
    }
    if (!/^[A-Za-z]+$/.test(value)) {
      return 'Username can only contain letters';
    }
    return '';
  };

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (value: string) => {
    if (!value) {
      return 'Password is required';
    }
    if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setGeneralError('');
    
    const usernameValidationError = validateUsername(username);
    const emailValidationError = validateEmail(email);
    const passwordValidationError = validatePassword(password);
    
    setUsernameError(usernameValidationError);
    setEmailError(emailValidationError);
    setPasswordError(passwordValidationError);
    
    if (usernameValidationError || emailValidationError || passwordValidationError) {
      return;
    }
    
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error(error.message);
      
      if (error.message.toLowerCase().includes('already registered') || 
          error.message.toLowerCase().includes('user already registered')) {
        setGeneralError('This email is already registered. Please login instead.');
      } else if (error.message.toLowerCase().includes('weak password')) {
        setPasswordError('Password is too weak. Please use a stronger password.');
      } else {
        setGeneralError(error.message);
      }
      
      setLoading(false);
      return;
    }

    const user = data.user;

    if (user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        username,
        email,
      });

      if (profileError) {
        console.error(profileError.message);
        
        if (profileError.code === '23505') {
          setGeneralError('Username or email already exists. Please use different credentials.');
        } else {
          setGeneralError('Error creating profile: ' + profileError.message);
        }
        
        setLoading(false);
        return;
      }
      
      window.location.href = '/dashboard';
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6 font-jakarta">
      <h2 className="text-center text-3xl font-bold text-white">
        Create an Account
      </h2>

      <form onSubmit={handleRegister} className="space-y-4">
        <Field>
          <FieldLabel className="text-white">Username</FieldLabel>
          <Input
            className={`rounded-3xl p-6 text-white ${
              usernameError ? 'border-2 border-red-500' : ''
            }`}
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => {
              const value = e.target.value;
             
              if (value === '' || /^[A-Za-z]+$/.test(value)) {
                setUsername(value);
                setUsernameError('');
                setGeneralError('');
              } else {
                setUsernameError('Username can only contain letters');
              }
            }}
            onBlur={() => {
              const error = validateUsername(username);
              setUsernameError(error);
            }}
          />
          {usernameError && (
            <p className="text-red-500 text-sm mt-1">{usernameError}</p>
          )}
        </Field>

        <Field>
          <FieldLabel className="text-white">Email</FieldLabel>
          <Input
            className={`rounded-3xl p-6 text-white ${
              emailError ? 'border-2 border-red-500' : ''
            }`}
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError('');
              setGeneralError('');
            }}
            onBlur={() => {
              const error = validateEmail(email);
              setEmailError(error);
            }}
          />
          {emailError && (
            <p className="text-red-500 text-sm mt-1">{emailError}</p>
          )}
        </Field>

        <Field>
          <FieldLabel className="text-white">Password</FieldLabel>
          <Input
            className={`rounded-3xl p-6 text-white ${
              passwordError ? 'border-2 border-red-500' : ''
            }`}
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError('');
              setGeneralError('');
            }}
            onBlur={() => {
              const error = validatePassword(password);
              setPasswordError(error);
            }}
          />
          {passwordError && (
            <p className="text-red-500 text-sm mt-1">{passwordError}</p>
          )}
        </Field>

        <Button
          type="submit"
          className="w-full h-12.5 rounded-3xl font-bold bg-white text-black"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Register'}
        </Button>

        {generalError && (
          <p className="text-red-500 text-sm mt-2 text-center">{generalError}</p>
        )}
      </form>

      <p className="text-center text-sm text-white/50">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-sm text-white hover:underline">
          Login here
        </Link>
      </p>
    </div>
  );
}