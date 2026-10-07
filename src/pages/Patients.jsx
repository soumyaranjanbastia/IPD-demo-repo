import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalState';
import { Users, UserPlus, Bed, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { hasPermission } from '../rbac';
import AssignBedModal from '../components/AssignBedModal';

export default function Patients({ role }) {
  const { patients, beds = [], admissions = [] } = useGlobal();
  const navigate = useNavigate();

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPatientUhid, setSelectedPatientUhid] = useState(null);

  const getPatientBed = (uhid) => {
    return beds.find(b => b.uhid === uhid);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Patient Directory & Management</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Master list of all registered patients with Inpatient Bed Assignment.</p>
        </div>
        {hasPermission(role, 'opd', 'create') && (
          <Link to="/registration" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <UserPlus size={16} /> New Patient
          </Link>
        )}
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>UHID</th>
                <th>Patient Name</th>
                <th>Gender / Age</th>
                <th>Contact</th>
                <th>Current Inpatient Bed</th>
                <th className="actions-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => {
                const bed = getPatientBed(p.uhid);

                return (
                  <tr key={p.uhid}>
                    <td style={{ fontWeight: 600, color: 'hsl(var(--primary-color))' }}>{p.uhid}</td>
                    <td>
                      <strong>{p.name}</strong>
                    </td>
                    <td>{p.gender}, {p.age} yrs</td>
                    <td>{p.phone || 'N/A'}</td>
                    <td>
                      {bed ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className={`badge ${bed.status === 'Occupied' ? 'danger' : 'warning'}`}>
                            {bed.status}: Bed {bed.id}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            ({bed.ward})
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No Bed Assigned</span>
                      )}
                    </td>
                    <td className="actions-cell">
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {!bed ? (
                          <button 
                            className="btn btn-primary btn-sm" 
                            onClick={() => {
                              setSelectedPatientUhid(p.uhid);
                              setShowAssignModal(true);
                            }}
                          >
                            <Bed size={14} /> Assign Bed
                          </button>
                        ) : (
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => navigate('/ipd')}
                          >
                            IPD 360°
                          </button>
                        )}
                        <button className="btn btn-secondary btn-sm">
                          Profile
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {patients.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    No registered patients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Bed Modal */}
      <AssignBedModal 
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedPatientUhid(null);
        }}
        initialUhid={selectedPatientUhid}
        role={role}
      />
    </div>
  );
}
