import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Clock, 
  MessageSquare, 
  Phone,
  Calendar,
  Pill,
  ChevronRight
} from 'lucide-react';
import { MealTiming } from '@/types';

export default function MedicinesPage() {
  const { 
    elders, 
    medicines, 
    getTodaysReminders, 
    addMedicine, 
    updateReminderStatus,
    snoozeReminder
  } = useApp();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedElder, setSelectedElder] = useState<string>(elders[0]?.id || '');
  const [filterElder, setFilterElder] = useState<string>('all');

  // Form state
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [mealTiming, setMealTiming] = useState<MealTiming>('after');
  const [duration, setDuration] = useState('Ongoing');
  const [notes, setNotes] = useState('');

  const todaysReminders = getTodaysReminders();
  
  const filteredMedicines = filterElder === 'all' 
    ? medicines 
    : medicines.filter(m => m.elderId === filterElder);

  const handleAddMedicine = () => {
    if (!medicineName || !dosage || !selectedElder) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    addMedicine({
      elderId: selectedElder,
      name: medicineName,
      dosage,
      frequency,
      times,
      mealTiming,
      duration,
      notes,
      startDate: new Date().toISOString().split('T')[0],
    });

    toast({
      title: 'Medicine added',
      description: `${medicineName} has been added to the schedule.`,
    });

    // Reset form
    setMedicineName('');
    setDosage('');
    setFrequency('Once daily');
    setTimes(['08:00']);
    setMealTiming('after');
    setDuration('Ongoing');
    setNotes('');
    setIsDialogOpen(false);
  };

  const addTimeSlot = () => {
    setTimes([...times, '12:00']);
  };

  const updateTimeSlot = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };

  const removeTimeSlot = (index: number) => {
    if (times.length > 1) {
      setTimes(times.filter((_, i) => i !== index));
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Medicines & Schedule</h1>
            <p className="text-muted-foreground">Manage medications and track adherence</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Medicine
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Medicine</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>For Elder *</Label>
                  <Select value={selectedElder} onValueChange={setSelectedElder}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select elder" />
                    </SelectTrigger>
                    <SelectContent>
                      {elders.map((elder) => (
                        <SelectItem key={elder.id} value={elder.id}>
                          {elder.avatar} {elder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Medicine Name *</Label>
                  <Input
                    placeholder="e.g., Metformin"
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Dosage *</Label>
                  <Input
                    placeholder="e.g., 500mg"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Once daily">Once daily</SelectItem>
                      <SelectItem value="Twice daily">Twice daily</SelectItem>
                      <SelectItem value="Three times daily">Three times daily</SelectItem>
                      <SelectItem value="As needed">As needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Time(s)</Label>
                  {times.map((time, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => updateTimeSlot(index, e.target.value)}
                        className="flex-1"
                      />
                      {times.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeTimeSlot(index)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTimeSlot}
                    className="w-full"
                  >
                    + Add Another Time
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Meal Timing</Label>
                  <Select value={mealTiming} onValueChange={(v) => setMealTiming(v as MealTiming)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="before">Before food</SelectItem>
                      <SelectItem value="after">After food</SelectItem>
                      <SelectItem value="with">With food</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ongoing">Ongoing</SelectItem>
                      <SelectItem value="1 week">1 week</SelectItem>
                      <SelectItem value="2 weeks">2 weeks</SelectItem>
                      <SelectItem value="1 month">1 month</SelectItem>
                      <SelectItem value="3 months">3 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Textarea
                    placeholder="Special instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button onClick={handleAddMedicine} className="w-full">
                  Add Medicine
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="schedule" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schedule" className="gap-2">
              <Clock className="h-4 w-4" />
              Today's Schedule
            </TabsTrigger>
            <TabsTrigger value="medicines" className="gap-2">
              <Pill className="h-4 w-4" />
              All Medicines
            </TabsTrigger>
          </TabsList>

          {/* Today's Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4">
            {/* Timeline view */}
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  {new Date().toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todaysReminders.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No medicines scheduled for today
                  </p>
                ) : (
                  <div className="space-y-4">
                    {todaysReminders
                      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
                      .map((reminder) => {
                        const medicine = medicines.find(m => m.id === reminder.medicineId);
                        const elder = elders.find(e => e.id === reminder.elderId);
                        const time = new Date(reminder.scheduledTime).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        return (
                          <div
                            key={reminder.id}
                            className={`p-4 rounded-xl border transition-all ${
                              reminder.status === 'taken' 
                                ? 'bg-success/5 border-success/30' 
                                : reminder.status === 'missed'
                                ? 'bg-destructive/5 border-destructive/30'
                                : 'bg-card border-border hover:shadow-card'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className="text-center min-w-[60px]">
                                <p className="text-lg font-bold">{time}</p>
                                <p className="text-xs text-muted-foreground">
                                  {medicine?.mealTiming === 'before' ? 'Before' : medicine?.mealTiming === 'after' ? 'After' : 'With'} food
                                </p>
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{elder?.avatar}</span>
                                  <span className="text-sm text-muted-foreground">{elder?.name}</span>
                                </div>
                                <h3 className="font-semibold mt-1">{medicine?.name}</h3>
                                <p className="text-sm text-muted-foreground">{medicine?.dosage}</p>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                <StatusBadge status={reminder.status} />
                                
                                {/* Reminder indicators */}
                                <div className="flex gap-2 text-xs">
                                  <span className={`flex items-center gap-1 ${reminder.smsStatus === 'sent' ? 'text-success' : 'text-muted-foreground'}`}>
                                    <MessageSquare className="h-3 w-3" />
                                    SMS
                                  </span>
                                  <span className={`flex items-center gap-1 ${reminder.voiceStatus === 'sent' ? 'text-success' : 'text-muted-foreground'}`}>
                                    <Phone className="h-3 w-3" />
                                    Voice
                                  </span>
                                </div>

                                {/* Actions */}
                                {(reminder.status === 'scheduled' || reminder.status === 'sent' || reminder.status === 'snoozed') && (
                                  <div className="flex gap-2 mt-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => snoozeReminder(reminder.id)}
                                    >
                                      Snooze 30m
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => updateReminderStatus(reminder.id, 'taken')}
                                    >
                                      Mark Taken
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Legend */}
            <Card className="shadow-card">
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-3">Status Legend</p>
                <div className="flex flex-wrap gap-4">
                  <StatusBadge status="scheduled" />
                  <StatusBadge status="sent" />
                  <StatusBadge status="taken" />
                  <StatusBadge status="missed" />
                  <StatusBadge status="snoozed" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Medicines Tab */}
          <TabsContent value="medicines" className="space-y-4">
            {/* Filter */}
            <Card className="shadow-card">
              <CardContent className="p-4">
                <Label className="text-sm text-muted-foreground">Filter by Elder</Label>
                <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                  <Button
                    variant={filterElder === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterElder('all')}
                  >
                    All
                  </Button>
                  {elders.map((elder) => (
                    <Button
                      key={elder.id}
                      variant={filterElder === elder.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterElder(elder.id)}
                      className="whitespace-nowrap"
                    >
                      {elder.avatar} {elder.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Medicine List */}
            <div className="space-y-4">
              {filteredMedicines.length === 0 ? (
                <Card className="shadow-card">
                  <CardContent className="p-8 text-center">
                    <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No medicines found</p>
                    <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                      Add First Medicine
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredMedicines.map((medicine) => {
                  const elder = elders.find(e => e.id === medicine.elderId);
                  return (
                    <Card key={medicine.id} className="shadow-card hover:shadow-elevated transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-primary/10">
                              <Pill className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{medicine.name}</h3>
                              <p className="text-muted-foreground">{medicine.dosage} • {medicine.frequency}</p>
                              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                <span className="text-xl">{elder?.avatar}</span>
                                <span>{elder?.name}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex flex-wrap gap-1 justify-end">
                              {medicine.times.map((time, idx) => (
                                <span key={idx} className="px-2 py-1 bg-secondary rounded text-xs font-mono">
                                  {time}
                                </span>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {medicine.mealTiming === 'before' ? 'Before' : medicine.mealTiming === 'after' ? 'After' : 'With'} food
                            </p>
                            <p className="text-xs text-primary mt-1">{medicine.duration}</p>
                          </div>
                        </div>
                        {medicine.notes && (
                          <p className="mt-3 text-sm text-muted-foreground bg-secondary/30 p-2 rounded">
                            📝 {medicine.notes}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
