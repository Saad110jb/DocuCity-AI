import React from 'react';
import { LoginPage } from '../login';

export function CitizenAuth({ onNavigateToGis, onLoginSuccess }) {
  return (
    <LoginPage
      initialRole="citizen"
      onLoginSuccess={(user) => onLoginSuccess && onLoginSuccess(user)}
      onNavigateToGis={onNavigateToGis || (() => { window.location.pathname = '/'; })}
    />
  );
}
