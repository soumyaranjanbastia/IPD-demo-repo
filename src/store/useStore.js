import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const generateId = (prefix) => `${prefix}-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;

export const DEFAULT_WARDS = [
  {
    id: 'WRD-101',
    name: 'Intensive Care Unit (ICU)',
    code: 'ICU',
    floor: '1st Floor',
    block: 'Main Critical Wing',
    type: 'ICU',
    inCharge: 'Dr. R. Adams (Chief Intensivist)',
    genderSuitability: 'All',
    status: 'Active',
    description: 'Critical Care & Multi-parameter Life Support Unit'
  },
  {
    id: 'WRD-102',
    name: 'Private Deluxe Wing',
    code: 'PVT',
    floor: '2nd Floor',
    block: 'East Wing Tower',
    type: 'Private',
    inCharge: 'Sister Ananya Roy (Floor Supervisor)',
    genderSuitability: 'All',
    status: 'Active',
    description: 'Executive Private Inpatient Suites with AC & Attendant Beds'
  },
  {
    id: 'WRD-103',
    name: 'Semi-Private Care Ward',
    code: 'SEMI',
    floor: '2nd Floor',
    block: 'West Wing Tower',
    type: 'Semi Private',
    inCharge: 'Sister Priya Sharma',
    genderSuitability: 'All',
    status: 'Active',
    description: 'Twin Sharing Inpatient Recovery Rooms with Partition Curtains'
  },
  {
    id: 'WRD-104',
    name: 'General Medicine Ward',
    code: 'GEN',
    floor: '3rd Floor',
    block: 'North Wing',
    type: 'General Ward',
    inCharge: 'Dr. Smith (General Physician)',
    genderSuitability: 'All',
    status: 'Active',
    description: 'Multi-bed Inpatient General Recovery & Observation Ward'
  },
  {
    id: 'WRD-105',
    name: 'Emergency Observation Ward',
    code: 'EMR-OBS',
    floor: 'Ground Floor',
    block: 'Trauma & Emergency Center',
    type: 'Emergency',
    inCharge: 'Dr. Vikram Patel (ER Head)',
    genderSuitability: 'All',
    status: 'Active',
    description: 'Short-stay 24/7 Acute Observation & Stabilization Ward'
  }
];

export const DEFAULT_ROOMS = [
  {
    id: 'RM-101',
    roomNumber: 'ICU-101',
    wardId: 'WRD-101',
    wardName: 'Intensive Care Unit (ICU)',
    roomType: 'ICU Cabin',
    floor: '1st Floor',
    chargePerDay: 15000,
    amenities: ['Central Oxygen Line', 'Ventilator Port', 'Cardiac Monitor', 'Nurse Call Button'],
    status: 'Operational'
  },
  {
    id: 'RM-102',
    roomNumber: 'ICU-102',
    wardId: 'WRD-101',
    wardName: 'Intensive Care Unit (ICU)',
    roomType: 'ICU Cabin',
    floor: '1st Floor',
    chargePerDay: 15000,
    amenities: ['Central Oxygen Line', 'Ventilator Port', 'Cardiac Monitor', 'Nurse Call Button'],
    status: 'Operational'
  },
  {
    id: 'RM-201',
    roomNumber: 'PVT-201',
    wardId: 'WRD-102',
    wardName: 'Private Deluxe Wing',
    roomType: 'Deluxe Single',
    floor: '2nd Floor',
    chargePerDay: 5000,
    amenities: ['Air Conditioned', 'Attached Washroom', 'Smart TV & WiFi', 'Attendant Bed', 'Nurse Call'],
    status: 'Operational'
  },
  {
    id: 'RM-202',
    roomNumber: 'PVT-202',
    wardId: 'WRD-102',
    wardName: 'Private Deluxe Wing',
    roomType: 'Deluxe Single',
    floor: '2nd Floor',
    chargePerDay: 5000,
    amenities: ['Air Conditioned', 'Attached Washroom', 'Smart TV & WiFi', 'Attendant Bed', 'Nurse Call'],
    status: 'Operational'
  },
  {
    id: 'RM-203',
    roomNumber: 'SEMI-203',
    wardId: 'WRD-103',
    wardName: 'Semi-Private Care Ward',
    roomType: 'Twin Sharing',
    floor: '2nd Floor',
    chargePerDay: 2500,
    amenities: ['Air Conditioned', 'Shared Washroom', 'Curtain Partition', 'Nurse Call'],
    status: 'Operational'
  },
  {
    id: 'RM-204',
    roomNumber: 'SEMI-204',
    wardId: 'WRD-103',
    wardName: 'Semi-Private Care Ward',
    roomType: 'Twin Sharing',
    floor: '2nd Floor',
    chargePerDay: 2500,
    amenities: ['Air Conditioned', 'Shared Washroom', 'Curtain Partition', 'Nurse Call'],
    status: 'Operational'
  },
  {
    id: 'RM-301',
    roomNumber: 'GEN-301',
    wardId: 'WRD-104',
    wardName: 'General Medicine Ward',
    roomType: 'Multi-Bed Ward',
    floor: '3rd Floor',
    chargePerDay: 1000,
    amenities: ['Central Oxygen', 'Wall Fans', 'Shared Restrooms', 'Nurse Call'],
    status: 'Operational'
  },
  {
    id: 'RM-302',
    roomNumber: 'GEN-302',
    wardId: 'WRD-104',
    wardName: 'General Medicine Ward',
    roomType: 'Multi-Bed Ward',
    floor: '3rd Floor',
    chargePerDay: 1000,
    amenities: ['Central Oxygen', 'Wall Fans', 'Shared Restrooms', 'Nurse Call'],
    status: 'Operational'
  },
  {
    id: 'RM-001',
    roomNumber: 'EMR-001',
    wardId: 'WRD-105',
    wardName: 'Emergency Observation Ward',
    roomType: 'Acute Observation',
    floor: 'Ground Floor',
    chargePerDay: 3500,
    amenities: ['Central Oxygen Pipeline', 'Suction Machine', 'Defibrillator Access', 'Crash Cart Access'],
    status: 'Operational'
  }
];

export const generateDefaultBeds = () => {
  return Array(40).fill(0).map((_, i) => {
    let wardId, ward, roomId, roomNumber, type, charge, features;
    if (i < 10) {
      wardId = 'WRD-101';
      ward = 'Intensive Care Unit (ICU)';
      roomId = i < 5 ? 'RM-101' : 'RM-102';
      roomNumber = i < 5 ? 'ICU-101' : 'ICU-102';
      type = 'ICU';
      charge = 15000;
      features = ['Central Oxygen', 'Cardiac Monitor', 'Electric Fowler Bed', 'Ventilator Ready'];
    } else if (i < 20) {
      wardId = 'WRD-102';
      ward = 'Private Deluxe Wing';
      roomId = i < 15 ? 'RM-201' : 'RM-202';
      roomNumber = i < 15 ? 'PVT-201' : 'PVT-202';
      type = 'Private';
      charge = 5000;
      features = ['Motorized Bed', 'Attached Remote', 'Nurse Call Button', 'Oxygen Port'];
    } else if (i < 30) {
      wardId = 'WRD-103';
      ward = 'Semi-Private Care Ward';
      roomId = i < 25 ? 'RM-203' : 'RM-204';
      roomNumber = i < 25 ? 'SEMI-203' : 'SEMI-204';
      type = 'Semi Private';
      charge = 2500;
      features = ['Fowler Hospital Bed', 'IV Pole', 'Nurse Call Button'];
    } else {
      wardId = 'WRD-104';
      ward = 'General Medicine Ward';
      roomId = i < 35 ? 'RM-301' : 'RM-302';
      roomNumber = i < 35 ? 'GEN-301' : 'GEN-302';
      type = 'General Ward';
      charge = 1000;
      features = ['Standard Hospital Bed', 'IV Stand', 'Bedside Locker'];
    }

    return {
      id: `B-${101 + i}`,
      bedNumber: `Bed-${101 + i}`,
      wardId,
      ward,
      roomId,
      roomNumber,
      type,
      chargePerDay: charge,
      features,
      status: 'Available', // Available, HELD, Occupied, Cleaning, Maintenance
      uhid: null,
      heldUntil: null,
      notes: ''
    };
  });
};

const useStore = create(
  persist(
    (set, get) => ({
      patients: [],
      appointments: [],
      opdQueue: [],
      emergencyQueue: [],
      // Master Data Simulation
      masters: {
        admissionReasons: [
          { id: 'R1', name: 'Cardiac Surgery', minStay: 5, estCost: 150000, depositPct: 70 },
          { id: 'R2', name: 'Kidney Failure', minStay: 3, estCost: 80000, depositPct: 50 },
          { id: 'R3', name: 'Dialysis', minStay: 1, estCost: 15000, depositPct: 100 },
          { id: 'R4', name: 'General Observation', minStay: 1, estCost: 5000, depositPct: 100 }
        ],
        roomTypes: [
          { id: 'T1', name: 'General Ward', chargePerDay: 1000 },
          { id: 'T2', name: 'Semi Private', chargePerDay: 2500 },
          { id: 'T3', name: 'Private', chargePerDay: 5000 },
          { id: 'T4', name: 'ICU', chargePerDay: 15000 }
        ]
      },
      // Wards, Rooms, and Beds Hierarchy
      wards: DEFAULT_WARDS,
      rooms: DEFAULT_ROOMS,
      beds: generateDefaultBeds(),

      admissions: [],
      consultations: [],
      labOrders: [],
      pharmacyOrders: [],
      billing: [],
      payments: [],
      discharges: [],
      auditLogs: [],
      notifications: [],
      vitals: [], // Nursing Vitals
      doctorRounds: [], // Doctor Visits in IPD
      dietPlans: [], // Dietitian
      visitors: [], // Visitor Management

      injectDemoData: () => set((state) => {
        const demoBeds = state.beds.length > 0 ? state.beds : generateDefaultBeds();
        return {
          patients: [
            { uhid: 'HMS-2026-44142', name: 'John Doe', age: 45, gender: 'Male', phone: '+919876543210' },
            { uhid: 'HMS-2026-79571', name: 'Jane Smith', age: 32, gender: 'Female', phone: '+919876543211' }
          ],
          admissions: [
            { id: 'ADM-2026-1001', uhid: 'HMS-2026-44142', department: 'General Medicine', doctor: 'Dr. Smith', reason: 'Viral Fever', estCost: 15000, reqDeposit: 10000, status: 'ADMITTED', bedId: 'B-101', admissionDate: new Date(Date.now() - 86400000).toISOString() },
            { id: 'ADM-2026-1002', uhid: 'HMS-2026-79571', department: 'Cardiology', doctor: 'Dr. Adams', reason: 'Chest Pain', estCost: 50000, reqDeposit: 25000, status: 'DEPOSIT_PENDING', bedId: 'B-105', admissionDate: new Date().toISOString() }
          ],
          opdQueue: [
            { id: 'OPD-2026-001', uhid: 'HMS-2026-44142', department: 'General Medicine', doctor: 'Dr. Smith', status: 'WAITING', time: '10:30 AM' },
            { id: 'OPD-2026-002', uhid: 'HMS-2026-79571', department: 'Cardiology', doctor: 'Dr. Adams', status: 'WAITING', time: '11:15 AM' }
          ],
          beds: demoBeds.map(b => {
            if (b.id === 'B-101') return { ...b, status: 'Occupied', uhid: 'HMS-2026-44142' };
            if (b.id === 'B-105') return { ...b, status: 'HELD', uhid: 'HMS-2026-79571', heldUntil: new Date(Date.now() + 3600000).toISOString() };
            if (b.id === 'B-112') return { ...b, status: 'Cleaning', notes: 'Housekeeping requested post-discharge' };
            if (b.id === 'B-118') return { ...b, status: 'Maintenance', notes: 'Oxygen regulator scheduled calibration' };
            return b;
          }),
          labOrders: [
            { id: 'LAB-2026-501', uhid: 'HMS-2026-44142', tests: ['Complete Blood Count', 'Lipid Profile'], status: 'SAMPLE_PENDING', date: new Date().toISOString() },
            { id: 'LAB-2026-502', uhid: 'HMS-2026-79571', tests: ['ECG', 'Troponin'], status: 'PROCESSING', date: new Date().toISOString() }
          ],
          pharmacyOrders: [
            { id: 'PHR-2026-801', uhid: 'HMS-2026-44142', meds: ['Paracetamol 500mg (1-0-1)', 'Amoxicillin 250mg (1-1-1)'], status: 'DISPENSING_PENDING', date: new Date().toISOString() }
          ],
          billing: [
            { id: 'INV-2026-64449', uhid: 'HMS-2026-44142', type: 'OPD Consultation', amount: 650, status: 'PAID', date: new Date(Date.now() - 86400000).toISOString() }
          ],
          payments: [
            { id: 'PAY-2026-71850', invoiceId: 'INV-2026-64449', date: new Date(Date.now() - 86400000).toISOString() }
          ]
        };
      }),

      logAudit: (user, role, module, action, entityId, details) => {
        set((state) => ({
          auditLogs: [{
            id: generateId('AUD'),
            user: user || 'System User',
            role: role || 'STAFF',
            module,
            action,
            entityId,
            details,
            timestamp: new Date().toISOString()
          }, ...state.auditLogs]
        }));
      },

      addNotification: (type, title, message) => {
        set((state) => ({
          notifications: [{
            id: generateId('NOTIF'),
            type,
            title,
            message,
            timestamp: new Date().toISOString(),
            read: false
          }, ...state.notifications]
        }));
      },

      // --- WARD MANAGEMENT ACTIONS ---
      createWard: (wardData, user, role) => {
        const id = generateId('WRD');
        const newWard = {
          id,
          name: wardData.name,
          code: wardData.code || wardData.name.substring(0, 4).toUpperCase(),
          floor: wardData.floor || 'Ground Floor',
          block: wardData.block || 'Main Wing',
          type: wardData.type || 'General Ward',
          inCharge: wardData.inCharge || 'Staff In-Charge',
          genderSuitability: wardData.genderSuitability || 'All',
          status: wardData.status || 'Active',
          description: wardData.description || '',
          createdAt: new Date().toISOString()
        };

        set((state) => ({ wards: [...state.wards, newWard] }));
        get().logAudit(user, role, 'WARDS', 'CREATE', id, `Created Ward "${newWard.name}" (${newWard.code})`);
        get().addNotification('SUCCESS', 'Ward Created', `Ward "${newWard.name}" has been created successfully.`);
        return newWard;
      },

      updateWard: (wardId, updatedData, user, role) => {
        set((state) => {
          const updatedWards = state.wards.map(w => w.id === wardId ? { ...w, ...updatedData } : w);
          // If ward name changed, update corresponding rooms and beds as well
          const wardName = updatedData.name;
          const updatedRooms = wardName 
            ? state.rooms.map(r => r.wardId === wardId ? { ...r, wardName } : r)
            : state.rooms;
          const updatedBeds = wardName
            ? state.beds.map(b => b.wardId === wardId ? { ...b, ward: wardName } : b)
            : state.beds;

          return {
            wards: updatedWards,
            rooms: updatedRooms,
            beds: updatedBeds
          };
        });
        get().logAudit(user, role, 'WARDS', 'UPDATE', wardId, `Updated details for ward ${wardId}`);
        get().addNotification('INFO', 'Ward Updated', `Ward ${wardId} updated.`);
      },

      deleteWard: (wardId, user, role) => {
        const state = get();
        // Safety check: Cannot delete ward if any bed inside it is currently occupied or held
        const occupiedBeds = state.beds.filter(b => b.wardId === wardId && (b.status === 'Occupied' || b.status === 'HELD'));
        if (occupiedBeds.length > 0) {
          const err = `Cannot delete ward: ${occupiedBeds.length} bed(s) are currently occupied or held.`;
          alert(err);
          return { success: false, message: err };
        }

        const wardToDelete = state.wards.find(w => w.id === wardId);
        set((state) => ({
          wards: state.wards.filter(w => w.id !== wardId),
          rooms: state.rooms.filter(r => r.wardId !== wardId),
          beds: state.beds.filter(b => b.wardId !== wardId)
        }));
        get().logAudit(user, role, 'WARDS', 'DELETE', wardId, `Deleted ward "${wardToDelete?.name || wardId}"`);
        get().addNotification('WARNING', 'Ward Deleted', `Ward "${wardToDelete?.name || wardId}" and its empty rooms/beds were removed.`);
        return { success: true };
      },

      // --- ROOM MANAGEMENT ACTIONS ---
      createRoom: (roomData, user, role) => {
        const id = generateId('RM');
        const state = get();
        const ward = state.wards.find(w => w.id === roomData.wardId);
        const wardName = ward ? ward.name : (roomData.wardName || 'Unassigned');

        const newRoom = {
          id,
          roomNumber: roomData.roomNumber,
          wardId: roomData.wardId,
          wardName,
          roomType: roomData.roomType || 'General Multi-Bed',
          floor: roomData.floor || (ward ? ward.floor : '1st Floor'),
          chargePerDay: Number(roomData.chargePerDay) || 1500,
          amenities: Array.isArray(roomData.amenities) ? roomData.amenities : [],
          status: roomData.status || 'Operational',
          createdAt: new Date().toISOString()
        };

        set((state) => ({ rooms: [...state.rooms, newRoom] }));
        get().logAudit(user, role, 'ROOMS', 'CREATE', id, `Created Room "${newRoom.roomNumber}" in ward "${wardName}"`);
        get().addNotification('SUCCESS', 'Room Created', `Room ${newRoom.roomNumber} created in ${wardName}.`);
        return newRoom;
      },

      updateRoom: (roomId, updatedData, user, role) => {
        set((state) => {
          const updatedRooms = state.rooms.map(r => r.id === roomId ? { ...r, ...updatedData } : r);
          const roomNumber = updatedData.roomNumber;
          const updatedBeds = roomNumber
            ? state.beds.map(b => b.roomId === roomId ? { ...b, roomNumber } : b)
            : state.beds;

          return {
            rooms: updatedRooms,
            beds: updatedBeds
          };
        });
        get().logAudit(user, role, 'ROOMS', 'UPDATE', roomId, `Updated room details for ${roomId}`);
        get().addNotification('INFO', 'Room Updated', `Room ${roomId} updated.`);
      },

      deleteRoom: (roomId, user, role) => {
        const state = get();
        const occupiedBeds = state.beds.filter(b => b.roomId === roomId && (b.status === 'Occupied' || b.status === 'HELD'));
        if (occupiedBeds.length > 0) {
          const err = `Cannot delete room: ${occupiedBeds.length} bed(s) in this room are occupied or held.`;
          alert(err);
          return { success: false, message: err };
        }

        const roomToDelete = state.rooms.find(r => r.id === roomId);
        set((state) => ({
          rooms: state.rooms.filter(r => r.id !== roomId),
          beds: state.beds.filter(b => b.roomId !== roomId)
        }));
        get().logAudit(user, role, 'ROOMS', 'DELETE', roomId, `Deleted room "${roomToDelete?.roomNumber || roomId}"`);
        get().addNotification('WARNING', 'Room Deleted', `Room "${roomToDelete?.roomNumber || roomId}" was removed.`);
        return { success: true };
      },

      // --- BED MANAGEMENT ACTIONS ---
      createBed: (bedData, user, role) => {
        const id = bedData.id ? bedData.id.trim() : generateId('B');
        const state = get();

        // Check if bed id already exists
        if (state.beds.some(b => b.id.toLowerCase() === id.toLowerCase())) {
          alert(`Bed ID "${id}" already exists. Please choose a unique Bed ID.`);
          return { success: false, message: 'Bed ID already exists' };
        }

        const ward = state.wards.find(w => w.id === bedData.wardId);
        const room = state.rooms.find(r => r.id === bedData.roomId);

        const newBed = {
          id,
          bedNumber: bedData.bedNumber || id,
          wardId: bedData.wardId || (room ? room.wardId : ''),
          ward: ward ? ward.name : (bedData.ward || 'General Wing'),
          roomId: bedData.roomId || '',
          roomNumber: room ? room.roomNumber : (bedData.roomNumber || 'General'),
          type: bedData.type || (room ? room.roomType : 'General Ward'),
          chargePerDay: Number(bedData.chargePerDay) || (room ? room.chargePerDay : 1000),
          features: Array.isArray(bedData.features) ? bedData.features : ['Standard Bed'],
          status: bedData.status || 'Available', // Available, Cleaning, Maintenance
          uhid: null,
          heldUntil: null,
          notes: bedData.notes || '',
          createdAt: new Date().toISOString()
        };

        set((state) => ({ beds: [...state.beds, newBed] }));
        get().logAudit(user, role, 'BEDS', 'CREATE', id, `Created Bed "${newBed.id}" in Room "${newBed.roomNumber}" (${newBed.ward})`);
        get().addNotification('SUCCESS', 'Bed Created', `Bed ${newBed.id} added successfully.`);
        return { success: true, bed: newBed };
      },

      updateBed: (bedId, updatedData, user, role) => {
        set((state) => ({
          beds: state.beds.map(b => b.id === bedId ? { ...b, ...updatedData } : b)
        }));
        get().logAudit(user, role, 'BEDS', 'UPDATE', bedId, `Updated details for bed ${bedId}`);
        get().addNotification('INFO', 'Bed Updated', `Bed ${bedId} updated.`);
      },

      updateBedStatus: (bedId, newStatus, notes, user, role) => {
        set((state) => {
          return {
            beds: state.beds.map(b => {
              if (b.id === bedId) {
                // If switching to available, ensure UHID is cleared if not occupied
                const isCleared = (newStatus === 'Available' || newStatus === 'Cleaning' || newStatus === 'Maintenance') && b.status !== 'Occupied';
                return {
                  ...b,
                  status: newStatus,
                  uhid: isCleared ? null : b.uhid,
                  heldUntil: newStatus === 'Available' ? null : b.heldUntil,
                  notes: notes !== undefined ? notes : b.notes
                };
              }
              return b;
            })
          };
        });
        get().logAudit(user, role, 'BEDS', 'STATUS_CHANGE', bedId, `Changed bed ${bedId} status to ${newStatus}${notes ? ` (${notes})` : ''}`);
        get().addNotification('INFO', 'Bed Status Updated', `Bed ${bedId} is now marked as ${newStatus}.`);
      },

      deleteBed: (bedId, user, role) => {
        const state = get();
        const bed = state.beds.find(b => b.id === bedId);
        if (!bed) return { success: false, message: 'Bed not found' };

        if (bed.status === 'Occupied' || bed.status === 'HELD') {
          const err = `Cannot delete bed ${bedId} while it is ${bed.status}.`;
          alert(err);
          return { success: false, message: err };
        }

        set((state) => ({
          beds: state.beds.filter(b => b.id !== bedId)
        }));
        get().logAudit(user, role, 'BEDS', 'DELETE', bedId, `Deleted bed ${bedId}`);
        get().addNotification('WARNING', 'Bed Deleted', `Bed ${bedId} has been removed.`);
        return { success: true };
      },

      registerPatient: (patientData, user, role) => {
        const uhid = generateId('HMS');
        const newPatient = { ...patientData, uhid, registeredAt: new Date().toISOString() };
        set((state) => ({ patients: [...state.patients, newPatient] }));
        get().logAudit(user, role, 'PATIENTS', 'CREATE', uhid, `Registered patient ${patientData.firstName}`);
        return uhid;
      },

      createAppointment: (apptData, user, role) => {
        const id = generateId('APT');
        set((state) => ({ appointments: [...state.appointments, { ...apptData, id, status: 'BOOKED' }] }));
        get().logAudit(user, role, 'APPOINTMENTS', 'CREATE', id, `Created appointment for ${apptData.uhid}`);
        return id;
      },

      addToOpdQueue: (uhid, department, doctor, fee, user, role) => {
        const id = generateId('OPD');
        const queueItem = { id, uhid, department, doctor, status: 'WAITING', time: new Date().toLocaleTimeString() };
        
        set((state) => ({ 
          opdQueue: [...state.opdQueue, queueItem],
          billing: [...state.billing, { id: generateId('INV'), uhid, type: 'OPD Consultation', amount: fee, status: 'PENDING' }]
        }));
        
        get().logAudit(user, role, 'OPD', 'CREATE', id, `Added ${uhid} to OPD queue`);
        return id;
      },

      updateOpdStatus: (id, status, user, role) => {
        set((state) => ({
          opdQueue: state.opdQueue.map(q => q.id === id ? { ...q, status } : q)
        }));
        get().logAudit(user, role, 'OPD', 'UPDATE', id, `Changed status to ${status}`);
      },

      admitToIpd: (uhid, doctor, department, user, role) => {
        const id = generateId('IPD-REQ');
        set((state) => ({
          admissions: [...state.admissions, { 
            id, uhid, doctor, department, 
            status: 'PENDING', 
            requestDate: new Date().toISOString() 
          }]
        }));
        get().logAudit(user, role, 'IPD', 'CREATE', id, `Requested IPD admission for ${uhid}`);
        get().addNotification('INFO', 'New IPD Request', `Admission requested for ${uhid}`);
      },

      assignBedToPatient: (assignmentData, user, role) => {
        const { uhid, bedId, doctor, department, reason, estCost, reqDeposit, isDirectAdmission = true, notes } = assignmentData;
        const state = get();
        const bed = state.beds.find(b => b.id === bedId);
        if (!bed) {
          alert('Selected bed not found.');
          return { success: false, message: 'Bed not found' };
        }
        if (bed.status === 'Occupied' && bed.uhid !== uhid) {
          alert(`Bed ${bedId} is already occupied by patient ${bed.uhid}.`);
          return { success: false, message: 'Bed already occupied' };
        }

        const patient = state.patients.find(p => p.uhid === uhid);
        const patientName = patient ? patient.name : uhid;
        const admissionId = generateId('ADM');
        const invoiceId = reqDeposit > 0 ? generateId('INV') : null;

        const newAdmission = {
          id: admissionId,
          uhid,
          bedId,
          doctor: doctor || 'Dr. Smith',
          department: department || bed.ward || 'General Medicine',
          reason: reason || 'Inpatient Admission',
          estCost: Number(estCost) || (bed.chargePerDay ? bed.chargePerDay * 3 : 15000),
          reqDeposit: Number(reqDeposit) || 5000,
          status: isDirectAdmission ? 'ADMITTED' : 'PAYMENT_PENDING',
          admissionDate: new Date().toISOString(),
          invoiceId,
          notes: notes || ''
        };

        const newBedStatus = isDirectAdmission ? 'Occupied' : 'HELD';
        const heldUntil = isDirectAdmission ? null : new Date(Date.now() + 60 * 60 * 1000).toISOString();

        set((state) => {
          const updatedBilling = (reqDeposit > 0 && invoiceId) ? [
            ...state.billing,
            {
              id: invoiceId,
              uhid,
              type: 'IPD Deposit',
              amount: Number(reqDeposit),
              status: isDirectAdmission ? 'PAID' : 'PENDING',
              date: new Date().toISOString()
            }
          ] : state.billing;

          return {
            admissions: [newAdmission, ...state.admissions.filter(a => a.uhid !== uhid || a.status === 'DISCHARGED')],
            beds: state.beds.map(b => b.id === bedId ? {
              ...b,
              status: newBedStatus,
              uhid,
              heldUntil,
              notes: notes || b.notes
            } : b),
            billing: updatedBilling
          };
        });

        get().logAudit(user, role, 'BEDS', isDirectAdmission ? 'ASSIGN_PATIENT' : 'HOLD', bedId, 
          `${isDirectAdmission ? 'Assigned' : 'Held'} Bed ${bedId} for patient ${patientName} (${uhid})`);
        get().addNotification('SUCCESS', isDirectAdmission ? 'Patient Admitted to Bed' : 'Bed Reserved', 
          `${patientName} (${uhid}) assigned to Bed ${bedId} (${bed.ward}).`);

        return { success: true, admission: newAdmission };
      },

      vacateBed: (bedId, user, role) => {
        const state = get();
        const bed = state.beds.find(b => b.id === bedId);
        if (!bed) return { success: false };

        set((state) => ({
          beds: state.beds.map(b => b.id === bedId ? {
            ...b,
            status: 'Cleaning',
            uhid: null,
            heldUntil: null,
            notes: 'Vacated. Scheduled for housekeeping.'
          } : b)
        }));

        get().logAudit(user, role, 'BEDS', 'VACATE', bedId, `Vacated bed ${bedId} and placed in cleaning`);
        get().addNotification('INFO', 'Bed Vacated', `Bed ${bedId} vacated and scheduled for sanitization.`);
        return { success: true };
      },

      holdRoomAndRequestDeposit: (admissionId, bedId, admissionDetails, user, role) => {
        set((state) => {
          const { reason, estCost, reqDeposit } = admissionDetails;
          const invoiceId = generateId('INV');
          
          return {
            admissions: state.admissions.map(a => a.id === admissionId ? { 
              ...a, status: 'PAYMENT_PENDING', bedId, reason, estCost, reqDeposit, invoiceId 
            } : a),
            beds: state.beds.map(b => b.id === bedId ? { 
              ...b, status: 'HELD', uhid: state.admissions.find(a=>a.id===admissionId)?.uhid, heldUntil: new Date(Date.now() + 60*60*1000).toISOString() 
            } : b),
            billing: [...state.billing, { 
              id: invoiceId, uhid: state.admissions.find(a=>a.id===admissionId)?.uhid, type: 'IPD Deposit', amount: reqDeposit, status: 'PENDING' 
            }]
          };
        });
        get().logAudit(user, role, 'BEDS', 'HOLD', bedId, `Held bed for admission ${admissionId}`);
      },

      allocateBed: (admissionId, bedId, user, role) => {
        set((state) => {
          const admission = state.admissions.find(a => a.id === admissionId);
          if (!admission) return state;

          return {
            admissions: state.admissions.map(a => a.id === admissionId ? { ...a, status: 'ADMITTED', admissionDate: new Date().toISOString() } : a),
            beds: state.beds.map(b => b.id === bedId ? { ...b, status: 'Occupied', uhid: admission.uhid } : b)
          };
        });
        get().logAudit(user, role, 'BEDS', 'ALLOCATE', bedId, `Allocated bed to admission ${admissionId}`);
      },

      recordVitals: (admissionId, uhid, vitalsData, user, role) => {
        const id = generateId('VIT');
        set((state) => ({
          vitals: [{ id, admissionId, uhid, ...vitalsData, time: new Date().toISOString(), nurse: user }, ...state.vitals]
        }));
        get().logAudit(user, role, 'NURSING', 'CREATE', id, `Recorded vitals for ${uhid}`);
      },

      recordDoctorRound: (admissionId, uhid, notes, charge, user, role) => {
        const id = generateId('RND');
        const invoiceId = generateId('INV');
        set((state) => ({
          doctorRounds: [{ id, admissionId, uhid, notes, time: new Date().toISOString(), doctor: user }, ...state.doctorRounds],
          billing: [...state.billing, { id: invoiceId, uhid, admissionId, type: 'Doctor Visit Round', amount: charge, status: 'PENDING', date: new Date().toISOString() }]
        }));
        get().logAudit(user, role, 'DOCTOR', 'CREATE', id, `Recorded IPD round for ${uhid}`);
      },

      transferBed: (admissionId, newBedId, user, role) => {
        set((state) => {
          const admission = state.admissions.find(a => a.id === admissionId);
          if (!admission) return state;
          const oldBedId = admission.bedId;

          return {
            admissions: state.admissions.map(a => a.id === admissionId ? { ...a, bedId: newBedId } : a),
            beds: state.beds.map(b => {
              if (b.id === oldBedId) return { ...b, status: 'Cleaning', uhid: null };
              if (b.id === newBedId) return { ...b, status: 'Occupied', uhid: admission.uhid };
              return b;
            })
          };
        });
        get().logAudit(user, role, 'BEDS', 'TRANSFER', newBedId, `Transferred admission ${admissionId} to new bed`);
      },

      orderLabTest: (uhid, tests, user, role) => {
        const id = generateId('LAB');
        set((state) => ({
          labOrders: [...state.labOrders, { id, uhid, tests, status: 'SAMPLE_PENDING' }],
          billing: [...state.billing, { id: generateId('INV'), uhid, type: 'Lab Tests', amount: tests.length * 800, status: 'PENDING' }]
        }));
        get().logAudit(user, role, 'LAB', 'CREATE', id, `Ordered lab tests for ${uhid}`);
        get().addNotification('INFO', 'New Lab Order', `Lab order ${id} created for ${uhid}`);
      },

      processLabSample: (id, status, user, role) => {
        set((state) => ({
          labOrders: state.labOrders.map(l => l.id === id ? { ...l, status } : l)
        }));
        get().logAudit(user, role, 'LAB', 'UPDATE', id, `Updated lab order to ${status}`);
        if (status === 'RELEASED') {
          get().addNotification('SUCCESS', 'Lab Results Ready', `Results for order ${id} released`);
        }
      },

      orderPharmacy: (uhid, meds, user, role) => {
        const id = generateId('PHRX');
        set((state) => ({
          pharmacyOrders: [...state.pharmacyOrders, { id, uhid, meds, status: 'DISPENSING_PENDING' }],
          billing: [...state.billing, { id: generateId('INV'), uhid, type: 'Pharmacy', amount: meds.length * 350, status: 'PENDING' }]
        }));
        get().logAudit(user, role, 'PHARMACY', 'CREATE', id, `Created prescription for ${uhid}`);
      },

      dispenseMedicine: (id, user, role) => {
        set((state) => ({
          pharmacyOrders: state.pharmacyOrders.map(p => p.id === id ? { ...p, status: 'DISPENSED' } : p)
        }));
        get().logAudit(user, role, 'PHARMACY', 'UPDATE', id, `Dispensed medicines`);
      },

      collectPayment: (invoiceId, user, role) => {
        set((state) => {
          // If this invoice is an IPD Deposit, update admission status to CONFIRMED
          return {
            billing: state.billing.map(b => b.id === invoiceId ? { ...b, status: 'PAID' } : b),
            payments: [...state.payments, { id: generateId('PAY'), invoiceId, date: new Date().toISOString() }],
            admissions: state.admissions.map(a => a.invoiceId === invoiceId ? { ...a, status: 'CONFIRMED' } : a)
          };
        });
        get().logAudit(user, role, 'BILLING', 'COLLECT', invoiceId, `Collected payment`);
        get().addNotification('SUCCESS', 'Payment Received', `Payment collected for invoice ${invoiceId}`);
      },

      requestDischarge: (uhid, user, role) => {
        const id = generateId('DSCH');
        set((state) => ({
          discharges: [...state.discharges, { id, uhid, doctor: 'Pending', nursing: 'Pending', billing: 'Pending' }]
        }));
        get().logAudit(user, role, 'DISCHARGE', 'CREATE', id, `Requested discharge for ${uhid}`);
      },

      clearDischarge: (uhid, dept, user, role) => {
        set((state) => ({
          discharges: state.discharges.map(d => d.uhid === uhid ? { ...d, [dept]: 'Cleared' } : d)
        }));
        get().logAudit(user, role, 'DISCHARGE', 'APPROVE', uhid, `Cleared ${dept} for discharge`);
      },

      finalizeDischarge: (uhid, user, role) => {
        set((state) => ({
          discharges: state.discharges.filter(d => d.uhid !== uhid),
          beds: state.beds.map(b => b.uhid === uhid ? { ...b, status: 'Cleaning', uhid: null } : b)
        }));
        get().logAudit(user, role, 'DISCHARGE', 'FINALIZE', uhid, `Finalized discharge for ${uhid}`);
        get().addNotification('SUCCESS', 'Discharge Complete', `Patient ${uhid} discharged successfully.`);

        // Simulate cleaning time
        setTimeout(() => {
          set((state) => ({
            beds: state.beds.map(b => b.status === 'Cleaning' && !b.uhid ? { ...b, status: 'Available' } : b)
          }));
        }, 15000);
      },

      resetStore: () => {
        set({
          patients: [], appointments: [], opdQueue: [], emergencyQueue: [], admissions: [],
          consultations: [], labOrders: [], pharmacyOrders: [], billing: [], payments: [],
          discharges: [], auditLogs: [], notifications: [],
          wards: DEFAULT_WARDS,
          rooms: DEFAULT_ROOMS,
          beds: generateDefaultBeds()
        });
      }
    }),
    {
      name: 'hms-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!state.wards || state.wards.length === 0) {
            state.wards = DEFAULT_WARDS;
          }
          if (!state.rooms || state.rooms.length === 0) {
            state.rooms = DEFAULT_ROOMS;
          }
          if (!state.beds || state.beds.length === 0) {
            state.beds = generateDefaultBeds();
          } else {
            // Guarantee wardId and roomId mapping exists for all legacy beds
            const defBeds = generateDefaultBeds();
            state.beds = state.beds.map((b, i) => {
              if (!b.wardId || !b.roomNumber) {
                const sample = defBeds[i % defBeds.length];
                return {
                  ...b,
                  bedNumber: b.bedNumber || b.id,
                  wardId: b.wardId || sample.wardId,
                  ward: b.ward || sample.ward,
                  roomId: b.roomId || sample.roomId,
                  roomNumber: b.roomNumber || sample.roomNumber,
                  chargePerDay: b.chargePerDay || sample.chargePerDay,
                  features: b.features || sample.features
                };
              }
              return b;
            });
          }
        }
      }
    }
  )
);

export default useStore;
