import React, { useState } from 'react';
import { Calendar as CalIcon, PlusCircle, CheckCircle, XCircle } from 'lucide-react';
import { useGlobal } from '../context/GlobalState';
import { hasPermission } from '../rbac';

export default function Appointments({ role }) {
  const { appointments, createAppointment, patients } = useGlobal();
  const canCreate = hasPermission(role, 'appointment', 'create');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    createAppointment({
      ...formData,
      uhid: formData.uhid || (patients.length > 0 ? patients[0].uhid : 'UHID-NEW')
    }, role, role);
    setIsFormOpen(false);
    setFormData({});
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Appointments</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage patient visits and doctor schedules.</p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => setIsFormOpen(!isFormOpen)}>
            <PlusCircle size={16} /> New Appointment
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Book Appointment</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="input-group">
                <label className="input-label">Patient UHID</label>
                <select className="input-field select-field" onChange={e => setFormData({ ...formData, uhid: e.target.value })}>
                  <option value="">Select or Create New</option>
                  {patients.map(p => <option key={p.uhid} value={p.uhid}>{p.name} ({p.uhid})</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Department *</label>
                <select required className="input-field select-field" onChange={e => setFormData({ ...formData, department: e.target.value })}>
                  <option value="">Select</option>
                  <option>Cardiology</option>
                  <option>Orthopedics</option>
                  <option>General Medicine</option>
                  <option>Pediatrics</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Doctor *</label>
                <select required className="input-field select-field" onChange={e => setFormData({ ...formData, doctor: e.target.value })}>
                  <option value="">Select</option>
                  <option>Dr. Smith (Cardiology)</option>
                  <option>Dr. Jones (Orthopedics)</option>
                  <option>Dr. Williams (General)</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Appointment Date *</label>
                <input required type="date" className="input-field" onChange={e => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Appointment Time *</label>
                <input required type="time" className="input-field" onChange={e => setFormData({ ...formData, time: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Priority</label>
                <select className="input-field select-field" onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                  <option>Normal</option>
                  <option>Urgent</option>
                  <option>VIP</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Book Appointment</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Apt ID</th>
                <th>Patient UHID</th>
                <th>Department</th>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.uhid}</td>
                  <td>{a.department}</td>
                  <td>{a.doctor}</td>
                  <td>{a.date} {a.time}</td>
                  <td>
                    <span className={`badge ${a.priority === 'Urgent' ? 'danger' : 'primary'}`}>{a.priority || 'Normal'}</span>
                  </td>
                  <td>
                    <span className={`badge ${a.status === 'BOOKED' ? 'warning' : 'success'}`}>{a.status}</span>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>No appointments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
