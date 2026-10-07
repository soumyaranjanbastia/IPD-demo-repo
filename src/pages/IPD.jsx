import React, { useState } from 'react';
import { Bed, User, UserPlus, CheckCircle, AlertCircle, Clock, CreditCard, Activity, FileText, HeartPulse, Stethoscope, ArrowRightLeft, Layers } from 'lucide-react';
import { useGlobal } from '../context/GlobalState';
import { hasPermission } from '../rbac';
import WardBedManagement from './WardBedManagement';
import AssignBedModal from '../components/AssignBedModal';

export default function IPD({ role }) {
  const { beds, admissions, allocateBed, holdRoomAndRequestDeposit, patients, masters, vitals, doctorRounds, billing, recordVitals, recordDoctorRound, transferBed } = useGlobal();
  const [activeTab, setActiveTab] = useState('QUEUE'); // QUEUE, ACTIVE, WARD_MAP, IPD_360
  
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [processingState, setProcessingState] = useState(false);
  const [showAssignBedModal, setShowAssignBedModal] = useState(false);
  const [assignBedUhid, setAssignBedUhid] = useState(null);
  const [admissionForm, setAdmissionForm] = useState({});
  const [vitalsForm, setVitalsForm] = useState({});
  const [roundForm, setRoundForm] = useState({});
  const [isTransferring, setIsTransferring] = useState(false);

  const canUpdate = hasPermission(role, 'ipd', 'update');

  const pendingAdmissions = admissions.filter(a => a.status === 'PENDING');
  const activeAdmissions = admissions.filter(a => ['PAYMENT_PENDING', 'CONFIRMED', 'ADMITTED'].includes(a.status));

  const getPatientName = (uhid) => {
    const p = patients.find(pat => pat.uhid === uhid);
    return p ? p.name : 'Unknown';
  };

  const handleReasonChange = (e) => {
    const reasonId = e.target.value;
    const reason = masters.admissionReasons.find(r => r.id === reasonId);
    if (reason) {
      setAdmissionForm({
        ...admissionForm,
        reasonId,
        reasonName: reason.name,
        minStay: reason.minStay,
        estCost: reason.estCost,
        reqDeposit: (reason.estCost * reason.depositPct) / 100
      });
    }
  };

  const handleHoldAndRequest = (e) => {
    e.preventDefault();
    if(!admissionForm.bedId) return alert('Please select a bed to hold.');
    holdRoomAndRequestDeposit(selectedAdmission.id, admissionForm.bedId, {
      reason: admissionForm.reasonName,
      estCost: admissionForm.estCost,
      reqDeposit: admissionForm.reqDeposit
    }, 'Current User', role);
    setProcessingState(false);
    setSelectedAdmission(null);
    setActiveTab('ACTIVE');
  };

  const handleAllocate = (adm) => {
    allocateBed(adm.id, adm.bedId, 'Current User', role);
    alert('Patient formally admitted and bed allocated.');
  };

  const submitVitals = (e) => {
    e.preventDefault();
    recordVitals(selectedAdmission.id, selectedAdmission.uhid, vitalsForm, 'Nurse Priya', role);
    setVitalsForm({});
    alert('Vitals recorded.');
  };

  const submitRound = (e) => {
    e.preventDefault();
    recordDoctorRound(selectedAdmission.id, selectedAdmission.uhid, roundForm.notes, 1200, 'Dr. Smith', role);
    setRoundForm({});
    alert('Doctor round recorded and ₹1200 billed.');
  };

  const getRunningLedger = () => {
    if(!selectedAdmission) return { totalCharges: 0, deposit: 0, outstanding: 0 };
    const patientBills = billing.filter(b => b.uhid === selectedAdmission.uhid);
    const totalCharges = patientBills.filter(b => b.type !== 'IPD Deposit').reduce((acc, b) => acc + b.amount, 0);
    const deposit = selectedAdmission.reqDeposit || 0;
    return {
      totalCharges,
      deposit,
      outstanding: totalCharges > deposit ? totalCharges - deposit : 0
    };
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.65rem' }}>In-Patient Department (IPD)</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.875rem' }}>End-to-end IPD lifecycle management & patient hospitalization.</p>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ height: '38px', display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => {
            setAssignBedUhid(null);
            setShowAssignBedModal(true);
          }}
        >
          <UserPlus size={16} /> Assign Bed to Patient
        </button>
      </div>

      {/* Modern Pill Tab Navigation */}
      <div style={{ background: 'rgba(241, 245, 249, 0.8)', padding: '5px', borderRadius: '12px', display: 'inline-flex', gap: '4px', marginBottom: '22px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        <button 
          onClick={() => {setActiveTab('QUEUE'); setProcessingState(false);}}
          style={{
            padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: activeTab === 'QUEUE' ? 600 : 500,
            border: 'none', cursor: 'pointer',
            background: activeTab === 'QUEUE' ? '#ffffff' : 'transparent',
            color: activeTab === 'QUEUE' ? 'hsl(var(--primary-color))' : 'var(--text-secondary)',
            boxShadow: activeTab === 'QUEUE' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
          }}
        >
          Admission Queue ({pendingAdmissions.length})
        </button>
        <button 
          onClick={() => {setActiveTab('ACTIVE'); setProcessingState(false);}}
          style={{
            padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: activeTab === 'ACTIVE' ? 600 : 500,
            border: 'none', cursor: 'pointer',
            background: activeTab === 'ACTIVE' ? '#ffffff' : 'transparent',
            color: activeTab === 'ACTIVE' ? 'hsl(var(--primary-color))' : 'var(--text-secondary)',
            boxShadow: activeTab === 'ACTIVE' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
          }}
        >
          Active Inpatients & Holds ({activeAdmissions.length})
        </button>
        <button 
          onClick={() => {setActiveTab('WARD_MAP'); setProcessingState(false);}}
          style={{
            padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: activeTab === 'WARD_MAP' ? 600 : 500,
            border: 'none', cursor: 'pointer',
            background: activeTab === 'WARD_MAP' ? '#ffffff' : 'transparent',
            color: activeTab === 'WARD_MAP' ? 'hsl(var(--primary-color))' : 'var(--text-secondary)',
            boxShadow: activeTab === 'WARD_MAP' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
          }}
        >
          Ward Map
        </button>
        <button 
          onClick={() => {setActiveTab('SETUP'); setProcessingState(false);}}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: activeTab === 'SETUP' ? 600 : 500,
            border: 'none', cursor: 'pointer',
            background: activeTab === 'SETUP' ? '#ffffff' : 'transparent',
            color: activeTab === 'SETUP' ? 'hsl(var(--primary-color))' : 'var(--text-secondary)',
            boxShadow: activeTab === 'SETUP' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
          }}
        >
          <Layers size={16} /> Ward & Bed Setup
        </button>
      </div>

      {activeTab === 'QUEUE' && !processingState && (
        <div className="card">
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} color="var(--warning)" /> Pending IPD Recommendations
          </h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Request Date</th>
                  <th>Patient UHID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Recommending Doctor</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingAdmissions.map(a => (
                  <tr key={a.id}>
                    <td>{new Date(a.requestDate).toLocaleString()}</td>
                    <td>{a.uhid}</td>
                    <td>{getPatientName(a.uhid)}</td>
                    <td>{a.department}</td>
                    <td>{a.doctor}</td>
                    <td>
                      {canUpdate ? (
                        <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => { setSelectedAdmission(a); setProcessingState(true); }}>
                          Process Admission
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No Access</span>
                      )}
                    </td>
                  </tr>
                ))}
                {pendingAdmissions.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>No pending IPD recommendations.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'QUEUE' && processingState && selectedAdmission && (
        <div className="card animate-fade-in" style={{ borderTop: '4px solid hsl(var(--primary-color))' }}>
          <h3 style={{ marginBottom: '24px' }}>Process Admission: {selectedAdmission.uhid} ({getPatientName(selectedAdmission.uhid)})</h3>
          
          <form onSubmit={handleHoldAndRequest}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h4 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>1. Clinical Reason & Rate Card</h4>
                <div className="input-group">
                  <label className="input-label">Admission Reason / Diagnosis *</label>
                  <select required className="input-field select-field" onChange={handleReasonChange} value={admissionForm.reasonId || ''}>
                    <option value="">Select from Master</option>
                    {masters.admissionReasons.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                
                {admissionForm.reasonId && (
                  <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>Minimum Stay:</span> <strong>{admissionForm.minStay} Days</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>Estimated Cost:</span> <strong>₹{admissionForm.estCost.toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'hsl(var(--danger))' }}>
                      <span>Required Deposit:</span> <strong>₹{admissionForm.reqDeposit.toLocaleString()}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h4 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>2. Room & Bed Selection</h4>
                <div className="input-group">
                  <label className="input-label">Available Beds *</label>
                  <select required className="input-field select-field" onChange={(e) => setAdmissionForm({...admissionForm, bedId: e.target.value})}>
                    <option value="">Select an Available Bed</option>
                    {beds.filter(b => b.status === 'Available').map(b => (
                      <option key={b.id} value={b.id}>
                        {b.ward} {b.roomNumber ? `• Rm ${b.roomNumber}` : ''} • Bed {b.id} ({b.type}) — ₹{b.chargePerDay?.toLocaleString() || 1000}/day
                      </option>
                    ))}
                  </select>
                </div>
                {admissionForm.bedId && (
                  <div style={{ background: 'hsl(var(--warning-bg))', color: 'hsl(var(--warning))', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Clock size={24} />
                    <span style={{ fontSize: '0.9rem' }}>Proceeding will place a <strong>60-minute Hold</strong> on Bed {admissionForm.bedId} while the patient clears the ₹{admissionForm.reqDeposit.toLocaleString()} deposit at the Billing Desk.</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setProcessingState(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={!admissionForm.reasonId || !admissionForm.bedId}>
                Hold Room & Request Deposit
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'ACTIVE' && (
        <div className="card">
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--primary-color)" /> Active Inpatients & Holds
          </h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Admission ID</th>
                  <th>Patient UHID</th>
                  <th>Bed</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeAdmissions.map(a => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.uhid} <br/><span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>{getPatientName(a.uhid)}</span></td>
                    <td>{a.bedId}</td>
                    <td>{a.reason}</td>
                    <td>
                      <span className={`badge ${a.status === 'ADMITTED' ? 'success' : a.status === 'CONFIRMED' ? 'primary' : 'warning'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td>
                      {a.status === 'PAYMENT_PENDING' && (
                        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--warning))', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14}/> Awaiting Deposit
                        </span>
                      )}
                      {a.status === 'CONFIRMED' && canUpdate && (
                        <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => handleAllocate(a)}>
                          Allocate Bed
                        </button>
                      )}
                      {a.status === 'ADMITTED' && (
                        <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => { setSelectedAdmission(a); setActiveTab('IPD_360'); }}>
                          IPD 360° View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {activeAdmissions.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>No active admissions or holds.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'IPD_360' && selectedAdmission && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={24} color="var(--primary-color)"/> IPD 360° View: {selectedAdmission.uhid}
            </h3>
            <button className="btn btn-secondary" onClick={() => setActiveTab('ACTIVE')}>Back to Active List</button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h4 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Clinical Overview</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Patient Name</div>
                  <div style={{ fontWeight: 600 }}>{getPatientName(selectedAdmission.uhid)}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Admission Reason</div>
                  <div style={{ fontWeight: 600 }}>{selectedAdmission.reason}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Attending Doctor</div>
                  <div style={{ fontWeight: 600 }}>{selectedAdmission.doctor}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Admission Date</div>
                  <div style={{ fontWeight: 600 }}>{new Date(selectedAdmission.admissionDate).toLocaleString()}</div>
                </div>
              </div>

              <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HeartPulse size={18} color="hsl(var(--danger))"/> Record Vitals
                  </h4>
                  <form onSubmit={submitVitals} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input required type="text" className="input-field" placeholder="BP (e.g. 120/80)" value={vitalsForm.bp || ''} onChange={e => setVitalsForm({...vitalsForm, bp: e.target.value})} />
                    <input required type="text" className="input-field" placeholder="Pulse (bpm)" value={vitalsForm.pulse || ''} onChange={e => setVitalsForm({...vitalsForm, pulse: e.target.value})} />
                    <button type="submit" className="btn btn-secondary" style={{ color: 'hsl(var(--danger))', borderColor: 'hsl(var(--danger))' }}>Save Vitals</button>
                  </form>
                  <div style={{ marginTop: '12px', maxHeight: '150px', overflowY: 'auto' }}>
                    {vitals.filter(v => v.admissionId === selectedAdmission.id).map(v => (
                      <div key={v.id} style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                        <strong>{new Date(v.time).toLocaleTimeString()}</strong> - BP: {v.bp}, Pulse: {v.pulse} ({v.nurse})
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Stethoscope size={18} color="var(--primary-color)"/> Doctor Round
                  </h4>
                  <form onSubmit={submitRound} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <textarea required className="input-field" rows="2" placeholder="Clinical notes/observations..." value={roundForm.notes || ''} onChange={e => setRoundForm({...roundForm, notes: e.target.value})}></textarea>
                    <button type="submit" className="btn btn-primary">Record Round (Bills ₹1200)</button>
                  </form>
                  <div style={{ marginTop: '12px', maxHeight: '150px', overflowY: 'auto' }}>
                    {doctorRounds.filter(r => r.admissionId === selectedAdmission.id).map(r => (
                      <div key={r.id} style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                        <strong>{new Date(r.time).toLocaleTimeString()}</strong> - {r.notes} ({r.doctor})
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '24px', background: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bed size={20} /> Current Location
                </h4>
                <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => setIsTransferring(!isTransferring)}>
                  <ArrowRightLeft size={14}/> Transfer
                </button>
              </div>
              <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--primary-color)' }}>Bed {selectedAdmission.bedId}</div>
                <div style={{ color: 'var(--text-secondary)' }}>Status: Occupied</div>
                
                {isTransferring && (
                  <div style={{ marginTop: '12px', padding: '12px', borderTop: '1px dashed var(--border-color)' }}>
                    <select className="input-field select-field" onChange={(e) => { transferBed(selectedAdmission.id, e.target.value, 'Admin', role); setIsTransferring(false); alert('Bed Transferred!'); }}>
                      <option value="">Select Target Bed...</option>
                      {beds.filter(b => b.status === 'Available').map(b => (
                        <option key={b.id} value={b.id}>
                          {b.ward} {b.roomNumber ? `• Rm ${b.roomNumber}` : ''} • Bed {b.id} ({b.type})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={20} /> Running Billing Ledger
              </h4>
              <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Est. Total Package:</span>
                  <strong style={{ fontSize: '0.9rem' }}>₹{selectedAdmission.estCost?.toLocaleString()}</strong>
                </div>
                <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px dashed var(--border-color)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Total Charges Incurred:</span>
                  <strong>₹{getRunningLedger().totalCharges.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'hsl(var(--success))' }}>
                  <span>Deposit Paid:</span>
                  <strong>₹{getRunningLedger().deposit.toLocaleString()}</strong>
                </div>
                <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px dashed var(--border-color)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', color: getRunningLedger().outstanding > 0 ? 'hsl(var(--danger))' : 'inherit' }}>
                  <strong>Outstanding:</strong>
                  <strong>₹{getRunningLedger().outstanding.toLocaleString()}</strong>
                </div>
                {getRunningLedger().outstanding > 0 && (
                  <button className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>Request Additional Deposit</button>
                )}
                <button className="btn btn-secondary" style={{ width: '100%', marginTop: '8px', background: 'hsl(var(--danger))', color: 'white', borderColor: 'hsl(var(--danger))' }}>Initiate Discharge</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'WARD_MAP' && (
        <div className="card animate-fade-in">
          <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bed size={20} color="var(--primary-color)" /> Ward Overview
          </h3>
          <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'hsl(var(--success-bg))', border: '1px solid hsl(var(--success))' }}></div><span style={{ fontSize: '0.85rem' }}>Available</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'hsl(var(--warning-bg))', border: '1px solid hsl(var(--warning))' }}></div><span style={{ fontSize: '0.85rem' }}>HELD (Awaiting Payment)</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'hsl(var(--danger-bg))', border: '1px solid hsl(var(--danger))' }}></div><span style={{ fontSize: '0.85rem' }}>Occupied</span></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {beds.map(bed => (
              <div 
                key={bed.id} 
                style={{ 
                  padding: '20px', 
                  border: `2px solid ${ bed.status === 'Occupied' ? 'hsl(var(--danger))' : bed.status === 'HELD' ? 'hsl(var(--warning))' : 'hsl(var(--success))' }`, 
                  borderRadius: '12px', 
                  textAlign: 'center', 
                  background: bed.status === 'Occupied' ? 'hsl(var(--danger-bg))' : bed.status === 'HELD' ? 'hsl(var(--warning-bg))' : 'hsl(var(--success-bg))',
                  position: 'relative'
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '4px', background: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {bed.ward} ({bed.type})
                </div>
                <Bed size={32} color={bed.status === 'Occupied' ? 'hsl(var(--danger))' : bed.status === 'HELD' ? 'hsl(var(--warning))' : 'hsl(var(--success))'} style={{ margin: '24px auto 12px' }} />
                <strong style={{ display: 'block', fontSize: '1.2rem' }}>{bed.id}</strong>
                <div style={{ fontSize: '0.85rem', marginTop: '8px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  {bed.status === 'Occupied' ? `Occupied: ${bed.uhid}` : bed.status === 'HELD' ? `Held for: ${bed.uhid}` : bed.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'SETUP' && (
        <WardBedManagement role={role} />
      )}

      {/* Assign Room & Bed to Patient Modal */}
      <AssignBedModal 
        isOpen={showAssignBedModal}
        onClose={() => {
          setShowAssignBedModal(false);
          setAssignBedUhid(null);
        }}
        initialUhid={assignBedUhid}
        role={role}
      />
    </div>
  );
}
