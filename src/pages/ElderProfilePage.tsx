import { useParams, Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge, TrendBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronLeft,
  Pill,
  Activity,
  Calendar,
  AlertTriangle,
  FileText,
  Clock,
  Phone,
  Plus
} from 'lucide-react';

export default function ElderProfilePage() {
  const { elderId } = useParams<{ elderId: string }>();
  const { 
    elders,
    getElderById, 
    getMedicinesForElder, 
    getRemindersForElder,
    getVitalsForElder,
    getAppointmentsForElder,
    getSummaryForElder,
    getCarePlanEventsForElder,
    updateReminderStatus
  } = useApp();

  const elder = elderId ? getElderById(elderId) : elders[0];
  
  if (!elder) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Elder not found</p>
          <Link to="/dashboard">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const medicines = getMedicinesForElder(elder.id);
  const reminders = getRemindersForElder(elder.id);
  const vitals = getVitalsForElder(elder.id);
  const appointments = getAppointmentsForElder(elder.id);
  const summary = getSummaryForElder(elder.id);
  const carePlanEvents = getCarePlanEventsForElder(elder.id);

  const todaysReminders = reminders.filter(r => {
    const today = new Date().toISOString().split('T')[0];
    return r.scheduledTime.startsWith(today);
  });

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4 flex-1">
            <div className="text-5xl">{elder.avatar}</div>
            <div>
              <h1 className="text-2xl font-bold">{elder.name}</h1>
              <p className="text-muted-foreground">{elder.relation} • {elder.age} years old</p>
            </div>
          </div>
          {summary && <TrendBadge trend={summary.trend} />}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <Pill className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{medicines.length}</p>
              <p className="text-sm text-muted-foreground">Active Medicines</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 mx-auto text-warning mb-2" />
              <p className="text-2xl font-bold">{todaysReminders.filter(r => r.status === 'scheduled' || r.status === 'sent').length}</p>
              <p className="text-sm text-muted-foreground">Due Today</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <Activity className="h-6 w-6 mx-auto text-success mb-2" />
              <p className="text-2xl font-bold">{summary?.adherenceRate || 0}%</p>
              <p className="text-sm text-muted-foreground">Adherence</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 mx-auto text-destructive mb-2" />
              <p className="text-2xl font-bold">{appointments.filter(a => a.status === 'scheduled').length}</p>
              <p className="text-sm text-muted-foreground">Appointments</p>
            </CardContent>
          </Card>
        </div>

        {/* Elder Selector */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Select Family Member</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {elders.map((e) => (
                <Link key={e.id} to={`/elder/${e.id}`}>
                  <Button
                    variant={e.id === elder.id ? 'default' : 'outline'}
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <span>{e.avatar}</span>
                    {e.name}
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="overview" className="py-3">Overview</TabsTrigger>
            <TabsTrigger value="medicines" className="py-3">Medicines</TabsTrigger>
            <TabsTrigger value="vitals" className="py-3">Vitals</TabsTrigger>
            <TabsTrigger value="timeline" className="py-3">Timeline</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Conditions & Allergies */}
            <div className="grid lg:grid-cols-2 gap-4">
              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Medical Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {elder.conditions.map((condition, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {condition}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    Allergies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {elder.allergies.map((allergy, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-destructive/10 text-destructive rounded-full text-sm font-medium">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Summary */}
            {summary && (
              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Weekly Health Summary</CardTitle>
                  <p className="text-sm text-muted-foreground">AI-generated insights</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground">{summary.vitalsOverview}</p>
                  
                  {summary.concerns.length > 0 && (
                    <div>
                      <p className="font-medium text-sm text-destructive mb-2">Concerns:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {summary.concerns.map((concern, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">{concern}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <p className="font-medium text-sm text-success mb-2">Recommendations:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {summary.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">{rec}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Emergency Contact */}
            <Card className="shadow-card border-warning/30 bg-warning/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">Primary Caregiver</p>
                  <p className="text-sm text-muted-foreground">{elder.primaryCaregiver}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-sm">{elder.caregiverPhone}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medicines Tab */}
          <TabsContent value="medicines" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">{medicines.length} active medicines</p>
              <Link to="/medicines">
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Medicine
                </Button>
              </Link>
            </div>

            {medicines.map((medicine) => {
              const medicineReminders = todaysReminders.filter(r => r.medicineId === medicine.id);
              return (
                <Card key={medicine.id} className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{medicine.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {medicine.dosage} • {medicine.frequency}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {medicine.mealTiming === 'before' ? 'Before' : medicine.mealTiming === 'after' ? 'After' : 'With'} food
                        </p>
                        {medicine.notes && (
                          <p className="text-sm text-primary mt-2">{medicine.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        {medicine.times.map((time, idx) => (
                          <span key={idx} className="inline-block px-2 py-1 bg-secondary rounded text-sm font-mono ml-1">
                            {time}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {medicineReminders.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm font-medium mb-2">Today's Schedule:</p>
                        <div className="flex flex-wrap gap-2">
                          {medicineReminders.map((rem) => (
                            <div key={rem.id} className="flex items-center gap-2">
                              <StatusBadge status={rem.status} />
                              {(rem.status === 'scheduled' || rem.status === 'sent') && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateReminderStatus(rem.id, 'taken')}
                                >
                                  Mark Taken
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Vitals Tab */}
          <TabsContent value="vitals" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">{vitals.length} readings recorded</p>
              <Button size="sm" variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Log Vital
              </Button>
            </div>

            {vitals.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="p-8 text-center">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No vitals recorded yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {vitals.map((vital) => (
                  <Card key={vital.id} className="shadow-card">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize">{vital.type.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(vital.recordedAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </p>
                        {vital.notes && (
                          <p className="text-sm text-primary mt-1">{vital.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{vital.value}</p>
                        <p className="text-sm text-muted-foreground">{vital.unit}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            <p className="text-muted-foreground">Care plan history</p>
            
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              
              {carePlanEvents.map((event, idx) => (
                <div key={event.id} className="relative pl-10 pb-6">
                  <div className="absolute left-2 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                  <Card className="shadow-card">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(event.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
