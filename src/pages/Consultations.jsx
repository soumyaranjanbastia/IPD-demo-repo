import React, { useState } from 'react';
import { FileText, Stethoscope, FilePlus, ChevronRight } from 'lucide-react';
import { hasPermission } from '../rbac';
import { useGlobal } from '../context/GlobalState';

export default function Consultations({ role }) {
  const { opdQueue, updateOpdStatus, orderLabTest, orderPharmacy, admitToIpd } = useGlobal();
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [consultationState, setConsultationState] = useState('WAITING');
  
  const [complaint, setComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [labTests, setLabTests] = useState('');
  const [medicines, setMedicines] = useState('');
  
  const canFinalize = hasPermission(role, 'consultation', 'update');

  const startConsultation = (item) => {
    setActiveConsultation(item);
    setConsultationState('IN_PROGRESS');
    setComplaint('');
    setDiagnosis('');
    setLabTests('');
    setMedicines('');
    updateOpdStatus(item.id, 'IN_PROGRESS');
  };

  const finalize = () => {
    if (labTests) orderLabTest(activeConsultation.uhid, labTests.split(',').map(t => t.trim()));
    if (medicines) orderPharmacy(activeConsultation.uhid, medicines.split(',').map(m => m.trim()));
    
    // In a full implementation, complaint and diagnosis would be saved to patient history here.
    
    updateOpdStatus(activeConsultation.id, 'COMPLETED');
    setActiveConsultation(null);
    setComplaint('');
    setDiagnosis('');
    setLabTests('');
    setMedicines('');
  };

  const recommendIpd = () => {
    admitToIpd(activeConsultation.uhid, activeConsultation.doctor, activeConsultation.department, 'Current User', role);
    updateOpdStatus(activeConsultation.id, 'IPD_ADMITTED');
    setActiveConsultation(null);
  };

  const myQueue = opdQueue.filter(q => q.status !== 'COMPLETED' && q.status !== 'IPD_ADMITTED');

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h2>Doctor Consultation</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Module for OPD and IPD Consultations.</p>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Stethoscope size={18} /> My Queue
            </h4>
            {myQueue.map(item => (
              <div key={item.id} onClick={() => startConsultation(item)} style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer', background: activeConsultation?.id === item.id ? 'hsl(var(--primary-color))' : 'var(--bg-primary)', color: activeConsultation?.id === item.id ? 'white' : 'inherit' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong>{item.uhid}</strong>
                  <span className={`badge ${item.status === 'WAITING' ? 'warning' : 'primary'}`} style={{ fontSize: '0.6rem' }}>{item.status}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: activeConsultation?.id === item.id ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}>{item.department} • {item.time}</div>
              </div>
            ))}
            {myQueue.length === 0 && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Queue is empty.</p>}
          </div>
        </div>

        <div className="card" style={{ flex: 1 }}>
          {activeConsultation ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div>
                  <h3>Patient {activeConsultation.uhid}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{activeConsultation.department} • {activeConsultation.doctor}</p>
                </div>
                <div className="badge primary">State: {consultationState.replace(/_/g, ' ')}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Chief Complaint & History</label>
                  <textarea className="input-field" rows="3" placeholder="Patient complains of..." value={complaint} onChange={e => setComplaint(e.target.value)} disabled={!canFinalize}></textarea>
                </div>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Clinical Findings & Diagnosis</label>
                  <textarea className="input-field" rows="3" placeholder="Provisional diagnosis..." value={diagnosis} onChange={e => setDiagnosis(e.target.value)} disabled={!canFinalize}></textarea>
                </div>
                <div className="input-group">
                  <label className="input-label">Order Lab Tests (comma separated)</label>
                  <input type="text" className="input-field" placeholder="e.g. CBC, Lipid Profile" value={labTests} onChange={e => setLabTests(e.target.value)} disabled={!canFinalize} />
                </div>
                <div className="input-group">
                  <label className="input-label">Prescribe Medicines (comma separated)</label>
                  <input type="text" className="input-field" placeholder="e.g. Paracetamol 500mg" value={medicines} onChange={e => setMedicines(e.target.value)} disabled={!canFinalize} />
                </div>
              </div>

              {canFinalize && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                  <button className="btn btn-secondary" onClick={recommendIpd}>Recommend IPD Admission</button>
                  <button className="btn btn-primary" onClick={finalize}>Finalize Consultation</button>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
              <Stethoscope size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <h3>Select a patient from the queue to start consultation.</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
