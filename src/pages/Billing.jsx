import React, { useState } from 'react';
import { CreditCard, FileText, X } from 'lucide-react';
import { useGlobal } from '../context/GlobalState';
import { hasPermission } from '../rbac';

export default function Billing({ role }) {
  const { billing, collectPayment, payments } = useGlobal();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  const canUpdate = hasPermission(role, 'billing', 'update');

  const handleCollect = (id) => {
    collectPayment(id, 'Current User', role);
  };

  const getPaymentDetails = (invoiceId) => {
    return payments.find(p => p.invoiceId === invoiceId);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h2>Billing & Finance</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Invoices, Deposits, Payments, and Rate Cards.</p>
      </div>
      
      <div className="card">
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={20} color="var(--primary-color)" /> Patient Financial Account
        </h3>
        
        <div className="table-container" style={{ marginTop: '24px' }}>
          <table>
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Patient UHID</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {billing.map(b => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.uhid}</td>
                  <td>{b.type}</td>
                  <td>₹{b.amount.toLocaleString()}</td>
                  <td><span className={`badge ${b.status === 'PAID' ? 'success' : 'warning'}`}>{b.status}</span></td>
                  <td>
                    {b.status === 'PENDING' && canUpdate ? (
                      <button className="btn btn-primary" onClick={() => handleCollect(b.id)} style={{ padding: '4px 8px', fontSize: '0.8rem', marginRight: '8px' }}>Collect</button>
                    ) : null}
                    <button className="btn btn-secondary" onClick={() => setSelectedInvoice(b)} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>View</button>
                  </td>
                </tr>
              ))}
              {billing.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>No billing records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInvoice && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card animate-fade-in" style={{ width: '450px', background: 'white', position: 'relative', padding: '32px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <button 
              onClick={() => setSelectedInvoice(null)} 
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'hsl(var(--bg-secondary))', border: 'none', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
            >
              <X size={18} color="var(--text-secondary)" />
            </button>
            
            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', fontSize: '1.4rem' }}>
              <div style={{ padding: '8px', background: 'hsl(var(--primary-light))', borderRadius: '8px', color: 'var(--primary-color)', display: 'flex' }}>
                <FileText size={24} />
              </div>
              Invoice Details
            </h3>

            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Invoice ID:</span>
                <strong>{selectedInvoice.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Patient UHID:</span>
                <strong>{selectedInvoice.uhid}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Description:</span>
                <strong>{selectedInvoice.type}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Amount Due:</span>
                <strong>₹{selectedInvoice.amount.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                <span className={`badge ${selectedInvoice.status === 'PAID' ? 'success' : 'warning'}`}>{selectedInvoice.status}</span>
              </div>
            </div>

            {selectedInvoice.status === 'PAID' && getPaymentDetails(selectedInvoice.id) && (
              <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '16px', marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '12px' }}>Payment Receipt</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Receipt ID:</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{getPaymentDetails(selectedInvoice.id).id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Date:</span>
                  <span style={{ fontSize: '0.9rem' }}>{new Date(getPaymentDetails(selectedInvoice.id).date).toLocaleString()}</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedInvoice(null)}>Close</button>
              {selectedInvoice.status === 'PAID' && (
                <button className="btn btn-primary" onClick={() => alert('Printing Receipt...')}>Print Receipt</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
