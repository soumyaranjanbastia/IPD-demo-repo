import React, { useState } from 'react';
import { Pill, Eye, Trash2, X } from 'lucide-react';
import { useGlobal } from '../context/GlobalState';
import { hasPermission } from '../rbac';

export default function Pharmacy({ role }) {
  const { pharmacyOrders, dispenseMedicine } = useGlobal();
  const canUpdate = hasPermission(role, 'pharmacy', 'update');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this prescription?')) {
      alert(`Prescription ${id} deleted (Mock action).`);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h2>Pharmacy Module</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Prescription processing and dispensing workflow.</p>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Pill size={20} color="var(--primary-color)" /> Active Prescriptions
        </h3>
        
        <div className="table-container" style={{ marginTop: '24px' }}>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Patient UHID</th>
                <th>Medicines</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pharmacyOrders.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.uhid}</td>
                  <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.meds.join(', ')}</td>
                  <td><span className={`badge ${p.status === 'DISPENSED' ? 'success' : 'warning'}`}>{p.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {p.status === 'DISPENSING_PENDING' && canUpdate ? (
                        <button className="btn btn-primary" onClick={() => dispenseMedicine(p.id)} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Dispense</button>
                      ) : null}
                      <button className="btn btn-secondary" onClick={() => setSelectedOrder(p)} style={{ padding: '4px 8px', fontSize: '0.8rem' }} title="View Details">
                        <Eye size={14} /> View
                      </button>
                      {canUpdate && (
                        <button className="btn btn-secondary" onClick={() => handleDelete(p.id)} style={{ padding: '4px 8px', fontSize: '0.8rem', color: 'hsl(var(--danger))', borderColor: 'hsl(var(--danger))' }} title="Delete Order">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {pharmacyOrders.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>No active prescriptions.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card animate-fade-in" style={{ width: '500px', background: 'white', position: 'relative', padding: '32px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <button 
              onClick={() => setSelectedOrder(null)} 
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'hsl(var(--bg-secondary))', border: 'none', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} color="var(--text-secondary)" />
            </button>
            
            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', fontSize: '1.4rem' }}>
              <div style={{ padding: '8px', background: 'hsl(var(--primary-light))', borderRadius: '8px', color: 'var(--primary-color)', display: 'flex' }}>
                <Pill size={24} />
              </div>
              Prescription Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Order ID</div>
                <div style={{ fontWeight: 600 }}>{selectedOrder.id}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Patient UHID</div>
                <div style={{ fontWeight: 600 }}>{selectedOrder.uhid}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Date Prescribed</div>
                <div style={{ fontWeight: 600 }}>{new Date(selectedOrder.date).toLocaleString()}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Status</div>
                <div><span className={`badge ${selectedOrder.status === 'DISPENSED' ? 'success' : 'warning'}`}>{selectedOrder.status}</span></div>
              </div>
            </div>

            <h4 style={{ marginBottom: '12px' }}>Medicines Prescribed</h4>
            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedOrder.meds.map((med, idx) => (
                  <li key={idx} style={{ fontWeight: 500 }}>{med}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
              {selectedOrder.status === 'DISPENSING_PENDING' && canUpdate && (
                <button className="btn btn-primary" onClick={() => { dispenseMedicine(selectedOrder.id); setSelectedOrder(null); }}>Dispense Now</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
