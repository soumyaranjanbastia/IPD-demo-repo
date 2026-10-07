import React, { useState } from 'react';
import { ShieldAlert, Search, Filter } from 'lucide-react';
import { useGlobal } from '../context/GlobalState';
import { hasPermission } from '../rbac';

export default function AuditLogs({ role }) {
  const { auditLogs } = useGlobal();
  const [searchTerm, setSearchTerm] = useState('');

  const canView = role === 'SUPER_ADMIN' || role === 'HOSPITAL_ADMIN';

  if (!canView) {
    return (
      <div className="card animate-fade-in" style={{ textAlign: 'center', padding: '60px' }}>
        <ShieldAlert size={64} color="hsl(var(--danger))" style={{ margin: '0 auto 20px' }} />
        <h2 style={{ color: 'hsl(var(--danger))' }}>Access Restricted</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>
          You do not have permission to view Audit Logs.
        </p>
      </div>
    );
  }

  const filteredLogs = auditLogs.filter(log => 
    log.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Audit & Security Logs</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Immutable ledger of system activities.</p>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Search by ID, Module, or Action..." 
                style={{ paddingLeft: '40px' }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <button className="btn btn-secondary"><Filter size={16} /> Filters</button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Log ID</th>
                <th>User / Role</th>
                <th>Module</th>
                <th>Action</th>
                <th>Entity ID</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{log.id}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{log.user}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{log.role}</div>
                  </td>
                  <td><span className="badge primary" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{log.module}</span></td>
                  <td>
                    <span className={`badge ${log.action === 'CREATE' ? 'success' : log.action === 'DELETE' ? 'danger' : 'primary'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.entityId}</td>
                  <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.details}>
                    {log.details}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    No audit logs found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
