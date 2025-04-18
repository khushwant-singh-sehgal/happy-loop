'use client';

import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

export default function AltLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto', backgroundColor: 'white' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Simple Login Test</h1>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Email:
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.5rem' }}
              required
            />
          </label>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Password:
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.5rem' }}
              required
            />
          </label>
        </div>
        
        <button 
          type="submit"
          style={{ 
            backgroundColor: 'blue', 
            color: 'white', 
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer'
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
} 