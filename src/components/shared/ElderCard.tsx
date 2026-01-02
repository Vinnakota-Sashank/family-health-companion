import { Link } from 'react-router-dom';
import { Elder } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, AlertTriangle, Activity, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { AddVitalDialog } from '@/components/elder/AddVitalDialog';
import { Button } from '@/components/ui/button';

interface ElderCardProps {
  elder: Elder;
  compact?: boolean;
}

export function ElderCard({ elder, compact = false }: ElderCardProps) {
  const { getRemindersForElder, getMedicinesForElder, deleteElder } = useApp();
  const reminders = getRemindersForElder(elder.id);
  const medicines = getMedicinesForElder(elder.id);

  const todaysReminders = reminders.filter(r => {
    const today = new Date().toISOString().split('T')[0];
    return r.scheduledTime.startsWith(today);
  });

  const missedCount = todaysReminders.filter(r => r.status === 'missed').length;
  const takenCount = todaysReminders.filter(r => r.status === 'taken').length;
  const pendingCount = todaysReminders.filter(r => r.status === 'scheduled' || r.status === 'sent').length;

  if (compact) {
    return (
      <Link to={`/elder/${elder.id}`}>
        <Card className="hover:shadow-elevated transition-all duration-300 cursor-pointer border-border hover:border-primary/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="text-4xl">{elder.avatar}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{elder.name}</h3>
              <p className="text-sm text-muted-foreground">{elder.relation}</p>
            </div>
            <div className="flex items-center gap-2">
              {missedCount > 0 && (
                <span className="flex items-center gap-1 text-destructive text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {missedCount}
                </span>
              )}
              <div onClick={(e) => e.preventDefault()}>
                <AddVitalDialog
                  elderId={elder.id}
                  trigger={
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Activity className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.preventDefault();
                  if (confirm("Are you sure you want to remove this family member?")) {
                    deleteElder(elder.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={`/elder/${elder.id}`}>
      <Card className="hover:shadow-elevated transition-all duration-300 cursor-pointer border-border hover:border-primary/30 animate-fade-in">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-5xl">{elder.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-foreground">{elder.name}</h3>
                  <p className="text-muted-foreground">{elder.relation} • {elder.age} years</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground mt-1" />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {elder.conditions?.map((condition, idx) => (
                  <span key={idx} className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                    {condition}
                  </span>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="p-2 rounded-lg bg-success/5">
                  <p className="text-lg font-bold text-success">{takenCount}</p>
                  <p className="text-xs text-muted-foreground">Taken</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/5">
                  <p className="text-lg font-bold text-primary">{pendingCount}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div className="p-2 rounded-lg bg-destructive/5">
                  <p className="text-lg font-bold text-destructive">{missedCount}</p>
                  <p className="text-xs text-muted-foreground">Missed</p>
                </div>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                {medicines.length} active medicine{medicines.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
