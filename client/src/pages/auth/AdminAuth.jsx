import React from 'react';
import { LoginPage } from '../login';

export function AdminAuth({ onAdminLoginSuccess }) {
  return (
    <LoginPage
      initialRole="admin"
      onLoginSuccess={(user) => onAdminLoginSuccess && onAdminLoginSuccess(user)}
      onNavigateToGis={() => { window.location.pathname = '/'; }}
    />
  );
}
