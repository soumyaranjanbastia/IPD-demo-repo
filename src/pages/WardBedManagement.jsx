import React, { useState, useMemo } from 'react';
import { 
  Bed, 
  Layers, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Filter, 
  Search, 
  Building, 
  DoorClosed, 
  ArrowRight, 
  User, 
  UserPlus, 
  Check, 
  X 
} from 'lucide-react';
import { useGlobal } from '../context/GlobalState';
import { hasPermission } from '../rbac';
import { useNavigate } from 'react-router-dom';
import AssignBedModal from '../components/AssignBedModal';

export default function WardBedManagement({ role }) {
  const { 
    wards = [], 
    rooms = [], 
    beds = [], 
    patients = [], 
    admissions = [],
    createWard, 
    updateWard, 
    deleteWard, 
    createRoom, 
    updateRoom, 
    deleteRoom, 
    createBed, 
    updateBed, 
    updateBedStatus, 
    deleteBed,
    vacateBed 
  } = useGlobal();

  const navigate = useNavigate();

  // Active Tab: MATRIX (Visual live map), WARDS, ROOMS, BEDS
  const [activeTab, setActiveTab] = useState('MATRIX');

  // Filters
  const [filterWard, setFilterWard] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showWardModal, setShowWardModal] = useState(false);
  const [editingWard, setEditingWard] = useState(null);
  const [wardForm, setWardForm] = useState({
    name: '',
    code: '',
    floor: '1st Floor',
    block: 'Main Wing',
    type: 'General Ward',
    inCharge: '',
    genderSuitability: 'All',
    status: 'Active',
    description: ''
  });

  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    wardId: '',
    roomType: 'General Multi-Bed',
    floor: '1st Floor',
    chargePerDay: 1500,
    amenities: ['Central Oxygen Line', 'Nurse Call Button'],
    status: 'Operational'
  });

  const [showBedModal, setShowBedModal] = useState(false);
  const [editingBed, setEditingBed] = useState(null);
  const [bedForm, setBedForm] = useState({
    id: '',
    wardId: '',
    roomId: '',
    type: 'General Ward',
    chargePerDay: 1000,
    features: ['Central Oxygen', 'Nurse Call Button'],
    status: 'Available',
    notes: ''
  });

  // Assign Bed Modal state
  const [showAssignBedModal, setShowAssignBedModal] = useState(false);
  const [assignTargetBedId, setAssignTargetBedId] = useState(null);

  // Bed Quick Action Drawer/Modal
  const [selectedBedForAction, setSelectedBedForAction] = useState(null);

  // RBAC checks
  const canCreate = hasPermission(role, 'ipd', 'create') || role === 'SUPER_ADMIN';
  const canUpdate = hasPermission(role, 'ipd', 'update') || role === 'SUPER_ADMIN';
  const canDelete = hasPermission(role, 'ipd', 'delete') || role === 'SUPER_ADMIN';

  // Available amenities for checklist
  const AVAILABLE_AMENITIES = [
    'Central Oxygen Line',
    'Ventilator Port',
    'Cardiac Monitor',
    'Air Conditioned',
    'Attached Washroom',
    'Smart TV & WiFi',
    'Attendant Bed',
    'Nurse Call Button',
    'Crash Cart Access',
    'Curtain Partition'
  ];

  // Available features for beds
  const AVAILABLE_BED_FEATURES = [
    'Central Oxygen',
    'Cardiac Monitor',
    'Electric Fowler Bed',
    'Ventilator Ready',
    'Attached Remote',
    'Nurse Call Button',
    'IV Pole',
    'Bedside Locker'
  ];

  // Metrics calculation
  const totalWards = wards.length;
  const totalRooms = rooms.length;
  const totalBeds = beds.length;
  const availableBeds = beds.filter(b => b.status === 'Available').length;
  const occupiedBeds = beds.filter(b => b.status === 'Occupied').length;
  const heldBeds = beds.filter(b => b.status === 'HELD').length;
  const cleaningBeds = beds.filter(b => b.status === 'Cleaning').length;
  const maintenanceBeds = beds.filter(b => b.status === 'Maintenance').length;
  const occupancyRate = totalBeds > 0 ? Math.round(((occupiedBeds + heldBeds) / totalBeds) * 100) : 0;

  // Helper to find patient by UHID
  const getPatientInfo = (uhid) => {
    if (!uhid) return null;
    return patients.find(p => p.uhid === uhid);
  };

  // --- WARD HANDLERS ---
  const handleOpenWardModal = (ward = null) => {
    if (ward) {
      setEditingWard(ward);
      setWardForm({
        name: ward.name || '',
        code: ward.code || '',
        floor: ward.floor || '1st Floor',
        block: ward.block || 'Main Wing',
        type: ward.type || 'General Ward',
        inCharge: ward.inCharge || '',
        genderSuitability: ward.genderSuitability || 'All',
        status: ward.status || 'Active',
        description: ward.description || ''
      });
    } else {
      setEditingWard(null);
      setWardForm({
        name: '',
        code: '',
        floor: '1st Floor',
        block: 'Main Wing',
        type: 'General Ward',
        inCharge: '',
        genderSuitability: 'All',
        status: 'Active',
        description: ''
      });
    }
    setShowWardModal(true);
  };

  const handleSaveWard = (e) => {
    e.preventDefault();
    if (!wardForm.name.trim()) return alert('Ward Name is required');

    if (editingWard) {
      updateWard(editingWard.id, wardForm, 'Admin', role);
    } else {
      createWard(wardForm, 'Admin', role);
    }
    setShowWardModal(false);
  };

  const handleDeleteWard = (wardId) => {
    if (window.confirm('Are you sure you want to delete this ward? Empty rooms and beds will also be removed.')) {
      deleteWard(wardId, 'Admin', role);
    }
  };

  // --- ROOM HANDLERS ---
  const handleOpenRoomModal = (room = null, preselectedWardId = '') => {
    const defaultWardId = preselectedWardId || (wards.length > 0 ? wards[0].id : '');
    if (room) {
      setEditingRoom(room);
      setRoomForm({
        roomNumber: room.roomNumber || '',
        wardId: room.wardId || defaultWardId,
        roomType: room.roomType || 'General Multi-Bed',
        floor: room.floor || '1st Floor',
        chargePerDay: room.chargePerDay || 1500,
        amenities: room.amenities || ['Central Oxygen Line', 'Nurse Call Button'],
        status: room.status || 'Operational'
      });
    } else {
      setEditingRoom(null);
      setRoomForm({
        roomNumber: '',
        wardId: defaultWardId,
        roomType: 'General Multi-Bed',
        floor: '1st Floor',
        chargePerDay: 1500,
        amenities: ['Central Oxygen Line', 'Nurse Call Button'],
        status: 'Operational'
      });
    }
    setShowRoomModal(true);
  };

  const handleSaveRoom = (e) => {
    e.preventDefault();
    if (!roomForm.roomNumber.trim()) return alert('Room Number is required');
    if (!roomForm.wardId) return alert('Please assign a Ward');

    const selectedWard = wards.find(w => w.id === roomForm.wardId);
    const roomPayload = {
      ...roomForm,
      wardName: selectedWard ? selectedWard.name : 'Unassigned',
      chargePerDay: Number(roomForm.chargePerDay)
    };

    if (editingRoom) {
      updateRoom(editingRoom.id, roomPayload, 'Admin', role);
    } else {
      createRoom(roomPayload, 'Admin', role);
    }
    setShowRoomModal(false);
  };

  const handleDeleteRoom = (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      deleteRoom(roomId, 'Admin', role);
    }
  };

  // --- BED HANDLERS ---
  const handleOpenBedModal = (bed = null, preselectedWardId = '', preselectedRoomId = '') => {
    const defaultWard = preselectedWardId || (wards.length > 0 ? wards[0].id : '');
    const defaultRoom = preselectedRoomId || (rooms.filter(r => !defaultWard || r.wardId === defaultWard)[0]?.id || '');

    if (bed) {
      setEditingBed(bed);
      setBedForm({
        id: bed.id || '',
        wardId: bed.wardId || defaultWard,
        roomId: bed.roomId || defaultRoom,
        type: bed.type || 'General Ward',
        chargePerDay: bed.chargePerDay || 1000,
        features: bed.features || ['Central Oxygen', 'Nurse Call Button'],
        status: bed.status || 'Available',
        notes: bed.notes || ''
      });
    } else {
      setEditingBed(null);
      const nextBedNumber = `B-${101 + beds.length}`;
      setBedForm({
        id: nextBedNumber,
        wardId: defaultWard,
        roomId: defaultRoom,
        type: 'General Ward',
        chargePerDay: 1000,
        features: ['Central Oxygen', 'Nurse Call Button'],
        status: 'Available',
        notes: ''
      });
    }
    setShowBedModal(true);
  };

  const handleSaveBed = (e) => {
    e.preventDefault();
    if (!bedForm.id.trim()) return alert('Bed ID/Number is required');
    if (!bedForm.wardId) return alert('Please select a Ward');

    const selectedWard = wards.find(w => w.id === bedForm.wardId);
    const selectedRoom = rooms.find(r => r.id === bedForm.roomId);

    const bedPayload = {
      ...bedForm,
      bedNumber: bedForm.id,
      ward: selectedWard ? selectedWard.name : 'General Wing',
      roomNumber: selectedRoom ? selectedRoom.roomNumber : 'General',
      chargePerDay: Number(bedForm.chargePerDay)
    };

    if (editingBed) {
      updateBed(editingBed.id, bedPayload, 'Admin', role);
    } else {
      const res = createBed(bedPayload, 'Admin', role);
      if (!res.success) return;
    }
    setShowBedModal(false);
  };

  const handleDeleteBed = (bedId) => {
    if (window.confirm(`Are you sure you want to delete Bed ${bedId}?`)) {
      deleteBed(bedId, 'Admin', role);
    }
  };

  const handleQuickStatusChange = (bedId, newStatus) => {
    updateBedStatus(bedId, newStatus, `Status changed to ${newStatus}`, 'Admin', role);
    if (selectedBedForAction && selectedBedForAction.id === bedId) {
      setSelectedBedForAction(prev => ({ ...prev, status: newStatus }));
    }
  };

  // Filtered beds for visual matrix and table
  const filteredBeds = useMemo(() => {
    return beds.filter(bed => {
      const matchesWard = filterWard === 'ALL' || bed.wardId === filterWard || bed.ward === filterWard;
      const matchesStatus = filterStatus === 'ALL' || bed.status === filterStatus;
      const matchesSearch = !searchQuery || 
        bed.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bed.roomNumber && bed.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (bed.uhid && bed.uhid.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesWard && matchesStatus && matchesSearch;
    });
  }, [beds, filterWard, filterStatus, searchQuery]);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      
      {/* 1. Header Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'linear-gradient(135deg, hsl(var(--primary-color)), hsl(var(--accent-color)))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 12px rgba(88, 101, 242, 0.25)' }}>
            <Layers size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>Ward, Room & Bed Management</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.875rem' }}>
              Hospital infrastructure: Configure Wards, Rooms, Tariffs & assign beds to patients.
            </p>
          </div>
        </div>

        {canCreate && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-primary" 
              style={{ height: '38px', padding: '0 16px', fontSize: '0.85rem' }}
              onClick={() => {
                setAssignTargetBedId(null);
                setShowAssignBedModal(true);
              }}
            >
              <UserPlus size={16} /> Assign Bed to Patient
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ height: '38px', padding: '0 14px', fontSize: '0.85rem' }} 
              onClick={() => handleOpenWardModal()}
            >
              <Plus size={15} /> Add Ward
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ height: '38px', padding: '0 14px', fontSize: '0.85rem' }} 
              onClick={() => handleOpenRoomModal()}
            >
              <Plus size={15} /> Add Room
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ height: '38px', padding: '0 14px', fontSize: '0.85rem' }} 
              onClick={() => handleOpenBedModal()}
            >
              <Plus size={15} /> Add Bed
            </button>
          </div>
        )}
      </div>

      {/* 2. Top Real-time Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', marginBottom: '22px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid hsl(var(--primary-color))', borderRadius: '12px', padding: '14px 16px', minHeight: '92px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Wards</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'hsl(var(--text-primary))', lineHeight: 1 }}>{totalWards}</div>
          <div style={{ fontSize: '0.75rem', color: 'hsl(var(--success))', fontWeight: 500 }}>{wards.filter(w => w.status === 'Active').length} Active Units</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid hsl(var(--accent-color))', borderRadius: '12px', padding: '14px 16px', minHeight: '92px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Rooms</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'hsl(var(--text-primary))', lineHeight: 1 }}>{totalRooms}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Across {totalWards} Wards</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid hsl(var(--success))', borderRadius: '12px', padding: '14px 16px', minHeight: '92px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Available Beds</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'hsl(var(--success))', lineHeight: 1 }}>{availableBeds}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ready for Admission</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid hsl(var(--danger))', borderRadius: '12px', padding: '14px 16px', minHeight: '92px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Occupied Beds</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'hsl(var(--danger))', lineHeight: 1 }}>{occupiedBeds}</div>
          <div style={{ fontSize: '0.75rem', color: 'hsl(var(--warning))' }}>{heldBeds} Awaiting Deposit</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6', borderRadius: '12px', padding: '14px 16px', minHeight: '92px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cleaning / Sanitizing</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#3b82f6', lineHeight: 1 }}>{cleaningBeds}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Housekeeping</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b', borderRadius: '12px', padding: '14px 16px', minHeight: '92px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Maintenance</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>{maintenanceBeds}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Service / Calibration</div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, rgba(88, 101, 242, 0.08), rgba(168, 85, 247, 0.08))', border: '1px solid rgba(88, 101, 242, 0.2)', borderRadius: '12px', padding: '14px 16px', minHeight: '92px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>IPD Occupancy</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'hsl(var(--text-primary))', lineHeight: 1 }}>{occupancyRate}%</div>
          <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${occupancyRate}%`, height: '100%', background: occupancyRate > 80 ? 'hsl(var(--danger))' : 'hsl(var(--primary-color))', borderRadius: '3px' }}></div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs Bar (Clean Pill Style) */}
      <div style={{ background: 'rgba(241, 245, 249, 0.8)', padding: '5px', borderRadius: '12px', display: 'inline-flex', gap: '4px', marginBottom: '22px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTab('MATRIX')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
            borderRadius: '8px', fontSize: '0.85rem', fontWeight: activeTab === 'MATRIX' ? 600 : 500,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s ease',
            background: activeTab === 'MATRIX' ? '#ffffff' : 'transparent',
            color: activeTab === 'MATRIX' ? 'hsl(var(--primary-color))' : 'var(--text-secondary)',
            boxShadow: activeTab === 'MATRIX' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
          }}
        >
          <Bed size={16} /> Interactive Bed Matrix (Floor Map)
        </button>
        <button 
          onClick={() => setActiveTab('WARDS')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
            borderRadius: '8px', fontSize: '0.85rem', fontWeight: activeTab === 'WARDS' ? 600 : 500,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s ease',
            background: activeTab === 'WARDS' ? '#ffffff' : 'transparent',
            color: activeTab === 'WARDS' ? 'hsl(var(--primary-color))' : 'var(--text-secondary)',
            boxShadow: activeTab === 'WARDS' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
          }}
        >
          <Building size={16} /> Wards Directory ({wards.length})
        </button>
        <button 
          onClick={() => setActiveTab('ROOMS')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
            borderRadius: '8px', fontSize: '0.85rem', fontWeight: activeTab === 'ROOMS' ? 600 : 500,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s ease',
            background: activeTab === 'ROOMS' ? '#ffffff' : 'transparent',
            color: activeTab === 'ROOMS' ? 'hsl(var(--primary-color))' : 'var(--text-secondary)',
            boxShadow: activeTab === 'ROOMS' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
          }}
        >
          <DoorClosed size={16} /> Rooms & Tariffs ({rooms.length})
        </button>
        <button 
          onClick={() => setActiveTab('BEDS')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
            borderRadius: '8px', fontSize: '0.85rem', fontWeight: activeTab === 'BEDS' ? 600 : 500,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s ease',
            background: activeTab === 'BEDS' ? '#ffffff' : 'transparent',
            color: activeTab === 'BEDS' ? 'hsl(var(--primary-color))' : 'var(--text-secondary)',
            boxShadow: activeTab === 'BEDS' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
          }}
        >
          <Layers size={16} /> Beds Master Catalog ({beds.length})
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: INTERACTIVE BED MATRIX (LIVE MAP) */}
      {/* ======================================================== */}
      {activeTab === 'MATRIX' && (
        <div className="animate-fade-in">
          {/* Unified Filter Toolbar */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={15} color="var(--text-secondary)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>WARD:</span>
                <select 
                  className="input-field select-field" 
                  value={filterWard} 
                  onChange={(e) => setFilterWard(e.target.value)}
                  style={{ width: '180px', height: '36px', padding: '0 10px', fontSize: '0.85rem' }}
                >
                  <option value="ALL">All Wards ({wards.length})</option>
                  {wards.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>STATUS:</span>
                <select 
                  className="input-field select-field" 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ width: '160px', height: '36px', padding: '0 10px', fontSize: '0.85rem' }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="HELD">HELD (Deposit)</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div style={{ position: 'relative' }}>
                <Search size={14} color="var(--text-secondary)" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                <input 
                  type="text" 
                  placeholder="Search Bed / UHID..." 
                  className="input-field" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '180px', height: '36px', padding: '0 10px 0 30px', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Legend with aligned dots */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'hsl(var(--success))' }}></div>
                <span>Available</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'hsl(var(--danger))' }}></div>
                <span>Occupied</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></div>
                <span>Held</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }}></div>
                <span>Cleaning</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#64748b' }}></div>
                <span>Maint.</span>
              </div>
            </div>
          </div>

          {/* Grouped Wards and Rooms Visual Hierarchy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {wards
              .filter(w => filterWard === 'ALL' || w.id === filterWard)
              .map(ward => {
                const wardBeds = filteredBeds.filter(b => b.wardId === ward.id || b.ward === ward.name);
                const wardRooms = rooms.filter(r => r.wardId === ward.id);

                if (filterWard !== 'ALL' && wardBeds.length === 0) return null;

                return (
                  <div key={ward.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    
                    {/* Ward Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(88, 101, 242, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--primary-color))' }}>
                          <Building size={20} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>{ward.name}</h3>
                            <span className="badge primary">{ward.code}</span>
                            <span style={{ fontSize: '0.72rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', color: 'var(--text-secondary)' }}>{ward.type}</span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            📍 {ward.floor} • {ward.block} • In-Charge: <strong>{ward.inCharge}</strong>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                          <div><strong>{wardBeds.length}</strong> Beds Matching</div>
                          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--success))', fontWeight: 600 }}>
                            {wardBeds.filter(b => b.status === 'Available').length} Available
                          </span>
                        </div>
                        {canCreate && (
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => handleOpenRoomModal(null, ward.id)}
                          >
                            <Plus size={14} /> Add Room
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Room Pods inside this Ward */}
                    {wardRooms.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {wardRooms.map(room => {
                          const roomBeds = wardBeds.filter(b => b.roomId === room.id || b.roomNumber === room.roomNumber);

                          return (
                            <div key={room.id} style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px 16px', border: '1px solid #e2e8f0' }}>
                              
                              {/* Room Header */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <DoorClosed size={16} color="hsl(var(--primary-color))" />
                                  <strong style={{ fontSize: '0.92rem' }}>Room {room.roomNumber}</strong>
                                  <span style={{ fontSize: '0.75rem', background: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: '6px' }}>
                                    {room.roomType}
                                  </span>
                                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--primary-color))', fontWeight: 600 }}>
                                    ₹{room.chargePerDay?.toLocaleString()}/day
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {canCreate && (
                                    <button 
                                      className="btn btn-secondary btn-sm" 
                                      style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                                      onClick={() => handleOpenBedModal(null, ward.id, room.id)}
                                    >
                                      <Plus size={12} /> Add Bed
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Bed Cards Grid */}
                              {roomBeds.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '12px' }}>
                                  {roomBeds.map(bed => {
                                    const isOccupied = bed.status === 'Occupied';
                                    const isHeld = bed.status === 'HELD';
                                    const isCleaning = bed.status === 'Cleaning';
                                    const isMaintenance = bed.status === 'Maintenance';
                                    const isAvailable = bed.status === 'Available';
                                    const patient = isOccupied || isHeld ? getPatientInfo(bed.uhid) : null;

                                    const borderColor = isOccupied ? 'hsl(var(--danger))' : isHeld ? '#f59e0b' : isCleaning ? '#3b82f6' : isMaintenance ? '#64748b' : 'hsl(var(--success))';
                                    const bgColor = isOccupied ? '#fff5f5' : isHeld ? '#fffbeb' : isCleaning ? '#eff6ff' : isMaintenance ? '#f8fafc' : '#f0fdf4';

                                    return (
                                      <div 
                                        key={bed.id}
                                        onClick={() => setSelectedBedForAction(bed)}
                                        style={{
                                          padding: '12px 14px',
                                          borderRadius: '10px',
                                          border: `1.5px solid ${borderColor}`,
                                          background: bgColor,
                                          cursor: 'pointer',
                                          transition: 'all 0.15s ease',
                                          minHeight: '135px',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          justifyContent: 'space-between',
                                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                                        }}
                                        title="Click to manage bed, assign patient or change status"
                                      >
                                        <div>
                                          {/* Bed Card Header */}
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                              <Bed size={16} color={borderColor} />
                                              <strong style={{ fontSize: '0.98rem', color: 'hsl(var(--text-primary))' }}>{bed.id}</strong>
                                            </div>
                                            <span style={{ 
                                              fontSize: '0.68rem', 
                                              fontWeight: 700, 
                                              padding: '2px 6px', 
                                              borderRadius: '4px',
                                              background: borderColor,
                                              color: '#ffffff'
                                            }}>
                                              {bed.status}
                                            </span>
                                          </div>

                                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {bed.type} • ₹{bed.chargePerDay?.toLocaleString() || room.chargePerDay?.toLocaleString()}/d
                                          </div>
                                        </div>

                                        {/* Bottom Patient State or Quick Action */}
                                        <div style={{ borderTop: '1px dashed rgba(0,0,0,0.1)', paddingTop: '6px', marginTop: '6px' }}>
                                          {isOccupied && (
                                            <div>
                                              <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'hsl(var(--danger))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {patient ? patient.name : 'Admitted'}
                                              </div>
                                              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{bed.uhid}</div>
                                            </div>
                                          )}

                                          {isHeld && (
                                            <div>
                                              <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>Deposit Pending</div>
                                              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{bed.uhid}</div>
                                            </div>
                                          )}

                                          {isCleaning && (
                                            <div style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 500 }}>
                                              🧹 Housekeeping active
                                            </div>
                                          )}

                                          {isMaintenance && (
                                            <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>
                                              🔧 Calibration / Repair
                                            </div>
                                          )}

                                          {isAvailable && (
                                            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--success))', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                              <CheckCircle size={12} /> Ready • Click to Assign
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
                                  No beds matching filters in this room.
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '10px' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 8px 0' }}>No rooms configured in this ward yet.</p>
                        {canCreate && (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleOpenRoomModal(null, ward.id)}>
                            <Plus size={14} /> Create Room
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: WARDS DIRECTORY */}
      {/* ======================================================== */}
      {activeTab === 'WARDS' && (
        <div className="card animate-fade-in" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Hospital Wards Master</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Configure wards, locations, and in-charges.</p>
            </div>
            {canCreate && (
              <button className="btn btn-primary btn-sm" onClick={() => handleOpenWardModal()}>
                <Plus size={15} /> Create Ward
              </button>
            )}
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Ward Name & Code</th>
                  <th>Classification</th>
                  <th>Floor & Wing</th>
                  <th>In-Charge</th>
                  <th>Rooms & Beds</th>
                  <th>Occupancy</th>
                  <th>Status</th>
                  <th className="actions-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {wards.map(w => {
                  const wardBeds = beds.filter(b => b.wardId === w.id || b.ward === w.name);
                  const wardRooms = rooms.filter(r => r.wardId === w.id);
                  const occupied = wardBeds.filter(b => b.status === 'Occupied' || b.status === 'HELD').length;
                  const pct = wardBeds.length > 0 ? Math.round((occupied / wardBeds.length) * 100) : 0;

                  return (
                    <tr key={w.id}>
                      <td>
                        <strong>{w.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Code: {w.code}</div>
                      </td>
                      <td>
                        <span className="badge primary">{w.type}</span>
                      </td>
                      <td>
                        {w.floor}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{w.block}</div>
                      </td>
                      <td>{w.inCharge || 'Not Assigned'}</td>
                      <td><strong>{wardRooms.length} Rooms</strong> • {wardBeds.length} Beds</td>
                      <td style={{ minWidth: '110px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                          <span>{occupied}/{wardBeds.length}</span>
                          <strong>{pct}%</strong>
                        </div>
                        <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: pct > 80 ? 'hsl(var(--danger))' : 'hsl(var(--primary-color))' }}></div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${w.status === 'Active' ? 'success' : 'warning'}`}>{w.status}</span>
                      </td>
                      <td className="actions-cell">
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => handleOpenRoomModal(null, w.id)}
                            title="Add Room to Ward"
                          >
                            <Plus size={13} /> Room
                          </button>
                          {canUpdate && (
                            <button 
                              className="btn btn-secondary btn-icon" 
                              onClick={() => handleOpenWardModal(w)}
                              title="Edit Ward"
                            >
                              <Edit size={14} />
                            </button>
                          )}
                          {canDelete && (
                            <button 
                              className="btn btn-secondary btn-icon" 
                              style={{ color: 'hsl(var(--danger))', borderColor: 'hsl(var(--danger))' }}
                              onClick={() => handleDeleteWard(w.id)}
                              title="Delete Ward"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: ROOMS & TARIFFS */}
      {/* ======================================================== */}
      {activeTab === 'ROOMS' && (
        <div className="card animate-fade-in" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Hospital Rooms & Tariffs</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Manage room classifications and daily rates.</p>
            </div>
            {canCreate && (
              <button className="btn btn-primary btn-sm" onClick={() => handleOpenRoomModal()}>
                <Plus size={15} /> Create Room
              </button>
            )}
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Room Number</th>
                  <th>Assigned Ward</th>
                  <th>Classification</th>
                  <th>Daily Tariff</th>
                  <th>Installed Beds</th>
                  <th>Status</th>
                  <th className="actions-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(r => {
                  const roomBeds = beds.filter(b => b.roomId === r.id || b.roomNumber === r.roomNumber);

                  return (
                    <tr key={r.id}>
                      <td>
                        <strong>Room {r.roomNumber}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.floor}</div>
                      </td>
                      <td><strong>{r.wardName}</strong></td>
                      <td><span className="badge primary">{r.roomType}</span></td>
                      <td><strong style={{ color: 'hsl(var(--primary-color))' }}>₹{r.chargePerDay?.toLocaleString()}</strong> / day</td>
                      <td><strong>{roomBeds.length} Beds</strong></td>
                      <td><span className={`badge ${r.status === 'Operational' ? 'success' : 'warning'}`}>{r.status}</span></td>
                      <td className="actions-cell">
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => handleOpenBedModal(null, r.wardId, r.id)}
                            title="Add Bed to this Room"
                          >
                            <Plus size={13} /> Bed
                          </button>
                          {canUpdate && (
                            <button 
                              className="btn btn-secondary btn-icon" 
                              onClick={() => handleOpenRoomModal(r)}
                              title="Edit Room"
                            >
                              <Edit size={14} />
                            </button>
                          )}
                          {canDelete && (
                            <button 
                              className="btn btn-secondary btn-icon" 
                              style={{ color: 'hsl(var(--danger))', borderColor: 'hsl(var(--danger))' }}
                              onClick={() => handleDeleteRoom(r.id)}
                              title="Delete Room"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: BEDS MASTER CATALOG */}
      {/* ======================================================== */}
      {activeTab === 'BEDS' && (
        <div className="card animate-fade-in" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Beds Master Catalog</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Assign patients, update status, and manage beds.</p>
            </div>
            {canCreate && (
              <button className="btn btn-primary btn-sm" onClick={() => handleOpenBedModal()}>
                <Plus size={15} /> Add Bed
              </button>
            )}
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Bed Code</th>
                  <th>Location (Ward & Room)</th>
                  <th>Category</th>
                  <th>Rate/Day</th>
                  <th>Current State</th>
                  <th>Patient UHID</th>
                  <th>Quick Action</th>
                  <th className="actions-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBeds.map(b => {
                  const isOccupied = b.status === 'Occupied';
                  const isHeld = b.status === 'HELD';
                  const isAvailable = b.status === 'Available';
                  const patient = (isOccupied || isHeld) ? getPatientInfo(b.uhid) : null;

                  return (
                    <tr key={b.id}>
                      <td>
                        <strong style={{ fontSize: '1rem', color: 'hsl(var(--primary-color))' }}>{b.id}</strong>
                      </td>
                      <td>
                        <strong>{b.ward}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Room: {b.roomNumber}</div>
                      </td>
                      <td><span className="badge primary">{b.type}</span></td>
                      <td>₹{b.chargePerDay?.toLocaleString()}/d</td>
                      <td>
                        <span className={`badge ${
                          b.status === 'Occupied' ? 'danger' : 
                          b.status === 'HELD' ? 'warning' : 
                          b.status === 'Cleaning' ? 'primary' : 
                          b.status === 'Maintenance' ? 'warning' : 'success'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td>
                        {b.uhid ? (
                          <div>
                            <strong>{b.uhid}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{patient?.name || ''}</div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>—</span>
                        )}
                      </td>
                      <td>
                        {isAvailable ? (
                          <button 
                            className="btn btn-primary btn-sm" 
                            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                            onClick={() => {
                              setAssignTargetBedId(b.id);
                              setShowAssignBedModal(true);
                            }}
                          >
                            <UserPlus size={12} /> Assign Patient
                          </button>
                        ) : (
                          <div style={{ display: 'inline-flex', gap: '4px' }}>
                            {b.status !== 'Available' && !isOccupied && !isHeld && (
                              <button 
                                className="btn btn-secondary btn-sm" 
                                style={{ padding: '3px 6px', fontSize: '0.7rem', color: 'hsl(var(--success))' }}
                                onClick={() => handleQuickStatusChange(b.id, 'Available')}
                              >
                                Ready
                              </button>
                            )}
                            {b.status !== 'Cleaning' && !isOccupied && !isHeld && (
                              <button 
                                className="btn btn-secondary btn-sm" 
                                style={{ padding: '3px 6px', fontSize: '0.7rem', color: '#2563eb' }}
                                onClick={() => handleQuickStatusChange(b.id, 'Cleaning')}
                              >
                                Clean
                              </button>
                            )}
                            {isOccupied && (
                              <button 
                                className="btn btn-secondary btn-sm" 
                                style={{ padding: '3px 6px', fontSize: '0.7rem', color: 'hsl(var(--danger))' }}
                                onClick={() => {
                                  if (window.confirm(`Vacate Bed ${b.id}?`)) {
                                    vacateBed(b.id, 'Admin', role);
                                  }
                                }}
                              >
                                Vacate
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="actions-cell">
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {canUpdate && (
                            <button 
                              className="btn btn-secondary btn-icon" 
                              onClick={() => handleOpenBedModal(b)}
                              title="Edit Bed"
                            >
                              <Edit size={14} />
                            </button>
                          )}
                          {canDelete && !isOccupied && !isHeld && (
                            <button 
                              className="btn btn-secondary btn-icon" 
                              style={{ color: 'hsl(var(--danger))', borderColor: 'hsl(var(--danger))' }}
                              onClick={() => handleDeleteBed(b.id)}
                              title="Delete Bed"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: CREATE / EDIT WARD */}
      {/* ======================================================== */}
      {showWardModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowWardModal(false); }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
            padding: '20px'
          }}
        >
          <div style={{ width: '560px', maxWidth: '95vw', background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', margin: 0 }}>
                <Building size={20} color="hsl(var(--primary-color))" />
                {editingWard ? 'Edit Hospital Ward' : 'Create New Hospital Ward'}
              </h3>
              <button onClick={() => setShowWardModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveWard}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Ward Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Neonatal Intensive Care Unit" 
                    className="input-field" 
                    value={wardForm.name}
                    onChange={(e) => setWardForm({ ...wardForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Ward Code *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. NICU" 
                    className="input-field" 
                    value={wardForm.code}
                    onChange={(e) => setWardForm({ ...wardForm, code: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Classification</label>
                  <select 
                    className="input-field select-field" 
                    value={wardForm.type}
                    onChange={(e) => setWardForm({ ...wardForm, type: e.target.value })}
                  >
                    <option value="General Ward">General Ward</option>
                    <option value="Semi Private">Semi Private</option>
                    <option value="Private">Private Wing</option>
                    <option value="ICU">Intensive Care Unit (ICU)</option>
                    <option value="HDU">High Dependency Unit (HDU)</option>
                    <option value="Pediatric">Pediatric Ward</option>
                    <option value="Maternity">Maternity & Neonatal</option>
                    <option value="Emergency">Emergency Observation</option>
                    <option value="Isolation">Isolation Ward</option>
                  </select>
                </div>
                <div>
                  <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Floor</label>
                  <select 
                    className="input-field select-field" 
                    value={wardForm.floor}
                    onChange={(e) => setWardForm({ ...wardForm, floor: e.target.value })}
                  >
                    <option value="Ground Floor">Ground Floor</option>
                    <option value="1st Floor">1st Floor</option>
                    <option value="2nd Floor">2nd Floor</option>
                    <option value="3rd Floor">3rd Floor</option>
                    <option value="4th Floor">4th Floor</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Building Block / Wing</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Main Critical Wing" 
                    className="input-field" 
                    value={wardForm.block}
                    onChange={(e) => setWardForm({ ...wardForm, block: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>In-Charge Staff / Doctor</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Dr. R. Adams" 
                    className="input-field" 
                    value={wardForm.inCharge}
                    onChange={(e) => setWardForm({ ...wardForm, inCharge: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowWardModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingWard ? 'Update Ward' : 'Save & Create Ward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CREATE / EDIT ROOM */}
      {/* ======================================================== */}
      {showRoomModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowRoomModal(false); }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
            padding: '20px'
          }}
        >
          <div style={{ width: '560px', maxWidth: '95vw', background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', margin: 0 }}>
                <DoorClosed size={20} color="hsl(var(--primary-color))" />
                {editingRoom ? 'Edit Hospital Room' : 'Create New Hospital Room'}
              </h3>
              <button onClick={() => setShowRoomModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveRoom}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Room Number *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. ICU-103 or PVT-205" 
                    className="input-field" 
                    value={roomForm.roomNumber}
                    onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Assigned Ward *</label>
                  <select 
                    required
                    className="input-field select-field" 
                    value={roomForm.wardId}
                    onChange={(e) => setRoomForm({ ...roomForm, wardId: e.target.value })}
                  >
                    <option value="">Select Ward</option>
                    {wards.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Room Classification</label>
                  <select 
                    className="input-field select-field" 
                    value={roomForm.roomType}
                    onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}
                  >
                    <option value="ICU Cabin">ICU Cabin</option>
                    <option value="Deluxe Single">Deluxe Single</option>
                    <option value="Twin Sharing">Twin Sharing</option>
                    <option value="General Multi-Bed">General Multi-Bed</option>
                    <option value="Isolation Room">Isolation Room</option>
                    <option value="Acute Observation">Acute Observation</option>
                  </select>
                </div>
                <div>
                  <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Daily Tariff Rate (₹) *</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="e.g. 5000" 
                    className="input-field" 
                    value={roomForm.chargePerDay}
                    onChange={(e) => setRoomForm({ ...roomForm, chargePerDay: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowRoomModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingRoom ? 'Update Room' : 'Save & Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: CREATE / EDIT BED */}
      {/* ======================================================== */}
      {showBedModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowBedModal(false); }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
            padding: '20px'
          }}
        >
          <div style={{ width: '560px', maxWidth: '95vw', background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', margin: 0 }}>
                <Bed size={20} color="hsl(var(--primary-color))" />
                {editingBed ? 'Edit Bed Details' : 'Add Hospital Bed'}
              </h3>
              <button onClick={() => setShowBedModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBed}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Bed Code / ID *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. B-141" 
                    className="input-field" 
                    disabled={!!editingBed}
                    value={bedForm.id}
                    onChange={(e) => setBedForm({ ...bedForm, id: e.target.value.toUpperCase() })}
                  />
                </div>
                <div>
                  <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Category</label>
                  <select 
                    className="input-field select-field" 
                    value={bedForm.type}
                    onChange={(e) => setBedForm({ ...bedForm, type: e.target.value })}
                  >
                    <option value="ICU">ICU Electric Bed</option>
                    <option value="Private">Private Deluxe Bed</option>
                    <option value="Semi Private">Semi-Private Bed</option>
                    <option value="General Ward">Standard General Bed</option>
                    <option value="Pediatric">Pediatric Cot</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Ward *</label>
                  <select 
                    required
                    className="input-field select-field" 
                    value={bedForm.wardId}
                    onChange={(e) => {
                      const newWardId = e.target.value;
                      const roomInWard = rooms.filter(r => r.wardId === newWardId)[0]?.id || '';
                      setBedForm({ ...bedForm, wardId: newWardId, roomId: roomInWard });
                    }}
                  >
                    <option value="">Select Ward</option>
                    {wards.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Room Number</label>
                  <select 
                    className="input-field select-field" 
                    value={bedForm.roomId}
                    onChange={(e) => {
                      const selRoom = rooms.find(r => r.id === e.target.value);
                      setBedForm({ 
                        ...bedForm, 
                        roomId: e.target.value,
                        chargePerDay: selRoom ? selRoom.chargePerDay : bedForm.chargePerDay 
                      });
                    }}
                  >
                    <option value="">Select Room</option>
                    {rooms
                      .filter(r => !bedForm.wardId || r.wardId === bedForm.wardId)
                      .map(r => (
                        <option key={r.id} value={r.id}>Room {r.roomNumber} ({r.roomType})</option>
                      ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Tariff Rate (₹/day) *</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="e.g. 2500" 
                    className="input-field" 
                    value={bedForm.chargePerDay}
                    onChange={(e) => setBedForm({ ...bedForm, chargePerDay: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Initial Status</label>
                  <select 
                    className="input-field select-field" 
                    value={bedForm.status}
                    onChange={(e) => setBedForm({ ...bedForm, status: e.target.value })}
                  >
                    <option value="Available">Available (Ready)</option>
                    <option value="Cleaning">Cleaning (Housekeeping)</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowBedModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingBed ? 'Update Bed' : 'Save & Create Bed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: QUICK BED ACTION DRAWER */}
      {/* ======================================================== */}
      {selectedBedForAction && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedBedForAction(null); }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
            padding: '20px'
          }}
        >
          <div style={{ width: '460px', maxWidth: '95vw', background: '#ffffff', borderRadius: '16px', padding: '22px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: selectedBedForAction.status === 'Occupied' ? 'hsl(var(--danger-bg))' : 'hsl(var(--success-bg))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Bed size={22} color={selectedBedForAction.status === 'Occupied' ? 'hsl(var(--danger))' : 'hsl(var(--success))'} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Bed {selectedBedForAction.id}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {selectedBedForAction.ward} • Room {selectedBedForAction.roomNumber}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedBedForAction(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Bed Type:</span>
                <strong>{selectedBedForAction.type}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Tariff:</span>
                <strong>₹{selectedBedForAction.chargePerDay?.toLocaleString()}/day</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Current Status:</span>
                <span className={`badge ${
                  selectedBedForAction.status === 'Occupied' ? 'danger' : 
                  selectedBedForAction.status === 'HELD' ? 'warning' : 
                  selectedBedForAction.status === 'Cleaning' ? 'primary' : 
                  selectedBedForAction.status === 'Maintenance' ? 'warning' : 'success'
                }`}>
                  {selectedBedForAction.status}
                </span>
              </div>
            </div>

            {/* If Occupied or Held, show Patient summary */}
            {(selectedBedForAction.status === 'Occupied' || selectedBedForAction.status === 'HELD') && (
              <div style={{ border: '1px solid #fee2e2', background: '#fff5f5', padding: '12px 14px', borderRadius: '10px', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.85rem', color: 'hsl(var(--danger))', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={15} /> Admitted Inpatient
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {getPatientInfo(selectedBedForAction.uhid)?.name || 'Admitted Patient'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  UHID: <strong>{selectedBedForAction.uhid}</strong>
                </div>

                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn btn-primary btn-sm" 
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => {
                      setSelectedBedForAction(null);
                      navigate('/ipd');
                    }}
                  >
                    IPD 360° View <ArrowRight size={14} />
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    style={{ color: 'hsl(var(--danger))', borderColor: 'hsl(var(--danger))' }}
                    onClick={() => {
                      if (window.confirm(`Vacate Bed ${selectedBedForAction.id} for housekeeping?`)) {
                        vacateBed(selectedBedForAction.id, 'Admin', role);
                        setSelectedBedForAction(null);
                      }
                    }}
                  >
                    Vacate Bed
                  </button>
                </div>
              </div>
            )}

            {/* Direct Patient Assignment if Available */}
            {selectedBedForAction.status === 'Available' && (
              <div style={{ marginBottom: '16px' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '10px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, hsl(var(--primary-color)), hsl(var(--accent-color)))' }}
                  onClick={() => {
                    const bId = selectedBedForAction.id;
                    setSelectedBedForAction(null);
                    setAssignTargetBedId(bId);
                    setShowAssignBedModal(true);
                  }}
                >
                  <UserPlus size={16} /> Assign This Bed to Patient
                </button>
              </div>
            )}

            {/* Status change actions if unoccupied */}
            {selectedBedForAction.status !== 'Occupied' && selectedBedForAction.status !== 'HELD' && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Quick Housekeeping & Maintenance Actions:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    style={{ color: 'hsl(var(--success))', borderColor: 'hsl(var(--success))', justifyContent: 'center' }}
                    onClick={() => handleQuickStatusChange(selectedBedForAction.id, 'Available')}
                  >
                    ✓ Ready
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    style={{ color: '#2563eb', borderColor: '#2563eb', justifyContent: 'center' }}
                    onClick={() => handleQuickStatusChange(selectedBedForAction.id, 'Cleaning')}
                  >
                    🧹 Clean
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    style={{ color: '#f59e0b', borderColor: '#f59e0b', justifyContent: 'center' }}
                    onClick={() => handleQuickStatusChange(selectedBedForAction.id, 'Maintenance')}
                  >
                    🔧 Maint.
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedBedForAction(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Room & Bed Assignment to Patient Modal */}
      <AssignBedModal 
        isOpen={showAssignBedModal}
        onClose={() => {
          setShowAssignBedModal(false);
          setAssignTargetBedId(null);
        }}
        initialBedId={assignTargetBedId}
        role={role}
      />
    </div>
  );
}
