
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Activity } from 'lucide-react';
import { Vital } from '@/types';

interface AddVitalDialogProps {
    elderId: string;
    trigger?: React.ReactNode;
    defaultType?: Vital['type'];
}

export function AddVitalDialog({ elderId, trigger, defaultType = 'BP' }: AddVitalDialogProps) {
    const { addVital } = useApp();
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<{
        type: Vital['type'];
        value: string;
        unit: string;
        notes: string;
    }>({
        type: defaultType,
        value: '',
        unit: 'mmHg',
        notes: ''
    });

    const units: Record<string, string> = {
        'BP': 'mmHg',
        'Sugar': 'mg/dL',
        'Heart Rate': 'bpm',
        'Temp': '°F',
        'Weight': 'kg',
        'SpO2': '%'
    };

    useEffect(() => {
        if (formData.type) {
            setFormData(prev => ({ ...prev, unit: units[formData.type] || '' }));
        }
    }, [formData.type]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.value) {
            setIsSubmitting(true);
            try {
                await addVital({
                    elderId,
                    type: formData.type,
                    value: formData.value,
                    unit: formData.unit,
                    recordedAt: new Date().toISOString(),
                    notes: formData.notes
                });
                setOpen(false);
                setFormData({ type: defaultType, value: '', unit: units[defaultType] || '', notes: '' });
            } catch (error) {
                console.error("Error adding vital:", error);
                // Optionally show toast error here
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm" variant="outline" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Vital
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Log Vital Signs</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            Type
                        </Label>
                        <div className="col-span-3">
                            <Select
                                value={formData.type}
                                onValueChange={(val: Vital['type']) => setFormData({ ...formData, type: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BP">Blood Pressure</SelectItem>
                                    <SelectItem value="Sugar">Blood Sugar</SelectItem>
                                    <SelectItem value="Heart Rate">Heart Rate</SelectItem>
                                    <SelectItem value="SpO2">SpO2 (Oxygen)</SelectItem>
                                    <SelectItem value="Temp">Temperature</SelectItem>
                                    <SelectItem value="Weight">Weight</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="value" className="text-right">
                            Value
                        </Label>
                        <Input
                            id="value"
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            className="col-span-3"
                            placeholder="e.g. 120/80"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="unit" className="text-right">
                            Unit
                        </Label>
                        <Input
                            id="unit"
                            value={formData.unit}
                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Record"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
