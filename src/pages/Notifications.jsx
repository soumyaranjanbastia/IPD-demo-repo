import React from 'react';
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useGlobal } from '../context/GlobalState';

export default function Notifications({ role }) {
  const { notifications } = useGlobal();

  const getIcon = (type) => {
    switch(type) {
      case 'SUCCESS': return <CheckCircle size={20} color="hsl(var(--success))" />;
      case 'ERROR': return <AlertCircle size={20} color="hsl(var(--danger))" />;
      default: return <Info size={20} color="hsl(var(--primary-color))" />;
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h2>Notification Center</h2>
        <p style={{ color: 'var(--text-secondary)' }}>System alerts and updates.</p>
      </div>

      <div className="card" style={{ maxWidth: '800px' }}>
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={20} /> Recent Notifications
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map(n => (
            <div key={n.id} style={{ 
              padding: '16px', 
              border: '1px solid var(--border-color)', 
              borderRadius: '12px',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start',
              background: n.read ? 'transparent' : 'var(--bg-secondary)'
            }}>
              <div style={{ marginTop: '2px' }}>{getIcon(n.type)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '1rem' }}>{n.title}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {new Date(n.timestamp).toLocaleString()}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{n.message}</p>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <Bell size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
              <p>You have no notifications.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
