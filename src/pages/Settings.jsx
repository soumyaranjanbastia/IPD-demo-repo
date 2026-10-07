import React, { useState } from 'react';
import { Settings as SettingsIcon, Database, Key, Sliders, Shield, Users, Bed, CreditCard } from 'lucide-react';
import { useGlobal } from '../context/GlobalState';

export default function Settings({ role }) {
  const { masters } = useGlobal();
  const [activeTab, setActiveTab] = useState('MASTER_DATA');

  if (role !== 'SUPER_ADMIN' && role !== 'HOSPITAL_ADMIN') {
    return (
      <div className="card animate-fade-in" style={{ textAlign: 'center', padding: '60px' }}>
        <Shield size={64} color="hsl(var(--danger))" style={{ margin: '0 auto 20px' }} />
        <h2 style={{ color: 'hsl(var(--danger))' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>
          You do not have administrative privileges to access System Settings.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h2>System Configuration & Master Data</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Configure hospital rules, pricing, and operational settings.</p>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button className={`btn ${activeTab === 'MASTER_DATA' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start' }} onClick={() => setActiveTab('MASTER_DATA')}>
            <Database size={18} /> Master Data Lists
          </button>
          <button className={`btn ${activeTab === 'IPD_CONFIG' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start' }} onClick={() => setActiveTab('IPD_CONFIG')}>
            <Bed size={18} /> IPD & Bed Rules
          </button>
          <button className={`btn ${activeTab === 'BILLING_CONFIG' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start' }} onClick={() => setActiveTab('BILLING_CONFIG')}>
            <CreditCard size={18} /> Financial & Billing
          </button>
          <button className={`btn ${activeTab === 'RBAC' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start' }} onClick={() => setActiveTab('RBAC')}>
            <Key size={18} /> Role-Based Access
          </button>
        </div>

        <div style={{ flex: 1 }}>
          {activeTab === 'MASTER_DATA' && (
            <div className="animate-fade-in">
              <div className="card" style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '16px' }}>Admission Reasons & Rate Cards</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Condition / Reason</th>
                        <th>Min. Stay</th>
                        <th>Estimated Package Cost</th>
                        <th>Req. Deposit %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {masters?.admissionReasons?.map(r => (
                        <tr key={r.id}>
                          <td>{r.id}</td>
                          <td><strong>{r.name}</strong></td>
                          <td>{r.minStay} Days</td>
                          <td>₹{r.estCost.toLocaleString()}</td>
                          <td><span className="badge primary">{r.depositPct}%</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3>Database Operations</h3>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px' }}>
                  <Database size={24} color="var(--primary-color)" />
                  <div>
                    <h4 style={{ marginBottom: '4px' }}>Load System Demo Data</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Inject sample patients, admissions, lab orders, pharmacy orders, and billing records into the local state.</p>
                  </div>
                  <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => { 
                    import('../store/useStore').then(module => {
                      module.default.getState().injectDemoData();
                      alert('Demo data injected successfully! Navigate to modules to view it.');
                    });
                  }}>
                    Inject Demo Data
                  </button>
                </div>
              </div>
              
              <div className="card">
                <h3 style={{ marginBottom: '16px' }}>Room Type Classifications</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Room Classification</th>
                        <th>Daily Rate Charge</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {masters?.roomTypes?.map(r => (
                        <tr key={r.id}>
                          <td>{r.id}</td>
                          <td><strong>{r.name}</strong></td>
                          <td>₹{r.chargePerDay.toLocaleString()} / day</td>
                          <td><span className="badge success">Active</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'IPD_CONFIG' && (
            <div className="card animate-fade-in">
              <h3 style={{ marginBottom: '24px' }}>In-Patient Operational Rules</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="input-group">
                  <label className="input-label">Bed Hold Duration (Minutes)</label>
                  <input type="number" className="input-field" defaultValue="60" />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Time before an unpaid held bed expires.</p>
                </div>
                
                <div className="input-group">
                  <label className="input-label">Automatic Housekeeping Notification</label>
                  <select className="input-field select-field" defaultValue="YES">
                    <option value="YES">Yes - On Patient Discharge</option>
                    <option value="NO">No - Manual Request Only</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Multi-Department Clearance Sequence</label>
                  <select className="input-field select-field" defaultValue="PARALLEL">
                    <option value="STRICT">Strict (Doctor → Nurse → Pharmacy → Billing)</option>
                    <option value="PARALLEL">Parallel (Any order, all required)</option>
                  </select>
                </div>
              </div>
              
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={() => alert('IPD Configuration Saved!')}>Save Changes</button>
              </div>
            </div>
          )}
          
          {activeTab === 'BILLING_CONFIG' && (
            <div className="card animate-fade-in">
              <h3 style={{ marginBottom: '24px' }}>Financial & Billing Rules</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="input-group">
                  <label className="input-label">Additional Deposit Threshold (%)</label>
                  <input type="number" className="input-field" defaultValue="90" />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Triggers an alert when incurred charges hit this % of the paid deposit.</p>
                </div>

                <div className="input-group">
                  <label className="input-label">Maker-Checker Threshold (₹)</label>
                  <input type="number" className="input-field" defaultValue="100000" />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Discounts over this amount require Admin approval.</p>
                </div>
                
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Supported Payment Methods</label>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <label><input type="checkbox" defaultChecked /> Cash</label>
                    <label><input type="checkbox" defaultChecked /> Credit Card</label>
                    <label><input type="checkbox" defaultChecked /> UPI</label>
                    <label><input type="checkbox" defaultChecked /> Insurance / TPA</label>
                    <label><input type="checkbox" /> Government Scheme</label>
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={() => alert('Billing Configuration Saved!')}>Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === 'RBAC' && (
            <div className="card animate-fade-in">
              <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={20} /> RBAC Editor (Preview)
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Modify specific granular permissions for roles across modules.</p>
              
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
{`// CURRENT ROLE PROFILES
"RECEPTIONIST": {
  opd: ["create", "read", "update"],
  billing: ["read", "create"]
},
"DOCTOR": {
  consultation: ["read", "update"],
  ipd: ["read", "update"],
  pharmacy: ["create"],
  lab: ["create"]
},
"NURSE": {
  ipd: ["read", "update"],
  pharmacy: ["read"]
}`}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
