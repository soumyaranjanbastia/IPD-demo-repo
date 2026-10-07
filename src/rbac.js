export const ROLES = [
  'SUPER_ADMIN',
  'RECEPTIONIST',
  'DOCTOR',
  'NURSE',
  'BILLING_EXECUTIVE',
  'PHARMACIST',
  'LAB_TECHNICIAN'
];

// Permission Matrix (C=Create, R=Read, U=Update, D=Delete)
// Simplified to boolean flags for prototype UI purposes based on the PRD
export const PERMISSION_MATRIX = {
  SUPER_ADMIN: {
    dashboard: ['view'],
    patients: ['create', 'read', 'update', 'delete'],
    opd: ['create', 'read', 'update', 'delete'],
    consultation: ['create', 'read', 'update', 'delete'],
    ipd: ['create', 'read', 'update', 'delete'],
    nursing: ['create', 'read', 'update', 'delete'],
    billing: ['create', 'read', 'update', 'delete'],
    pharmacy: ['create', 'read', 'update', 'delete'],
    lab: ['create', 'read', 'update', 'delete'],
    discharge: ['create', 'read', 'update', 'delete']
  },
  RECEPTIONIST: {
    dashboard: ['view'],
    patients: ['create', 'read', 'update'],
    opd: ['create', 'read', 'update'],
    consultation: ['read'],
    ipd: ['read'],
    nursing: [],
    billing: ['create', 'read'],
    pharmacy: [],
    lab: [],
    discharge: ['read']
  },
  DOCTOR: {
    dashboard: ['view'],
    patients: ['read'],
    opd: ['read'],
    consultation: ['create', 'read', 'update'],
    ipd: ['create', 'read', 'update'],
    nursing: ['read'],
    billing: ['read'],
    pharmacy: ['read'],
    lab: ['create', 'read'],
    discharge: ['create'] // Request discharge
  },
  NURSE: {
    dashboard: ['view'],
    patients: ['read'],
    opd: ['read'],
    consultation: ['read'],
    ipd: ['read'],
    nursing: ['create', 'read', 'update'],
    billing: ['read'],
    pharmacy: ['read'],
    lab: ['read'],
    discharge: ['read']
  },
  BILLING_EXECUTIVE: {
    dashboard: ['view'],
    patients: ['read'],
    opd: ['read'],
    consultation: ['read'],
    ipd: ['read'],
    nursing: ['read'],
    billing: ['create', 'read', 'update'],
    pharmacy: ['read'],
    lab: ['read'],
    discharge: ['create'] // Billing clearance
  },
  PHARMACIST: {
    dashboard: ['view'],
    patients: ['read'],
    opd: [],
    consultation: ['read'],
    ipd: ['read'],
    nursing: ['read'],
    billing: ['read'],
    pharmacy: ['create', 'read', 'update'],
    lab: [],
    discharge: []
  },
  LAB_TECHNICIAN: {
    dashboard: ['view'],
    patients: ['read'],
    opd: [],
    consultation: ['read'],
    ipd: ['read'],
    nursing: ['read'],
    billing: ['read'],
    pharmacy: [],
    lab: ['create', 'read', 'update'],
    discharge: []
  }
};

export const hasPermission = (role, module, action = 'read') => {
  if (!PERMISSION_MATRIX[role] || !PERMISSION_MATRIX[role][module]) {
    return false;
  }
  return PERMISSION_MATRIX[role][module].includes(action);
};
