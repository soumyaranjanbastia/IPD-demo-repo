import React, { useState, useEffect } from 'react';
import { 
  Bed, 
  User, 
  DoorClosed, 
  Building, 
  Clock, 
  CheckCircle, 
  X, 
  CreditCard, 
  AlertCircle, 
  Stethoscope, 
  Search,
  Check
} from 'lucide-react';
import { useGlobal } from '../context/GlobalState';

export default function AssignBedModal({ 
  isOpen, 
  onClose, 
  initialBedId = null, 
  initialUhid = null,
  role = 'SUPER_ADMIN'
}) {
  const { 
    patients = [], 
    wards = [], 
    rooms = [], 
    beds = [], 
    masters = {}, 
    assignBedToPatient 
  } = useGlobal();

  // Form states
  const [selectedUhid, setSelectedUhid] = useState(initialUhid || '');
  const [selectedWardId, setSelectedWardId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedBedId, setSelectedBedId] = useState(initialBedId || '');
  const [doctor, setDoctor] = useState('Dr. Smith (General Physician)');
  const [department, setDepartment] = useState('General Medicine');
  const [reasonId, setReasonId] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [estDays, setEstDays] = useState(3);
  const [estCost, setEstCost] = useState(15000);
  const [reqDeposit, setReqDeposit] = useState(5000);
  const [isDirectAdmission, setIsDirectAdmission] = useState(true); // true = Occupied, false = HELD
  const [notes, setNotes] = useState('');

  // Patient search filter inside modal
  const [patientSearch, setPatientSearch] = useState('');

  // If initialBedId changes or modal opens
  useEffect(() => {
    if (initialBedId) {
      setSelectedBedId(initialBedId);
      const bedObj = beds.find(b => b.id === initialBedId);
      if (bedObj) {
        if (bedObj.wardId) setSelectedWardId(bedObj.wardId);
        if (bedObj.roomId) setSelectedRoomId(bedObj.roomId);
        if (bedObj.chargePerDay) {
          setEstCost(bedObj.chargePerDay * 3);
          setReqDeposit(Math.round(bedObj.chargePerDay * 1.5));
        }
      }
    }
  }, [initialBedId, beds, isOpen]);

  useEffect(() => {
    if (initialUhid) {
      setSelectedUhid(initialUhid);
    }
  }, [initialUhid, isOpen]);

  if (!isOpen) return null;

  // Selected entities
  const selectedPatient = patients.find(p => p.uhid === selectedUhid);
  const selectedBed = beds.find(b => b.id === selectedBedId);
  const selectedWard = wards.find(w => w.id === (selectedWardId || selectedBed?.wardId));
  const selectedRoom = rooms.find(r => r.id === (selectedRoomId || selectedBed?.roomId));

  // Available beds for selection
  const availableBeds = beds.filter(b => {
    const isAvail = b.status === 'Available' || b.id === initialBedId;
    const matchesWard = !selectedWardId || b.wardId === selectedWardId;
    const matchesRoom = !selectedRoomId || b.roomId === selectedRoomId;
    return isAvail && matchesWard && matchesRoom;
  });

  // Filtered patients
  const filteredPatients = patients.filter(p => {
    if (!patientSearch) return true;
    const q = patientSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.uhid.toLowerCase().includes(q) || (p.phone && p.phone.includes(q));
  });

  const handleReasonChange = (e) => {
    const rId = e.target.value;
    setReasonId(rId);
    const reasonObj = masters?.admissionReasons?.find(r => r.id === rId);
    if (reasonObj) {
      setCustomReason(reasonObj.name);
      setEstDays(reasonObj.minStay || 3);
      setEstCost(reasonObj.estCost || 15000);
      setReqDeposit(Math.round((reasonObj.estCost * (reasonObj.depositPct || 50)) / 100));
    }
  };

  const handleBedChange = (e) => {
    const bId = e.target.value;
    setSelectedBedId(bId);
    const bedObj = beds.find(b => b.id === bId);
    if (bedObj) {
      if (bedObj.wardId) setSelectedWardId(bedObj.wardId);
      if (bedObj.roomId) setSelectedRoomId(bedObj.roomId);
      if (bedObj.chargePerDay && !reasonId) {
        setEstCost(bedObj.chargePerDay * estDays);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedUhid) return alert('Please select a patient to assign.');
    if (!selectedBedId) return alert('Please select an available bed.');

    const finalReason = customReason || 'Inpatient Observation';
    const res = assignBedToPatient({
      uhid: selectedUhid,
      bedId: selectedBedId,
      doctor,
      department: department || selectedWard?.name || 'General Medicine',
      reason: finalReason,
      estCost: Number(estCost),
      reqDeposit: Number(reqDeposit),
      isDirectAdmission,
      notes
    }, 'Current User', role);

    if (res.success) {
      alert(`Bed ${selectedBedId} successfully assigned to Patient ${selectedPatient?.name || selectedUhid}!`);
      onClose();
    }
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200,
        padding: '20px'
      }}
    >
      <div 
        style={{ 
          width: '740px', 
          maxWidth: '96vw', 
          maxHeight: '92vh', 
          overflowY: 'auto', 
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          padding: '24px'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(88, 101, 242, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--primary-color))' }}>
              <Bed size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>Assign Room & Bed to Patient</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Select patient, allocate hospital bed, and register inpatient admission.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* STEP 1: PATIENT SELECTION */}
          <div style={{ marginBottom: '18px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} color="hsl(var(--primary-color))" /> 1. Select Patient *
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px', alignItems: 'flex-start' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Choose Patient
                </label>
                <select 
                  required 
                  className="input-field select-field" 
                  value={selectedUhid} 
                  onChange={(e) => setSelectedUhid(e.target.value)}
                  style={{ height: '38px', padding: '0 10px', fontSize: '0.85rem' }}
                >
                  <option value="">-- Choose Registered Patient --</option>
                  {filteredPatients.map(p => (
                    <option key={p.uhid} value={p.uhid}>
                      {p.name} ({p.uhid}) • {p.gender}, {p.age}y
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Search Patient
                </label>
                <div style={{ position: 'relative' }}>
                  <Search size={14} color="var(--text-secondary)" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                  <input 
                    type="text" 
                    placeholder="Search UHID / Name..." 
                    className="input-field" 
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    style={{ height: '38px', padding: '0 10px 0 32px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            </div>

            {selectedPatient && (
              <div style={{ marginTop: '12px', background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '0.95rem', color: 'hsl(var(--primary-color))' }}>{selectedPatient.name}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>
                    ({selectedPatient.gender}, {selectedPatient.age} yrs)
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    UHID: <strong>{selectedPatient.uhid}</strong> • Phone: {selectedPatient.phone || 'N/A'}
                  </div>
                </div>
                <span className="badge success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={12} /> Selected
                </span>
              </div>
            )}
          </div>

          {/* STEP 2: WARD, ROOM & BED SELECTION */}
          <div style={{ marginBottom: '18px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bed size={16} color="hsl(var(--primary-color))" /> 2. Choose Ward, Room & Bed *
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>Ward</label>
                <select 
                  className="input-field select-field" 
                  value={selectedWardId} 
                  onChange={(e) => {
                    setSelectedWardId(e.target.value);
                    setSelectedRoomId('');
                    setSelectedBedId('');
                  }}
                  style={{ height: '38px', padding: '0 10px', fontSize: '0.85rem' }}
                >
                  <option value="">All Wards ({wards.length})</option>
                  {wards.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>Room</label>
                <select 
                  className="input-field select-field" 
                  value={selectedRoomId} 
                  onChange={(e) => {
                    setSelectedRoomId(e.target.value);
                    setSelectedBedId('');
                  }}
                  style={{ height: '38px', padding: '0 10px', fontSize: '0.85rem' }}
                >
                  <option value="">All Rooms</option>
                  {rooms
                    .filter(r => !selectedWardId || r.wardId === selectedWardId)
                    .map(r => (
                      <option key={r.id} value={r.id}>Room {r.roomNumber} ({r.roomType})</option>
                    ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>Available Bed *</label>
                <select 
                  required
                  className="input-field select-field" 
                  value={selectedBedId} 
                  onChange={handleBedChange}
                  style={{ height: '38px', padding: '0 10px', fontSize: '0.85rem' }}
                >
                  <option value="">-- Select Bed --</option>
                  {availableBeds.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.id} ({b.type}) — ₹{b.chargePerDay?.toLocaleString()}/d
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedBed && (
              <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'hsl(var(--success-bg))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--success))' }}>
                    <Bed size={18} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>Bed {selectedBed.id}</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>
                      {selectedBed.ward} {selectedBed.roomNumber ? `• Room ${selectedBed.roomNumber}` : ''} ({selectedBed.type})
                    </span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
                      Features: {selectedBed.features?.join(', ') || 'Standard Bed'}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '1rem', color: 'hsl(var(--primary-color))' }}>
                    ₹{selectedBed.chargePerDay?.toLocaleString()}
                  </strong>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>per day</div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: CLINICAL & FINANCIAL DETAILS */}
          <div style={{ marginBottom: '18px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Stethoscope size={16} color="hsl(var(--primary-color))" /> 3. Doctor & Admission Diagnosis
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>Attending Doctor *</label>
                <select 
                  className="input-field select-field" 
                  value={doctor} 
                  onChange={(e) => setDoctor(e.target.value)}
                  style={{ height: '38px', padding: '0 10px', fontSize: '0.85rem' }}
                >
                  <option value="Dr. Smith (General Physician)">Dr. Smith (General Physician)</option>
                  <option value="Dr. R. Adams (Intensivist/Cardio)">Dr. R. Adams (Intensivist/Cardio)</option>
                  <option value="Dr. Vikram Patel (ER / Surgeon)">Dr. Vikram Patel (ER / Surgeon)</option>
                  <option value="Dr. Ananya Roy (Pediatrician)">Dr. Ananya Roy (Pediatrician)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>Department *</label>
                <select 
                  className="input-field select-field" 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)}
                  style={{ height: '38px', padding: '0 10px', fontSize: '0.85rem' }}
                >
                  <option value="General Medicine">General Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Critical Care / ICU">Critical Care / ICU</option>
                  <option value="General Surgery">General Surgery</option>
                  <option value="Pediatrics">Pediatrics</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>Diagnosis Master</label>
                <select 
                  className="input-field select-field" 
                  value={reasonId} 
                  onChange={handleReasonChange}
                  style={{ height: '38px', padding: '0 10px', fontSize: '0.85rem' }}
                >
                  <option value="">-- Custom or Master Reason --</option>
                  {masters?.admissionReasons?.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} (Min {r.minStay}d • ₹{r.estCost.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>Diagnosis Details *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Acute Viral Fever" 
                  className="input-field" 
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  style={{ height: '38px', padding: '0 10px', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>Est. Stay (Days)</label>
                <input 
                  type="number" 
                  min="1" 
                  className="input-field" 
                  value={estDays}
                  onChange={(e) => {
                    const d = Number(e.target.value);
                    setEstDays(d);
                    if (selectedBed?.chargePerDay) setEstCost(selectedBed.chargePerDay * d);
                  }}
                  style={{ height: '38px', padding: '0 10px', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>Est. Total (₹)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={estCost}
                  onChange={(e) => setEstCost(e.target.value)}
                  style={{ height: '38px', padding: '0 10px', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>Required Deposit (₹)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={reqDeposit}
                  onChange={(e) => setReqDeposit(e.target.value)}
                  style={{ height: '38px', padding: '0 10px', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          {/* STEP 4: ASSIGNMENT MODE */}
          <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Admission Mode
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label 
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '8px',
                  padding: '10px 12px', borderRadius: '8px', border: isDirectAdmission ? '2px solid hsl(var(--primary-color))' : '1px solid #cbd5e1',
                  background: isDirectAdmission ? 'rgba(88, 101, 242, 0.05)' : '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <input 
                  type="radio" 
                  name="admMode" 
                  checked={isDirectAdmission} 
                  onChange={() => setIsDirectAdmission(true)}
                  style={{ marginTop: '2px' }}
                />
                <div>
                  <strong style={{ fontSize: '0.85rem' }}>Direct Formal Admission</strong>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Bed becomes <strong>Occupied</strong> immediately.
                  </div>
                </div>
              </label>

              <label 
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '8px',
                  padding: '10px 12px', borderRadius: '8px', border: !isDirectAdmission ? '2px solid #f59e0b' : '1px solid #cbd5e1',
                  background: !isDirectAdmission ? '#fffbeb' : '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <input 
                  type="radio" 
                  name="admMode" 
                  checked={!isDirectAdmission} 
                  onChange={() => setIsDirectAdmission(false)}
                  style={{ marginTop: '2px' }}
                />
                <div>
                  <strong style={{ fontSize: '0.85rem' }}>Reserve Bed (60-min Hold)</strong>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Bed placed in <strong>HELD</strong> pending deposit.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary btn-sm"
              disabled={!selectedUhid || !selectedBedId}
              style={{ padding: '8px 20px' }}
            >
              <CheckCircle size={16} />
              {isDirectAdmission ? 'Confirm & Assign Bed' : 'Hold Bed for Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
