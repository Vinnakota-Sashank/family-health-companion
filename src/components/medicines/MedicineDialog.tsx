
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Medicine, MealTiming } from '@/types';

interface MedicineDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    medicineToEdit?: Medicine | null;
    onSubmit?: (data: any) => void; // Optional if we want to bypass default add
}

export function MedicineDialog({ open, onOpenChange, medicineToEdit, onSubmit }: MedicineDialogProps) {
    const { elders, addMedicine, updateMedicine } = useApp();

    // Form state
    const [selectedElder, setSelectedElder] = useState<string>('');
    const [medicineName, setMedicineName] = useState('');
    const [dosage, setDosage] = useState('');
    const [frequency, setFrequency] = useState('Once daily');
    const [times, setTimes] = useState<string[]>(['08:00']);
    const [mealTiming, setMealTiming] = useState<MealTiming>('after');
    const [duration, setDuration] = useState('Ongoing');
    const [notes, setNotes] = useState('');

    // Initial load
    useEffect(() => {
        if (open) {
            if (medicineToEdit) {
                setSelectedElder(medicineToEdit.elderId);
                setMedicineName(medicineToEdit.name);
                setDosage(medicineToEdit.dosage);
                setFrequency(medicineToEdit.frequency);
                setTimes(medicineToEdit.times);
                setMealTiming(medicineToEdit.mealTiming);
                setDuration(medicineToEdit.duration);
                setNotes(medicineToEdit.notes || '');
            } else {
                // Reset defaults
                setSelectedElder(elders[0]?.id || '');
                setMedicineName('');
                setDosage('');
                setFrequency('Once daily');
                setTimes(['08:00']);
                setMealTiming('after');
                setDuration('Ongoing');
                setNotes('');
            }
        }
    }, [open, medicineToEdit, elders]);

    const handleSubmit = () => {
        if (!selectedElder || !medicineName || !dosage) return;

        if (medicineToEdit) {
            updateMedicine(medicineToEdit.id, {
                elderId: selectedElder,
                name: medicineName,
                dosage,
                frequency,
                times,
                mealTiming,
                duration,
                notes
            });
        } else {
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
        }
        onOpenChange(false);
    };

    const addTimeSlot = () => setTimes([...times, '12:00']);

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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{medicineToEdit ? 'Edit Medicine' : 'Add New Medicine'}</DialogTitle>
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

                    <Button onClick={handleSubmit} className="w-full">
                        {medicineToEdit ? 'Save Changes' : 'Add Medicine'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
