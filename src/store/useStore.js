import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const generateId = (prefix) => `${prefix}-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;

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
      beds: Array(40).fill(0).map((_, i) => {
        const type = i < 10 ? 'ICU' : i < 20 ? 'Private' : i < 30 ? 'Semi Private' : 'General Ward';
        return {
          id: `B-${101 + i}`,
          ward: type === 'ICU' ? 'ICU Ward' : type === 'Private' ? 'Private Wing' : 'General Wing',
          type,
          status: 'Available', // Available, HELD, Occupied, Cleaning, Maintenance
          uhid: null,
          heldUntil: null
        };
      }),
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

      injectDemoData: () => set((state) => ({
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
        beds: state.beds.map(b => {
          if (b.id === 'B-101') return { ...b, status: 'Occupied', uhid: 'HMS-2026-44142' };
          if (b.id === 'B-105') return { ...b, status: 'HELD', uhid: 'HMS-2026-79571', heldUntil: new Date(Date.now() + 3600000).toISOString() };
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
      })),

      logAudit: (user, role, module, action, entityId, details) => {
        set((state) => ({
          auditLogs: [{
            id: generateId('AUD'),
            user,
            role,
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

      orderLabTest: (uhid, tests, user, role) => {
        const id = generateId('LAB');
        set((state) => ({
          labOrders: [...state.labOrders, { id, uhid, tests, status: 'SAMPLE_PENDING', date: new Date().toISOString() }],
          billing: [...state.billing, { id: generateId('INV'), uhid, type: 'Lab Test', amount: 1500, status: 'PENDING', date: new Date().toISOString() }]
        }));
        get().logAudit(user, role, 'LAB', 'CREATE', id, `Ordered lab tests for ${uhid}`);
      },

      orderPharmacy: (uhid, meds, user, role) => {
        const id = generateId('PHR');
        set((state) => ({
          pharmacyOrders: [...state.pharmacyOrders, { id, uhid, meds, status: 'DISPENSING_PENDING', date: new Date().toISOString() }],
          billing: [...state.billing, { id: generateId('INV'), uhid, type: 'Pharmacy Prescription', amount: 500, status: 'PENDING', date: new Date().toISOString() }]
        }));
        get().logAudit(user, role, 'PHARMACY', 'CREATE', id, `Ordered pharmacy meds for ${uhid}`);
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
          const ipdAdmission = state.admissions.find(a => a.invoiceId === invoiceId && a.status === 'PAYMENT_PENDING');
          
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
          beds: Array(40).fill(0).map((_, i) => ({
            id: `B-${101 + i}`, ward: i < 10 ? 'ICU' : i < 20 ? 'General' : 'Private', status: 'Available', uhid: null
          }))
        });
      }
    }),
    {
      name: 'hms-storage',
    }
  )
);

export default useStore;
