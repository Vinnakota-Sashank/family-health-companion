
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

export function AddElderDialog() {
    const { addElder } = useApp();
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        relation: '',
        condition: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.age && formData.relation) {
            addElder({
                name: formData.name,
                age: parseInt(formData.age),
                relation: formData.relation,
                avatar: '👴', // Default
                conditions: formData.condition ? [formData.condition] : [],
                allergies: [], // Default empty
                primaryCaregiver: 'User', // Default
                caregiverPhone: '555-0123', // Default
                vitals: []
            });
            setOpen(false);
            setFormData({ name: '', age: '', relation: '', condition: '' });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Elder
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Elder Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="age" className="text-right">
                            Age
                        </Label>
                        <Input
                            id="age"
                            type="number"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="relation" className="text-right">
                            Relation
                        </Label>
                        <Input
                            id="relation"
                            placeholder="e.g. Father, Mom"
                            value={formData.relation}
                            onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="condition" className="text-right">
                            Condition
                        </Label>
                        <Input
                            id="condition"
                            placeholder="Optional (Primary)"
                            value={formData.condition}
                            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save Profile</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
