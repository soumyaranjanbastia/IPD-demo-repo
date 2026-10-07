import React, { useState } from 'react';
import { User, Phone, MapPin, Calendar as CalIcon, Shield, CreditCard, CheckCircle, FileText, AlertCircle, Heart, FileSignature, Bed } from 'lucide-react';
import { useGlobal } from '../context/GlobalState';
import AssignBedModal from '../components/AssignBedModal';

const WORKFLOW_STATES = ['PERSONAL_DETAILS', 'CONTACT_ADDRESS', 'IDENTITY_EMERGENCY', 'VISIT_INSURANCE', 'MEDICAL_INFO', 'CONSENT_FEE'];

export default function PatientRegistration({ role }) {
  const [workflowState, setWorkflowState] = useState(0); 
  const [patientData, setPatientData] = useState({
    paymentType: 'Self Pay'
  });
  const [newUhid, setNewUhid] = useState('');
  const [showAssignBedModal, setShowAssignBedModal] = useState(false);
  
  const { registerPatient, addToOpdQueue } = useGlobal();

  const canRegister = ['SUPER_ADMIN', 'RECEPTIONIST'].includes(role);

  if (!canRegister) {
    return (
      <div className="card animate-fade-in" style={{ textAlign: 'center', padding: '60px' }}>
        <Shield size={64} color="hsl(var(--danger))" style={{ margin: '0 auto 20px' }} />
        <h2 style={{ color: 'hsl(var(--danger))' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>
          Your role ({role}) does not have permission for `patient.create`.
        </p>
      </div>
    );
  }

  const handleChange = (field) => (e) => {
    setPatientData(prev => ({ ...prev, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  };

  const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDobChange = (e) => {
    const dob = e.target.value;
    setPatientData(prev => ({ ...prev, dob, age: calculateAge(dob) }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (workflowState < WORKFLOW_STATES.length) {
      if (workflowState === 5) {
        const uhid = registerPatient({
          name: `${patientData.firstName || ''} ${patientData.lastName || ''}`.trim() || 'New Patient',
          gender: patientData.gender || 'Male',
          age: patientData.age || 30,
          phone: patientData.phone || '+910000000000',
          bloodGroup: patientData.bloodGroup,
          maritalStatus: patientData.maritalStatus,
          city: patientData.city
        }, 'Current User', role);
        setNewUhid(uhid);
        
        const fee = patientData.registrationType === 'Emergency' ? 1200 : 650;
        addToOpdQueue(uhid, patientData.department || 'General Medicine', patientData.doctor || 'Dr. Smith', fee, 'Current User', role);
      }
      setWorkflowState(prev => prev + 1);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2>Comprehensive Patient Registration</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Real-time hospital registration workflow covering all HMS requirements.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '14px', left: '0', right: '0', height: '4px', background: 'var(--border-color)', zIndex: 0 }}></div>
          <div style={{ position: 'absolute', top: '14px', left: '0', width: `${(workflowState / (WORKFLOW_STATES.length)) * 100}%`, height: '4px', background: 'hsl(var(--primary-color))', zIndex: 0, transition: 'width 0.3s ease' }}></div>
          
          {WORKFLOW_STATES.map((state, index) => (
            <div key={state} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: '8px' }}>
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '50%', 
                background: index <= workflowState ? 'hsl(var(--primary-color))' : 'white',
                border: `2px solid ${index <= workflowState ? 'hsl(var(--primary-color))' : 'hsl(var(--border-color))'}`,
                color: index <= workflowState ? 'white' : 'hsl(var(--text-secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', transition: 'all 0.3s ease'
              }}>
                {index < workflowState ? <CheckCircle size={18} /> : index + 1}
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: index <= workflowState ? 'var(--text-primary)' : 'var(--text-secondary)', textTransform: 'capitalize' }}>
                {state.replace(/_/g, ' ').toLowerCase()}
              </span>
            </div>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: '8px' }}>
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '50%', 
                background: workflowState === 6 ? 'hsl(var(--success))' : 'white',
                border: `2px solid ${workflowState === 6 ? 'hsl(var(--success))' : 'hsl(var(--border-color))'}`,
                color: workflowState === 6 ? 'white' : 'hsl(var(--text-secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
              }}>
                <CheckCircle size={18} />
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: workflowState === 6 ? 'var(--success)' : 'var(--text-secondary)' }}>Done</span>
          </div>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleNext}>
          {workflowState === 0 && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color="var(--primary-color)" /> Personal Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <div className="input-group">
                  <label className="input-label">First Name *</label>
                  <input required type="text" className="input-field" placeholder="First Name" onChange={handleChange('firstName')} value={patientData.firstName || ''} />
                </div>
                <div className="input-group">
                  <label className="input-label">Middle Name</label>
                  <input type="text" className="input-field" placeholder="Middle Name" onChange={handleChange('middleName')} value={patientData.middleName || ''} />
                </div>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Last Name *</label>
                  <input required type="text" className="input-field" placeholder="Last Name" onChange={handleChange('lastName')} value={patientData.lastName || ''} />
                </div>
                
                <div className="input-group">
                  <label className="input-label">Gender *</label>
                  <select required className="input-field select-field" onChange={handleChange('gender')} value={patientData.gender || ''}>
                    <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Date of Birth *</label>
                  <input required type="date" className="input-field" onChange={handleDobChange} value={patientData.dob || ''} />
                </div>
                <div className="input-group">
                  <label className="input-label">Age (Auto)</label>
                  <input type="text" className="input-field" value={patientData.age || ''} disabled style={{ background: 'var(--bg-secondary)' }} />
                </div>
                <div className="input-group">
                  <label className="input-label">Blood Group</label>
                  <select className="input-field select-field" onChange={handleChange('bloodGroup')} value={patientData.bloodGroup || ''}>
                    <option value="">Select</option>
                    <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                    <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option><option>Unknown</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Marital Status</label>
                  <select className="input-field select-field" onChange={handleChange('maritalStatus')} value={patientData.maritalStatus || ''}>
                    <option value="">Select</option>
                    <option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option><option>Separated</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Occupation</label>
                  <input type="text" className="input-field" placeholder="Occupation" onChange={handleChange('occupation')} value={patientData.occupation || ''} />
                </div>
                <div className="input-group">
                  <label className="input-label">Nationality</label>
                  <input type="text" className="input-field" placeholder="e.g. Indian" onChange={handleChange('nationality')} value={patientData.nationality || ''} />
                </div>
                <div className="input-group">
                  <label className="input-label">Religion</label>
                  <input type="text" className="input-field" placeholder="Religion" onChange={handleChange('religion')} value={patientData.religion || ''} />
                </div>
              </div>
            </div>
          )}

          {workflowState === 1 && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} color="var(--primary-color)" /> Contact & Address
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <div className="input-group">
                  <label className="input-label">Mobile Number *</label>
                  <input required type="tel" className="input-field" placeholder="+91" onChange={handleChange('phone')} value={patientData.phone || ''} />
                </div>
                <div className="input-group">
                  <label className="input-label">Alternate Mobile</label>
                  <input type="tel" className="input-field" placeholder="+91" onChange={handleChange('altPhone')} value={patientData.altPhone || ''} />
                </div>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Email</label>
                  <input type="email" className="input-field" placeholder="Email Address" onChange={handleChange('email')} value={patientData.email || ''} />
                </div>

                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Address Line 1 *</label>
                  <input required type="text" className="input-field" placeholder="House/Flat No, Street" onChange={handleChange('address1')} value={patientData.address1 || ''} />
                </div>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Address Line 2 / Locality</label>
                  <input type="text" className="input-field" placeholder="Area / Locality" onChange={handleChange('address2')} value={patientData.address2 || ''} />
                </div>

                <div className="input-group">
                  <label className="input-label">City *</label>
                  <input required type="text" className="input-field" placeholder="City" onChange={handleChange('city')} value={patientData.city || ''} />
                </div>
                <div className="input-group">
                  <label className="input-label">District</label>
                  <input type="text" className="input-field" placeholder="District" onChange={handleChange('district')} value={patientData.district || ''} />
                </div>
                <div className="input-group">
                  <label className="input-label">State *</label>
                  <select required className="input-field select-field" onChange={handleChange('state')} value={patientData.state || ''}>
                    <option value="">Select State</option>
                    <option>Andhra Pradesh</option><option>Karnataka</option><option>Maharashtra</option><option>Delhi</option>
                    <option>Tamil Nadu</option><option>Uttar Pradesh</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Pincode * / Country *</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input required type="text" className="input-field" placeholder="PIN" style={{ flex: 1 }} onChange={handleChange('pincode')} value={patientData.pincode || ''} />
                    <input required type="text" className="input-field" defaultValue="India" disabled style={{ width: '80px', background: 'var(--bg-secondary)' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {workflowState === 2 && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} color="var(--primary-color)" /> Identity & Emergency Contact
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Identity Type</label>
                  <select className="input-field select-field" onChange={handleChange('idType')} value={patientData.idType || ''}>
                    <option value="">Select</option>
                    <option>Aadhaar</option><option>Passport</option><option>Driving Licence</option>
                    <option>Voter ID</option><option>PAN</option><option>Other</option>
                  </select>
                </div>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Identity Number</label>
                  <input type="text" className="input-field" placeholder="ID Number" onChange={handleChange('idNumber')} value={patientData.idNumber || ''} />
                </div>

                <div style={{ gridColumn: 'span 4', borderBottom: '1px solid var(--border-color)', margin: '10px 0' }}></div>

                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Emergency Contact Person *</label>
                  <input required type="text" className="input-field" placeholder="Full Name" onChange={handleChange('emrName')} value={patientData.emrName || ''} />
                </div>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Relationship *</label>
                  <select required className="input-field select-field" onChange={handleChange('emrRelation')} value={patientData.emrRelation || ''}>
                    <option value="">Select</option>
                    <option>Father</option><option>Mother</option><option>Spouse</option>
                    <option>Son</option><option>Daughter</option><option>Brother</option>
                    <option>Sister</option><option>Guardian</option><option>Other</option>
                  </select>
                </div>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Emergency Mobile Number *</label>
                  <input required type="tel" className="input-field" placeholder="+91" onChange={handleChange('emrPhone')} value={patientData.emrPhone || ''} />
                </div>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Emergency Alternate Number</label>
                  <input type="tel" className="input-field" placeholder="+91" onChange={handleChange('emrAltPhone')} value={patientData.emrAltPhone || ''} />
                </div>
              </div>
            </div>
          )}

          {workflowState === 3 && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalIcon size={20} color="var(--primary-color)" /> Visit & Insurance Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Registration Type *</label>
                  <select required className="input-field select-field" onChange={handleChange('registrationType')} value={patientData.registrationType || ''}>
                    <option value="">Select</option>
                    <option>OPD</option><option>Emergency</option><option>Walk-in</option>
                    <option>Referral</option><option>Follow-up</option><option>Health Check-up</option><option>Corporate</option>
                  </select>
                </div>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Referral Source</label>
                  <select className="input-field select-field" onChange={handleChange('referralSource')} value={patientData.referralSource || ''}>
                    <option value="">Select</option>
                    <option>Self</option><option>Existing Patient</option><option>Doctor Referral</option>
                    <option>Hospital Referral</option><option>Corporate</option><option>Insurance</option><option>Health Camp</option><option>Online</option>
                  </select>
                </div>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Department *</label>
                  <select required className="input-field select-field" onChange={handleChange('department')} value={patientData.department || ''}>
                    <option value="">Select</option>
                    <option>General Medicine</option><option>General Surgery</option><option>Cardiology</option>
                    <option>Orthopedics</option><option>Neurology</option><option>Pediatrics</option>
                    <option>Gynecology</option><option>ENT</option><option>Dermatology</option>
                  </select>
                </div>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Preferred Doctor</label>
                  <select className="input-field select-field" onChange={handleChange('doctor')} value={patientData.doctor || ''}>
                    <option value="">Select</option>
                    <option>Dr. Smith (Cardiology)</option><option>Dr. Jones (Orthopedics)</option><option>Dr. Williams (Medicine)</option>
                  </select>
                </div>

                <div style={{ gridColumn: 'span 4', borderBottom: '1px solid var(--border-color)', margin: '10px 0' }}></div>

                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Payment Type *</label>
                  <select required className="input-field select-field" onChange={handleChange('paymentType')} value={patientData.paymentType || 'Self Pay'}>
                    <option>Self Pay</option><option>Insurance</option><option>TPA</option>
                    <option>Corporate</option><option>Government Scheme</option><option>Credit</option>
                  </select>
                </div>

                {patientData.paymentType !== 'Self Pay' && (
                  <>
                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                      <label className="input-label">Provider Name (Insurance/TPA/Corporate) *</label>
                      <input required type="text" className="input-field" placeholder="Provider Name" onChange={handleChange('insuranceProvider')} value={patientData.insuranceProvider || ''} />
                    </div>
                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                      <label className="input-label">Policy Number / Employee ID *</label>
                      <input required type="text" className="input-field" placeholder="ID Number" onChange={handleChange('insuranceId')} value={patientData.insuranceId || ''} />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {workflowState === 4 && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Heart size={20} color="var(--primary-color)" /> Medical Information (Optional)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                <div className="input-group">
                  <label className="input-label">Known Allergies</label>
                  <textarea className="input-field" rows="2" placeholder="List any known allergies" onChange={handleChange('allergies')} value={patientData.allergies || ''}></textarea>
                </div>
                <div className="input-group">
                  <label className="input-label">Existing Medical Conditions</label>
                  <textarea className="input-field" rows="2" placeholder="e.g. Diabetes, Hypertension" onChange={handleChange('conditions')} value={patientData.conditions || ''}></textarea>
                </div>
                <div className="input-group">
                  <label className="input-label">Current Medications</label>
                  <textarea className="input-field" rows="2" placeholder="List current medications" onChange={handleChange('currentMeds')} value={patientData.currentMeds || ''}></textarea>
                </div>
                <div className="input-group">
                  <label className="input-label">Previous Hospitalization / Surgery</label>
                  <textarea className="input-field" rows="2" placeholder="Any relevant surgical or hospital history" onChange={handleChange('history')} value={patientData.history || ''}></textarea>
                </div>
              </div>
            </div>
          )}

          {workflowState === 5 && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSignature size={20} color="var(--primary-color)" /> Consent & Fee Collection
              </h3>
              
              <div className="card" style={{ background: 'var(--bg-secondary)', marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '16px' }}>Consents</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" required onChange={handleChange('consentTreatment')} checked={patientData.consentTreatment || false} />
                    <span style={{ fontSize: '0.9rem' }}>I provide consent to receive medical treatment. *</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" required onChange={handleChange('consentData')} checked={patientData.consentData || false} />
                    <span style={{ fontSize: '0.9rem' }}>I consent to the processing of my medical and personal data. *</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" onChange={handleChange('consentComm')} checked={patientData.consentComm || false} />
                    <span style={{ fontSize: '0.9rem' }}>I opt-in for SMS and WhatsApp communications regarding appointments and reports.</span>
                  </label>
                </div>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span>Consultation Fee</span>
                  <span style={{ fontWeight: 600 }}>₹{patientData.registrationType === 'Emergency' ? '1000.00' : '500.00'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span>Registration Fee</span>
                  <span style={{ fontWeight: 600 }}>₹{patientData.registrationType === 'Emergency' ? '200.00' : '150.00'}</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px dashed var(--border-color)', margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem' }}>
                  <strong>Total Amount</strong>
                  <strong style={{ color: 'hsl(var(--primary-color))' }}>₹{patientData.registrationType === 'Emergency' ? '1200.00' : '650.00'}</strong>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Payment Mode</label>
                <select className="input-field select-field" onChange={handleChange('paymentMode')} value={patientData.paymentMode || 'CASH'}>
                  <option>CASH</option><option>UPI</option><option>CREDIT CARD</option><option>INSURANCE/TPA</option>
                </select>
              </div>
            </div>
          )}
          
          {workflowState === 6 && (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'hsl(var(--success-bg))', color: 'hsl(var(--success))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle size={40} />
              </div>
              <h2>Registration Complete</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '32px', fontSize: '1.1rem' }}>
                Patient UHID: <strong style={{ color: 'var(--text-primary)' }}>{newUhid}</strong>
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => setShowAssignBedModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, hsl(var(--primary-color)), hsl(var(--accent-color)))' }}
                >
                  <Bed size={16} /> Assign Room & Bed to Patient
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => { setWorkflowState(0); setPatientData({ paymentType: 'Self Pay' }); setNewUhid(''); }}>
                  Register Another Patient
                </button>
              </div>
            </div>
          )}

          {workflowState < 6 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
              {workflowState > 0 && (
                <button type="button" className="btn btn-secondary" onClick={() => setWorkflowState(p => p - 1)}>
                  Back
                </button>
              )}
              <button type="submit" className="btn btn-primary">
                {workflowState === 5 ? 'Confirm & Complete Registration' : 'Next Step'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Direct Room & Bed Assignment Modal */}
      <AssignBedModal 
        isOpen={showAssignBedModal}
        onClose={() => setShowAssignBedModal(false)}
        initialUhid={newUhid}
        role={role}
      />
    </div>
  );
}
