import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Elder, Medicine, Reminder, Vital, Appointment, Prescription, HealthSummary, CarePlanEvent, User, ReminderStatus } from '@/types';
import { mockElders, mockMedicines, mockReminders, mockVitals, mockAppointments, mockPrescriptions, mockHealthSummaries, mockCarePlanEvents } from '@/data/mockData';

interface AppContextType {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Data
  elders: Elder[];
  medicines: Medicine[];
  reminders: Reminder[];
  vitals: Vital[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  healthSummaries: HealthSummary[];
  carePlanEvents: CarePlanEvent[];

  // Actions
  addMedicine: (medicine: Omit<Medicine, 'id'>) => void;
  updateReminderStatus: (reminderId: string, status: ReminderStatus) => void;
  snoozeReminder: (reminderId: string) => void;
  addVital: (vital: Omit<Vital, 'id'>) => void;
  addPrescription: (prescription: Omit<Prescription, 'id'>) => void;

  // Helpers
  getElderById: (id: string) => Elder | undefined;
  getMedicinesForElder: (elderId: string) => Medicine[];
  getRemindersForElder: (elderId: string) => Reminder[];
  getTodaysReminders: () => Reminder[];
  getVitalsForElder: (elderId: string) => Vital[];
  getAppointmentsForElder: (elderId: string) => Appointment[];
  getSummaryForElder: (elderId: string) => HealthSummary | undefined;
  getCarePlanEventsForElder: (elderId: string) => CarePlanEvent[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [elders] = useState<Elder[]>(mockElders);
  const [medicines, setMedicines] = useState<Medicine[]>(mockMedicines);
  const [reminders, setReminders] = useState<Reminder[]>(mockReminders);
  const [vitals, setVitals] = useState<Vital[]>(mockVitals);
  const [appointments] = useState<Appointment[]>(mockAppointments);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(mockPrescriptions);
  const [healthSummaries] = useState<HealthSummary[]>(mockHealthSummaries);
  const [carePlanEvents] = useState<CarePlanEvent[]>(mockCarePlanEvents);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate login
    if (email && password.length >= 4) {
      setUser({
        id: 'user-1',
        name: 'Rahul Kumar',
        email: email,
        avatar: '👨‍💼',
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const addMedicine = (medicine: Omit<Medicine, 'id'>) => {
    const newMedicine: Medicine = {
      ...medicine,
      id: `med-${Date.now()}`,
    };
    setMedicines(prev => [...prev, newMedicine]);

    // Auto-create reminders for today
    const today = new Date().toISOString().split('T')[0];
    medicine.times.forEach((time, index) => {
      const newReminder: Reminder = {
        id: `rem-${Date.now()}-${index}`,
        medicineId: newMedicine.id,
        elderId: medicine.elderId,
        scheduledTime: `${today}T${time}:00`,
        status: 'scheduled',
        smsStatus: 'pending',
        voiceStatus: 'pending',
      };
      setReminders(prev => [...prev, newReminder]);
    });
  };

  const updateReminderStatus = (reminderId: string, status: ReminderStatus) => {
    setReminders(prev =>
      prev.map(rem =>
        rem.id === reminderId
          ? {
              ...rem,
              status,
              takenAt: status === 'taken' ? new Date().toISOString() : rem.takenAt,
              smsStatus: status === 'taken' ? 'sent' : rem.smsStatus,
              voiceStatus: status === 'taken' ? 'sent' : rem.voiceStatus,
            }
          : rem
      )
    );
  };

  const snoozeReminder = (reminderId: string) => {
    setReminders(prev =>
      prev.map(rem =>
        rem.id === reminderId
          ? {
              ...rem,
              status: 'snoozed' as ReminderStatus,
              scheduledTime: new Date(new Date(rem.scheduledTime).getTime() + 30 * 60000).toISOString(),
            }
          : rem
      )
    );
  };

  const addVital = (vital: Omit<Vital, 'id'>) => {
    const newVital: Vital = {
      ...vital,
      id: `vital-${Date.now()}`,
    };
    setVitals(prev => [...prev, newVital]);
  };

  const addPrescription = (prescription: Omit<Prescription, 'id'>) => {
    const newPrescription: Prescription = {
      ...prescription,
      id: `presc-${Date.now()}`,
    };
    setPrescriptions(prev => [...prev, newPrescription]);
  };

  const getElderById = (id: string) => elders.find(e => e.id === id);
  const getMedicinesForElder = (elderId: string) => medicines.filter(m => m.elderId === elderId);
  const getRemindersForElder = (elderId: string) => reminders.filter(r => r.elderId === elderId);
  const getTodaysReminders = () => {
    const today = new Date().toISOString().split('T')[0];
    return reminders.filter(r => r.scheduledTime.startsWith(today));
  };
  const getVitalsForElder = (elderId: string) => vitals.filter(v => v.elderId === elderId);
  const getAppointmentsForElder = (elderId: string) => appointments.filter(a => a.elderId === elderId);
  const getSummaryForElder = (elderId: string) => healthSummaries.find(s => s.elderId === elderId);
  const getCarePlanEventsForElder = (elderId: string) => carePlanEvents.filter(e => e.elderId === elderId);

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        elders,
        medicines,
        reminders,
        vitals,
        appointments,
        prescriptions,
        healthSummaries,
        carePlanEvents,
        addMedicine,
        updateReminderStatus,
        snoozeReminder,
        addVital,
        addPrescription,
        getElderById,
        getMedicinesForElder,
        getRemindersForElder,
        getTodaysReminders,
        getVitalsForElder,
        getAppointmentsForElder,
        getSummaryForElder,
        getCarePlanEventsForElder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
