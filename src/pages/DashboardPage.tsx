import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { ElderCard } from '@/components/shared/ElderCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link } from 'react-router-dom';
import {
  Plus,
  Calendar,
  FileText,
  Activity,
  Clock,
  ChevronRight,
  Pill,
  Heart,
  CalendarCheck,
  Loader2,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const {
    user,
    elders,
    getTodaysReminders,
    medicines,
    appointments,
    vitals,
    updateReminderStatus,
    addElder,
    isLoading
  } = useApp();
  const { toast } = useToast();

  const [isAddElderOpen, setIsAddElderOpen] = useState(false);
  const [isAddingElder, setIsAddingElder] = useState(false);
  const [newElderName, setNewElderName] = useState('');
  const [newElderAge, setNewElderAge] = useState('');
  const [newElderRelation, setNewElderRelation] = useState('');

  const todaysReminders = getTodaysReminders();
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

  const stats = {
    totalMedicines: medicines.length,
    dueToday: todaysReminders.filter(r => r.status === 'scheduled' || r.status === 'sent').length,
    taken: todaysReminders.filter(r => r.status === 'taken').length,
    missed: todaysReminders.filter(r => r.status === 'missed').length,
    upcomingAppointments: appointments.filter(a => a.status === 'scheduled').length,
    vitalsRecorded: vitals.length,
  };

  const handleAddElder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newElderName || !newElderAge || !newElderRelation) return;

    setIsAddingElder(true);
    try {
      await addElder({
        name: newElderName,
        age: parseInt(newElderAge),
        relation: newElderRelation,
        vitals: [],
        avatar: '👴',
        conditions: [],
        allergies: [],
        primaryCaregiver: user?.name || 'Caregiver',
        caregiverPhone: '',
      });
      toast({
        title: "Family Member Added",
        description: `${newElderName} has been added to your profile.`,
      });
      setIsAddElderOpen(false);
      setNewElderName('');
      setNewElderAge('');
      setNewElderRelation('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add family member. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAddingElder(false);
    }
  };

  const quickActions = [
    { icon: Plus, label: 'Add Medicine', path: '/medicines', color: 'bg-primary text-primary-foreground' },
    { icon: Calendar, label: 'View Schedule', path: '/medicines', color: 'bg-secondary text-secondary-foreground' },
    { icon: FileText, label: 'Upload Prescription', path: '/ai-insights', color: 'bg-secondary text-secondary-foreground' },
    { icon: Activity, label: 'Weekly Summary', path: '/ai-insights', color: 'bg-secondary text-secondary-foreground' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Loading family health data...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Greeting */}
        <div className="animate-fade-in">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            {greeting}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your family's health today
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Due Today', value: stats.dueToday, icon: Clock, color: 'text-primary' },
            { label: 'Taken', value: stats.taken, icon: Pill, color: 'text-success' },
            { label: 'Missed', value: stats.missed, icon: Heart, color: 'text-destructive' },
            { label: 'Appointments', value: stats.upcomingAppointments, icon: CalendarCheck, color: 'text-warning' },
          ].map((stat, idx) => (
            <Card key={idx} className="shadow-card animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-secondary`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {quickActions.map((action, idx) => (
                <Link key={idx} to={action.path}>
                  <Button
                    variant="outline"
                    className={`w-full h-auto py-4 flex flex-col items-center gap-2 hover:shadow-card transition-all ${idx === 0 ? 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary' : ''
                      }`}
                  >
                    <action.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Family Members */}
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Family Members</CardTitle>

              <Dialog open={isAddElderOpen} onOpenChange={setIsAddElderOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1 h-8">
                    <Plus className="h-4 w-4" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Family Member</DialogTitle>
                    <DialogDescription>
                      Add details of the elder you are caring for.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddElder} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g. Ramesh Gupta"
                        value={newElderName}
                        onChange={(e) => setNewElderName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          placeholder="e.g. 72"
                          value={newElderAge}
                          onChange={(e) => setNewElderAge(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="relation">Relation</Label>
                        <Input
                          id="relation"
                          placeholder="e.g. Father"
                          value={newElderRelation}
                          onChange={(e) => setNewElderRelation(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isAddingElder}>
                        {isAddingElder ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          "Add Member"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-3">
              {elders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="bg-secondary/30 p-4 rounded-full mb-3">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">No family members added yet</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Add your parents or grandparents to start tracking their health.
                  </p>
                </div>
              ) : (
                elders.map((elder) => (
                  <ElderCard key={elder.id} elder={elder} compact />
                ))
              )}
            </CardContent>
          </Card>

          {/* Today's Tasks */}
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Today's Medicine Schedule</CardTitle>
              <Link to="/medicines">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {todaysReminders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="bg-success/10 p-3 rounded-full mb-3">
                    <CalendarCheck className="h-6 w-6 text-success" />
                  </div>
                  <p className="text-muted-foreground font-medium">All caught up!</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    No medicines scheduled for today.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaysReminders.slice(0, 5).map((reminder) => {
                    const medicine = medicines.find(m => m.id === reminder.medicineId);
                    const elder = elders.find(e => e.id === reminder.elderId);
                    const time = new Date(reminder.scheduledTime).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={reminder.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{elder?.avatar}</div>
                          <div>
                            <p className="font-medium text-sm">{medicine?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {elder?.name} • {time}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={reminder.status} />
                          {(reminder.status === 'scheduled' || reminder.status === 'sent' || reminder.status === 'snoozed') && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7"
                              onClick={() => updateReminderStatus(reminder.id, 'taken')}
                            >
                              Mark Taken
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        {appointments.filter(a => a.status === 'scheduled').length > 0 && (
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-4">
                {appointments
                  .filter(a => a.status === 'scheduled')
                  .map((apt) => {
                    const elder = elders.find(e => e.id === apt.elderId);
                    return (
                      <div
                        key={apt.id}
                        className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-card transition-all"
                      >
                        <div className="p-3 rounded-lg bg-warning/10">
                          <Calendar className="h-5 w-5 text-warning" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{apt.doctorName}</p>
                          <p className="text-sm text-muted-foreground">{apt.specialty}</p>
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <span className="text-xl">{elder?.avatar}</span>
                            <span>{elder?.name}</span>
                          </div>
                          <p className="mt-1 text-sm text-primary font-medium">
                            {new Date(apt.date).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })}{' '}
                            at {apt.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
