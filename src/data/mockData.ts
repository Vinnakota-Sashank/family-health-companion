import { Elder, Medicine, Reminder, Vital, Appointment, Prescription, HealthSummary, CarePlanEvent } from '@/types';

export const mockElders: Elder[] = [
  {
    id: 'elder-1',
    name: 'Ramesh Kumar',
    age: 72,
    relation: 'Dada (Grandfather)',
    avatar: '👴',
    conditions: ['Type 2 Diabetes', 'Hypertension'],
    allergies: ['Penicillin'],
    primaryCaregiver: 'Rahul Kumar',
    caregiverPhone: '+91 98765 43210',
  },
  {
    id: 'elder-2',
    name: 'Kamla Devi',
    age: 68,
    relation: 'Dadi (Grandmother)',
    avatar: '👵',
    conditions: ['Arthritis', 'Osteoporosis'],
    allergies: ['Sulfa drugs', 'Aspirin'],
    primaryCaregiver: 'Rahul Kumar',
    caregiverPhone: '+91 98765 43210',
  },
];

export const mockMedicines: Medicine[] = [
  {
    id: 'med-1',
    elderId: 'elder-1',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    times: ['08:00', '20:00'],
    mealTiming: 'after',
    duration: 'Ongoing',
    notes: 'Take with plenty of water',
    startDate: '2024-01-15',
  },
  {
    id: 'med-2',
    elderId: 'elder-1',
    name: 'Amlodipine',
    dosage: '5mg',
    frequency: 'Once daily',
    times: ['09:00'],
    mealTiming: 'before',
    duration: 'Ongoing',
    notes: 'Blood pressure medication',
    startDate: '2024-02-01',
  },
  {
    id: 'med-3',
    elderId: 'elder-2',
    name: 'Calcium + Vitamin D',
    dosage: '500mg + 400IU',
    frequency: 'Once daily',
    times: ['10:00'],
    mealTiming: 'with',
    duration: 'Ongoing',
    notes: 'For bone health',
    startDate: '2024-01-01',
  },
  {
    id: 'med-4',
    elderId: 'elder-2',
    name: 'Glucosamine',
    dosage: '1500mg',
    frequency: 'Once daily',
    times: ['12:00'],
    mealTiming: 'after',
    duration: '3 months',
    notes: 'For joint support',
    startDate: '2024-03-01',
    endDate: '2024-06-01',
  },
];

const today = new Date().toISOString().split('T')[0];

export const mockReminders: Reminder[] = [
  {
    id: 'rem-1',
    medicineId: 'med-1',
    elderId: 'elder-1',
    scheduledTime: `${today}T08:00:00`,
    status: 'taken',
    smsStatus: 'sent',
    voiceStatus: 'sent',
    takenAt: `${today}T08:15:00`,
  },
  {
    id: 'rem-2',
    medicineId: 'med-2',
    elderId: 'elder-1',
    scheduledTime: `${today}T09:00:00`,
    status: 'sent',
    smsStatus: 'sent',
    voiceStatus: 'pending',
  },
  {
    id: 'rem-3',
    medicineId: 'med-3',
    elderId: 'elder-2',
    scheduledTime: `${today}T10:00:00`,
    status: 'scheduled',
    smsStatus: 'pending',
    voiceStatus: 'pending',
  },
  {
    id: 'rem-4',
    medicineId: 'med-1',
    elderId: 'elder-1',
    scheduledTime: `${today}T20:00:00`,
    status: 'scheduled',
    smsStatus: 'pending',
    voiceStatus: 'pending',
  },
  {
    id: 'rem-5',
    medicineId: 'med-4',
    elderId: 'elder-2',
    scheduledTime: `${today}T12:00:00`,
    status: 'missed',
    smsStatus: 'sent',
    voiceStatus: 'sent',
  },
];

export const mockVitals: Vital[] = [
  {
    id: 'vital-1',
    elderId: 'elder-1',
    type: 'blood_pressure',
    value: '138/88',
    unit: 'mmHg',
    recordedAt: `${today}T07:30:00`,
    notes: 'Slightly elevated',
  },
  {
    id: 'vital-2',
    elderId: 'elder-1',
    type: 'blood_sugar',
    value: '142',
    unit: 'mg/dL',
    recordedAt: `${today}T07:45:00`,
    notes: 'Fasting',
  },
  {
    id: 'vital-3',
    elderId: 'elder-2',
    type: 'blood_pressure',
    value: '125/82',
    unit: 'mmHg',
    recordedAt: `${today}T08:00:00`,
  },
  {
    id: 'vital-4',
    elderId: 'elder-1',
    type: 'heart_rate',
    value: '76',
    unit: 'bpm',
    recordedAt: `${today}T07:30:00`,
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: 'apt-1',
    elderId: 'elder-1',
    doctorName: 'Dr. Sharma',
    specialty: 'Cardiologist',
    date: '2024-12-30',
    time: '11:00',
    location: 'Apollo Hospital, Delhi',
    notes: 'Follow-up for BP management',
    status: 'scheduled',
  },
  {
    id: 'apt-2',
    elderId: 'elder-2',
    doctorName: 'Dr. Gupta',
    specialty: 'Orthopedic',
    date: '2025-01-02',
    time: '14:30',
    location: 'Max Healthcare, Gurgaon',
    notes: 'Routine check for arthritis',
    status: 'scheduled',
  },
];

export const mockPrescriptions: Prescription[] = [
  {
    id: 'presc-1',
    elderId: 'elder-1',
    doctorName: 'Dr. Sharma',
    date: '2024-12-15',
    aiParsed: true,
    medicines: [
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
      { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily' },
    ],
    notes: 'Continue current medications. Review in 3 months.',
  },
];

export const mockHealthSummaries: HealthSummary[] = [
  {
    id: 'summary-1',
    elderId: 'elder-1',
    weekStarting: '2024-12-23',
    adherenceRate: 87,
    vitalsOverview: 'Blood pressure slightly elevated on 2 days. Blood sugar within target range.',
    concerns: ['BP readings above 140/90 on Tuesday and Thursday'],
    recommendations: ['Reduce salt intake', 'Ensure evening walk is taken daily'],
    trend: 'stable',
  },
  {
    id: 'summary-2',
    elderId: 'elder-2',
    weekStarting: '2024-12-23',
    adherenceRate: 92,
    vitalsOverview: 'All vitals stable. Good medication adherence.',
    concerns: [],
    recommendations: ['Continue calcium supplements', 'Light stretching exercises recommended'],
    trend: 'improving',
  },
];

export const mockCarePlanEvents: CarePlanEvent[] = [
  {
    id: 'event-1',
    elderId: 'elder-1',
    date: '2024-12-15',
    type: 'prescription',
    title: 'Prescription Updated',
    description: 'Dr. Sharma updated medication dosages',
  },
  {
    id: 'event-2',
    elderId: 'elder-1',
    date: '2024-11-20',
    type: 'appointment',
    title: 'Cardiology Check-up',
    description: 'Routine heart health examination completed',
  },
  {
    id: 'event-3',
    elderId: 'elder-1',
    date: '2024-10-05',
    type: 'condition',
    title: 'Hypertension Diagnosed',
    description: 'Started on Amlodipine for blood pressure management',
  },
  {
    id: 'event-4',
    elderId: 'elder-2',
    date: '2024-12-01',
    type: 'prescription',
    title: 'New Supplement Added',
    description: 'Glucosamine added for joint support',
  },
];
