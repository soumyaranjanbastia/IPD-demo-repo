import React from 'react';
import { useGlobal } from '../context/GlobalState';
import { Users, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { hasPermission } from '../rbac';

export default function Patients({ role }) {
  const { patients } = useGlobal();

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Patient Management</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Master list of all registered patients.</p>
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
                <th>Gender</th>
                <th>Age</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.uhid}>
                  <td style={{ fontWeight: 600 }}>{p.uhid}</td>
                  <td>{p.name}</td>
                  <td>{p.gender}</td>
                  <td>{p.age}</td>
                  <td>{p.phone}</td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>View Profile</button>
                  </td>
                </tr>
              ))}
              {patients.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>No patients found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
