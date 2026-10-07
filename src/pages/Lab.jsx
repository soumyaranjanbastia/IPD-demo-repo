import React, { useState } from 'react';
import { TestTube, Eye, Trash2, X, ClipboardList } from 'lucide-react';
import { useGlobal } from '../context/GlobalState';
import { hasPermission } from '../rbac';

export default function Lab({ role }) {
  const { labOrders, processLabSample } = useGlobal();
  const canUpdate = hasPermission(role, 'lab', 'update');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [resultsForm, setResultsForm] = useState({});

  const handleNextState = (id, currentStatus) => {
    if (currentStatus === 'SAMPLE_PENDING') processLabSample(id, 'PROCESSING');
    else if (currentStatus === 'PROCESSING') {
      processLabSample(id, 'VERIFIED');
      setSelectedOrder(null);
    }
    else if (currentStatus === 'VERIFIED') {
      processLabSample(id, 'RELEASED');
      setSelectedOrder(null);
    }
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to cancel this lab order?')) {
      alert(`Lab Order ${id} cancelled (Mock action).`);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h2>Laboratory Module</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Test orders and sample verification workflow.</p>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TestTube size={20} color="var(--primary-color)" /> Pending Lab Tests
        </h3>
        
        <div className="table-container" style={{ marginTop: '24px' }}>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Patient UHID</th>
                <th>Tests</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {labOrders.map(l => (
                <tr key={l.id}>
                  <td>{l.id}</td>
                  <td>{l.uhid}</td>
                  <td>{l.tests.join(', ')}</td>
                  <td>
                    <span className={`badge ${l.status === 'RELEASED' ? 'success' : l.status === 'VERIFIED' ? 'primary' : 'warning'}`}>
                      {l.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {l.status === 'SAMPLE_PENDING' && canUpdate && (
                        <button className="btn btn-primary" onClick={() => handleNextState(l.id, l.status)} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>
                          Collect Sample
                        </button>
                      )}
                      
                      <button className="btn btn-secondary" onClick={() => setSelectedOrder(l)} style={{ padding: '4px 8px', fontSize: '0.8rem' }} title="View / Edit Details">
                        <Eye size={14} /> View
                      </button>

                      {canUpdate && l.status !== 'RELEASED' && (
                        <button className="btn btn-secondary" onClick={() => handleDelete(l.id)} style={{ padding: '4px 8px', fontSize: '0.8rem', color: 'hsl(var(--danger))', borderColor: 'hsl(var(--danger))' }} title="Cancel Order">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {labOrders.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>No pending lab orders.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card animate-fade-in" style={{ width: '550px', maxHeight: '90vh', overflowY: 'auto', background: 'white', position: 'relative', padding: '32px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <button 
              onClick={() => { setSelectedOrder(null); setResultsForm({}); }} 
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'hsl(var(--bg-secondary))', border: 'none', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} color="var(--text-secondary)" />
            </button>
            
            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', fontSize: '1.4rem' }}>
              <div style={{ padding: '8px', background: 'hsl(var(--primary-light))', borderRadius: '8px', color: 'var(--primary-color)', display: 'flex' }}>
                <ClipboardList size={24} />
              </div>
              Lab Order Details
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
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Date Ordered</div>
                <div style={{ fontWeight: 600 }}>{new Date(selectedOrder.date).toLocaleString()}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Status</div>
                <div>
                  <span className={`badge ${selectedOrder.status === 'RELEASED' ? 'success' : selectedOrder.status === 'VERIFIED' ? 'primary' : 'warning'}`}>
                    {selectedOrder.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
              <h4 style={{ marginBottom: '12px', fontSize: '1rem' }}>Requested Tests</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedOrder.tests.map((test, idx) => (
                  <li key={idx} style={{ fontWeight: 500 }}>{test}</li>
                ))}
              </ul>
            </div>

            {selectedOrder.status === 'PROCESSING' && canUpdate && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '12px', fontSize: '1rem', color: 'var(--primary-color)' }}>Enter Test Results</h4>
                {selectedOrder.tests.map((test, idx) => (
                  <div key={idx} className="input-group" style={{ marginBottom: '12px' }}>
                    <label className="input-label">{test} Result</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g. Normal, or numeric value" 
                      onChange={(e) => setResultsForm({ ...resultsForm, [test]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {selectedOrder.status === 'VERIFIED' && (
              <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'hsl(var(--success-bg))' }}>
                <h4 style={{ color: 'hsl(var(--success))', marginBottom: '8px' }}>Results Verified</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>These results have been verified by the lab technician and are awaiting final release to the patient's record.</p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => { setSelectedOrder(null); setResultsForm({}); }}>Close</button>
              
              {selectedOrder.status === 'PROCESSING' && canUpdate && (
                <button className="btn btn-primary" onClick={() => handleNextState(selectedOrder.id, 'PROCESSING')}>Verify Results</button>
              )}
              
              {selectedOrder.status === 'VERIFIED' && canUpdate && (
                <button className="btn btn-primary" onClick={() => handleNextState(selectedOrder.id, 'VERIFIED')}>Release Results</button>
              )}
              
              {selectedOrder.status === 'RELEASED' && (
                <button className="btn btn-primary" onClick={() => alert('Printing Lab Report...')}>Print Report</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
