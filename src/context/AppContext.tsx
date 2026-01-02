import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { addElder as addElderService, getEldersByUser, deleteElder as deleteElderService } from '@/services/elderService';
import { addVital as addVitalService, getVitalsByElder, deleteVital as deleteVitalService } from '@/services/vitalService';
import { Elder, Medicine, Reminder, Vital, Appointment, Prescription, HealthSummary, CarePlanEvent, User, ReminderStatus } from '@/types';
import { addMedicine as addMedicineService, getMedicinesByElder, deleteMedicine as deleteMedicineService, updateMedicineStatus as updateMedicineStatusService } from '@/services/medicineService';


interface AppContextType {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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
  updateMedicine: (id: string, updates: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  updateReminderStatus: (reminderId: string, status: ReminderStatus) => void;
  snoozeReminder: (reminderId: string) => void;
  addVital: (vital: Omit<Vital, 'id'>) => Promise<void>;
  removeVital: (elderId: string, vitalId: string) => Promise<void>;
  addPrescription: (prescription: Omit<Prescription, 'id'>) => void;
  addElder: (elder: Omit<Elder, 'id'>) => Promise<void>;
  deleteElder: (id: string) => Promise<void>;

  // Helpers
  getElderById: (id: string) => Elder | undefined;
  getMedicinesForElder: (elderId: string) => Medicine[];
  getRemindersForElder: (elderId: string) => Reminder[];
  getTodaysReminders: () => Reminder[];
  getVitalsForElder: (elderId: string) => Vital[];
  getAppointmentsForElder: (elderId: string) => Appointment[];
  getSummaryForElder: (elderId: string) => HealthSummary | undefined;

  getCarePlanEventsForElder: (elderId: string) => CarePlanEvent[];
  addCarePlanEvent: (event: Omit<CarePlanEvent, 'id'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [elders, setElders] = useState<Elder[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [appointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [healthSummaries] = useState<HealthSummary[]>([]);
  const [carePlanEvents, setCarePlanEvents] = useState<CarePlanEvent[]>([]);

  // Sync AuthContext user to AppContext user (simplification)
  // In a real app we'd fetch the user profile from Firestore too.
  useEffect(() => {
    if (currentUser) {
      setUser({
        id: currentUser.uid,
        name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Caregiver',
        email: currentUser.email || '',
        avatar: '👨‍💼',
      });

      // Fetch elders
      setIsLoading(true);
      getEldersByUser(currentUser.uid)
        .then(async (fetchedElders) => {
          setElders(fetchedElders as Elder[]);

          // Fetch vitals for all elders
          try {
            const vitalsPromises = fetchedElders.map(elder => getVitalsByElder(elder.id));
            const vitalsArrays = await Promise.all(vitalsPromises);
            const allVitals = vitalsArrays.flat();
            setVitals(allVitals as Vital[]);
          } catch (error) {
            console.error("Failed to fetch vitals", error);
          }

          // Fetch medicines and generate today's reminders
          try {
            const medPromises = fetchedElders.map(elder => getMedicinesByElder(elder.id));
            const medArrays = await Promise.all(medPromises);
            const allMeds = medArrays.flat() as Medicine[];
            setMedicines(allMeds);

            // Generate reminders for today from fetched medicines
            const today = new Date().toISOString().split('T')[0];
            const newReminders: Reminder[] = [];
            allMeds.forEach(med => {
              if (med.times) {
                med.times.forEach((time, idx) => {
                  newReminders.push({
                    id: `rem-${med.id}-${idx}`,
                    medicineId: med.id,
                    elderId: med.elderId,
                    scheduledTime: `${today}T${time}:00`,
                    status: 'scheduled',
                    smsStatus: 'pending',
                    voiceStatus: 'pending'
                  });
                });
              }
            });
            setReminders(newReminders);

          } catch (error) {
            console.error("Failed to fetch medicines", error);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));

    } else {
      setUser(null);
      setElders([]);
      setVitals([]);
      setMedicines([]);
      setReminders([]);
      setIsLoading(false);
    }
  }, [currentUser]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // This local login is now largely redundant due to AuthProvider wrapping, 
    // but kept for compatibility with existing components calling login().
    // The AuthProvider+LoginPage handles the actual auth.
    // We'll just return true to satisfy the interface.
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const addCarePlanEvent = (event: Omit<CarePlanEvent, 'id'>) => {
    const newEvent: CarePlanEvent = {
      ...event,
      id: `event-${Date.now()}`
    };
    // Add to beginning of list so it shows up top in history
    setCarePlanEvents(prev => [newEvent, ...prev]);
  };

  const addMedicine = async (medicine: Omit<Medicine, 'id'>) => {
    if (!currentUser) return;
    try {
      const id = await addMedicineService(medicine);
      const newMedicine = { ...medicine, id } as Medicine;
      setMedicines(prev => [...prev, newMedicine]);

      // Auto-create reminders for today locally
      const today = new Date().toISOString().split('T')[0];
      if (medicine.times) {
        medicine.times.forEach((time, index) => {
          const newReminder: Reminder = {
            id: `rem-${id}-${index}`,
            medicineId: id,
            elderId: medicine.elderId,
            scheduledTime: `${today}T${time}:00`,
            status: 'scheduled',
            smsStatus: 'pending',
            voiceStatus: 'pending',
          };
          setReminders(prev => [...prev, newReminder]);
        });
      }
    } catch (error) {
      console.error("Failed to add medicine", error);
    }
  };

  const updateMedicine = (id: string, updates: Partial<Medicine>) => {
    if (!currentUser) return;
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));

    // If schedule-affecting properties changed, we should ideally regenerate reminders.
    // For this demo, if 'times' or 'frequency' is updated, we'll regenerate future reminders.
    if (updates.times || updates.frequency) {
      // 1. Remove future reminders for this medicine
      const todayStr = new Date().toISOString().split('T')[0];
      setReminders(prev => prev.filter(r => !(r.medicineId === id && r.scheduledTime > new Date().toISOString())));

      // 2. Re-create reminders for today if they don't exist (basic logic)
      // This is a simplified "regeneration" for the demo to show immediate effect
      if (updates.times) {
        updates.times.forEach((time, index) => {
          const newReminder: Reminder = {
            id: `rem-${Date.now()}-${index}`,
            medicineId: id,
            elderId: updates.elderId || medicines.find(m => m.id === id)?.elderId || '',
            scheduledTime: `${todayStr}T${time}:00`,
            status: 'scheduled',
            smsStatus: 'pending',
            voiceStatus: 'pending',
          };
          // Only add if not already passed or strictly for demo visual
          setReminders(prev => [...prev, newReminder]);
        });
      }
    }
  };

  const deleteMedicine = async (id: string) => {
    if (!currentUser) return;
    try {
      await deleteMedicineService(id);
      setMedicines(prev => prev.filter(m => m.id !== id));
      setReminders(prev => prev.filter(r => r.medicineId !== id));
    } catch (error) {
      console.error("Failed to delete medicine", error);
    }
  };

  const addElder = async (elder: Omit<Elder, 'id'>) => {
    if (!currentUser) return;
    try {
      const newElderData = {
        ...elder,
        userId: currentUser.uid,
        avatar: '👴', // Default
        conditions: elder.conditions || [],
        allergies: elder.allergies || [],
      };
      const id = await addElderService(newElderData);
      setElders(prev => [...prev, { ...newElderData, id } as Elder]);
    } catch (error) {
      console.error("Failed to add elder", error);
      throw error;
    }
  };

  const deleteElder = async (id: string) => {
    if (!currentUser) return;
    try {
      await deleteElderService(id);
      setElders(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error("Failed to delete elder", error);
      throw error;
    }
  };

  const updateReminderStatus = (reminderId: string, status: ReminderStatus) => {
    if (!currentUser) return;
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
    if (!currentUser) return;
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

  const addVital = async (vital: Omit<Vital, 'id'>) => {
    if (!currentUser) return;
    try {
      const id = await addVitalService({ ...vital });
      const newVital = { ...vital, id } as Vital;
      setVitals(prev => [...prev, newVital]);
    } catch (error) {
      console.error("Failed to add vital", error);
      throw error;
    }
  };

  const removeVital = async (elderId: string, vitalId: string) => {
    if (!currentUser) return;
    try {
      await deleteVitalService(vitalId);
      setVitals(prev => prev.filter(v => v.id !== vitalId));
    } catch (error) {
      console.error("Failed to delete vital", error);
      throw error;
    }
  };

  const addPrescription = (prescription: Omit<Prescription, 'id'>) => {
    const newPrescription: Prescription = {
      ...prescription,
      id: `presc-${Date.now()}`,
    };
    setPrescriptions(prev => [...prev, newPrescription]);

    addCarePlanEvent({
      elderId: prescription.elderId,
      date: new Date().toISOString(),
      type: 'prescription',
      title: 'Prescription Uploaded',
      description: `New prescription from ${prescription.doctorName}`
    });
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
        isAuthenticated: !!currentUser,
        isLoading,
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
        updateMedicine,
        deleteMedicine,
        updateReminderStatus,
        snoozeReminder,
        addVital,
        removeVital,
        addPrescription,
        addElder,
        deleteElder,
        getElderById,
        getMedicinesForElder,
        getRemindersForElder,
        getTodaysReminders,
        getVitalsForElder,
        getAppointmentsForElder,
        getSummaryForElder,
        addCarePlanEvent,
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
