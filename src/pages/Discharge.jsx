import React from 'react';
import { LogOut } from 'lucide-react';
import { hasPermission } from '../rbac';
import { useGlobal } from '../context/GlobalState';

export default function Discharge({ role }) {
  const { discharges, clearDischarge, finalizeDischarge } = useGlobal();
  const canApprove = hasPermission(role, 'discharge', 'update');

  const handleClearance = (uhid, dept, current) => {
    if (canApprove && current === 'Pending') {
      clearDischarge(uhid, dept);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h2>Discharge Workflow</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Multi-stage state machine for patient clearances and discharge.</p>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LogOut size={20} color="var(--primary-color)" /> Pending Clearances
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
          {discharges.map(d => (
            <div key={d.id} style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '1.1rem' }}>Patient ({d.uhid})</strong>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '0.85rem' }}>
                  <span className={`badge ${d.doctor === 'Cleared' ? 'success' : 'warning'}`} style={{ cursor: canApprove ? 'pointer' : 'default' }} onClick={() => handleClearance(d.uhid, 'doctor', d.doctor)}>Doctor: {d.doctor}</span>
                  <span className={`badge ${d.nursing === 'Cleared' ? 'success' : 'warning'}`} style={{ cursor: canApprove ? 'pointer' : 'default' }} onClick={() => handleClearance(d.uhid, 'nursing', d.nursing)}>Nursing: {d.nursing}</span>
                  <span className={`badge ${d.billing === 'Cleared' ? 'success' : 'warning'}`} style={{ cursor: canApprove ? 'pointer' : 'default' }} onClick={() => handleClearance(d.uhid, 'billing', d.billing)}>Billing: {d.billing}</span>
                </div>
              </div>
              {canApprove && d.doctor === 'Cleared' && d.nursing === 'Cleared' && d.billing === 'Cleared' ? (
                <button className="btn btn-primary" onClick={() => finalizeDischarge(d.uhid)}>Finalize Discharge</button>
              ) : (
                <button className="btn btn-secondary" disabled>Clearances Pending</button>
              )}
            </div>
          ))}
          {discharges.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>No pending discharges. To request a discharge, use the Doctor Consultations module or IPD Module.</div>
          )}
        </div>
      </div>
    </div>
  );
}
