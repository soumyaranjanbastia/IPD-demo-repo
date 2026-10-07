import React from 'react';
import { Shield } from 'lucide-react';
import { hasPermission } from '../rbac';

export const ProtectedRoute = ({ role, module, action = 'read', children }) => {
  if (!hasPermission(role, module, action)) {
    return (
      <div className="card animate-fade-in" style={{ textAlign: 'center', padding: '60px' }}>
        <Shield size={64} color="hsl(var(--danger))" style={{ margin: '0 auto 20px' }} />
        <h2 style={{ color: 'hsl(var(--danger))' }}>Module Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>
          Your role (<strong style={{color: 'var(--text-primary)'}}>{role}</strong>) does not have <code>{module}.{action}</code> permission.
        </p>
      </div>
    );
  }
  return children;
};
