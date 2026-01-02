import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  History,
  AlertTriangle,
  Bell,
  FileText,
  Pill,
  Activity,
  Calendar,
  Phone,
  Copy,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function HistoryPage() {
  const { elders, medicines, vitals, prescriptions, carePlanEvents, reminders } = useApp();
  const { toast } = useToast();

  // Compile notification log from reminders
  const notificationLog = reminders
    .filter(r => r.smsStatus === 'sent' || r.voiceStatus === 'sent')
    .map(r => {
      const medicine = medicines.find(m => m.id === r.medicineId);
      const elder = elders.find(e => e.id === r.elderId);
      return {
        id: r.id,
        elderId: r.elderId,
        elderName: elder?.name || 'Unknown',
        elderAvatar: elder?.avatar || '👤',
        medicineName: medicine?.name || 'Unknown',
        time: r.scheduledTime,
        smsStatus: r.smsStatus,
        voiceStatus: r.voiceStatus,
        status: r.status,
      };
    })
    .sort((a, b) => b.time.localeCompare(a.time));

  const handleCopyEmergencyCard = (elderId: string) => {
    const elder = elders.find(e => e.id === elderId);
    const elderMedicines = medicines.filter(m => m.elderId === elderId);
    const elderVitals = vitals.filter(v => v.elderId === elderId).slice(0, 3);

    const emergencyInfo = `
EMERGENCY HEALTH CARD
=====================
Name: ${elder?.name}
Age: ${elder?.age} years
Relation: ${elder?.relation}

CURRENT MEDICATIONS:
${elderMedicines.map(m => `- ${m.name} ${m.dosage}`).join('\n')}

ALLERGIES:
${elder?.allergies.join(', ') || 'None known'}

CONDITIONS:
${elder?.conditions.join(', ') || 'None known'}

RECENT VITALS:
${elderVitals.map(v => `- ${v.type.replace('_', ' ')}: ${v.value} ${v.unit}`).join('\n')}

PRIMARY CAREGIVER: ${elder?.primaryCaregiver}
CONTACT: ${elder?.caregiverPhone}
    `.trim();

    navigator.clipboard.writeText(emergencyInfo);
    toast({
      title: 'Copied to clipboard',
      description: 'Emergency card information has been copied.',
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-7 w-7 text-primary" />
            History & Emergency
          </h1>
          <p className="text-muted-foreground">Health records, alerts, and critical information</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="history" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history" className="gap-2">
              <FileText className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="emergency" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Emergency
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            {elders.map((elder) => {
              const elderEvents = carePlanEvents.filter(e => e.elderId === elder.id);
              const elderPrescriptions = prescriptions.filter(p => p.elderId === elder.id);
              const elderVitals = vitals.filter(v => v.elderId === elder.id);

              return (
                <Card key={elder.id} className="shadow-card">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{elder.avatar}</span>
                      <div>
                        <CardTitle className="text-lg">{elder.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{elder.relation}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Timeline */}
                    <div className="relative">
                      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />

                      {/* Prescriptions */}
                      {elderPrescriptions.map((presc) => (
                        <div key={presc.id} className="relative pl-8 pb-4">
                          <div className="absolute left-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <FileText className="h-2 w-2 text-primary-foreground" />
                          </div>
                          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-sm">Prescription from {presc.doctorName}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {presc.medicines.length} medicines • {presc.aiParsed ? 'AI-parsed' : 'Manual entry'}
                                </p>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(presc.date).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Care Plan Events */}
                      {elderEvents.map((event) => (
                        <div key={event.id} className="relative pl-8 pb-4">
                          <div className={`absolute left-1 w-4 h-4 rounded-full flex items-center justify-center ${event.type === 'condition' ? 'bg-warning' :
                              event.type === 'appointment' ? 'bg-success' :
                                'bg-secondary'
                            }`}>
                            {event.type === 'appointment' && <Calendar className="h-2 w-2 text-success-foreground" />}
                            {event.type === 'condition' && <Activity className="h-2 w-2 text-warning-foreground" />}
                            {event.type === 'vitals' && <Activity className="h-2 w-2" />}
                          </div>
                          <div className="p-3 rounded-lg bg-secondary/30">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-sm">{event.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(event.date).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Emergency Tab */}
          <TabsContent value="emergency" className="space-y-4">
            {elders.map((elder) => {
              const elderMedicines = medicines.filter(m => m.elderId === elder.id);
              const elderVitals = vitals.filter(v => v.elderId === elder.id).slice(0, 4);

              return (
                <Card key={elder.id} className="shadow-card border-destructive/20">
                  <CardHeader className="pb-2 bg-destructive/5 rounded-t-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-full bg-destructive/10">
                          <AlertTriangle className="h-6 w-6 text-destructive" />
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {elder.avatar} {elder.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">Emergency Health Card</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleCopyEmergencyCard(elder.id)}
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        className="gap-2 bg-destructive hover:bg-destructive/90"
                        onClick={() => {
                          toast({
                            title: `Calling ${elder.primaryCaregiver}...`,
                            description: "Simulating emergency call...",
                            duration: 3000
                          });
                        }}
                      >
                        <Phone className="h-4 w-4" />
                        Call Caregiver
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    {/* Current Medications */}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                        <Pill className="h-4 w-4" />
                        Current Medications
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {elderMedicines.map((med) => (
                          <span key={med.id} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                            {med.name} {med.dosage}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Allergies */}
                    <div>
                      <p className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Allergies
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {elder.allergies.length > 0 ? (
                          elder.allergies.map((allergy, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-destructive/10 text-destructive rounded-full text-sm font-medium">
                              {allergy}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">None known</span>
                        )}
                      </div>
                    </div>

                    {/* Medical Conditions */}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Medical Conditions
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {elder.conditions.map((condition, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-warning/10 text-warning rounded-full text-sm font-medium">
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Recent Vitals */}
                    {elderVitals.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Last Critical Readings</p>
                        <div className="grid grid-cols-2 gap-2">
                          {elderVitals.map((vital) => (
                            <div key={vital.id} className="p-3 rounded-lg bg-secondary/30">
                              <p className="text-xs text-muted-foreground capitalize">{vital.type.replace('_', ' ')}</p>
                              <p className="font-semibold">{vital.value} <span className="text-xs font-normal">{vital.unit}</span></p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Primary Caregiver */}
                    <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                      <p className="text-sm font-medium text-success mb-2 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Primary Caregiver Contact
                      </p>
                      <p className="font-semibold">{elder.primaryCaregiver}</p>
                      <p className="font-mono text-sm">{elder.caregiverPhone}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Notification & Escalation Log</CardTitle>
                <p className="text-sm text-muted-foreground">System-generated reminders (simulated)</p>
              </CardHeader>
              <CardContent>
                {notificationLog.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No notifications sent yet</p>
                ) : (
                  <div className="space-y-3">
                    {notificationLog.map((log) => (
                      <div key={log.id} className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <span className="text-xl">{log.elderAvatar}</span>
                            <div>
                              <p className="font-medium text-sm">{log.medicineName}</p>
                              <p className="text-xs text-muted-foreground">{log.elderName}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.time).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            <div className="flex gap-2 mt-1">
                              {log.smsStatus === 'sent' && (
                                <span className="text-xs px-2 py-0.5 rounded bg-success/10 text-success">SMS ✓</span>
                              )}
                              {log.voiceStatus === 'sent' && (
                                <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">Voice ✓</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Status: <span className={
                            log.status === 'taken' ? 'text-success' :
                              log.status === 'missed' ? 'text-destructive' :
                                'text-warning'
                          }>{log.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
