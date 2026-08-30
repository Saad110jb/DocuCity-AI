import React from 'react';
import { LoginPage } from '../login';

export function OfficerAuth({ onNavigateToPortal, onLoginSuccess }) {
  const handleLogin = (user, role) => {
    if (onLoginSuccess) {
      onLoginSuccess(user);
    } else if (onNavigateToPortal) {
      onNavigateToPortal();
    }
  };

  return (
    <LoginPage
      initialRole="officer"
      onLoginSuccess={handleLogin}
      onNavigateToGis={() => { window.location.pathname = '/'; }}
    />
  );
}
