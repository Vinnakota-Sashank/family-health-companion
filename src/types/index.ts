export type ReminderStatus = 'scheduled' | 'sent' | 'taken' | 'missed' | 'snoozed';

export type MealTiming = 'before' | 'after' | 'with';

export type TrendIndicator = 'improving' | 'stable' | 'warning';

export interface Elder {
  id: string;
  name: string;
  age: number;
  relation: string;
  avatar: string;
  conditions: string[];
  allergies: string[];
  primaryCaregiver: string;
  caregiverPhone: string;
  vitals: Vital[];
}

export interface Medicine {
  id: string;
  elderId: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  mealTiming: MealTiming;
  duration: string;
  notes: string;
  startDate: string;
  endDate?: string;
}

export interface Reminder {
  id: string;
  medicineId: string;
  elderId: string;
  scheduledTime: string;
  status: ReminderStatus;
  smsStatus: 'pending' | 'sent' | 'failed';
  voiceStatus: 'pending' | 'sent' | 'failed';
  takenAt?: string;
}

export type VitalType = 'BP' | 'Sugar' | 'Heart Rate' | 'SpO2' | 'Temp' | 'Weight';

export interface Vital {
  id: string;
  elderId: string;
  type: VitalType;
  value: string;
  unit: string;
  recordedAt: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  elderId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Prescription {
  id: string;
  elderId: string;
  doctorName: string;
  date: string;
  imageUrl?: string;
  aiParsed: boolean;
  medicines: Partial<Medicine>[];
  notes: string;
}

export interface HealthSummary {
  id: string;
  elderId: string;
  weekStarting: string;
  adherenceRate: number;
  vitalsOverview: string;
  concerns: string[];
  recommendations: string[];
  trend: TrendIndicator;
}

export interface CarePlanEvent {
  id: string;
  elderId: string;
  date: string;
  type: 'prescription' | 'appointment' | 'condition' | 'vitals' | 'note';
  title: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
