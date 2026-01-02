
import { Elder } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Pill, X } from 'lucide-react';
import { AddVitalDialog } from './AddVitalDialog';
import { useApp } from '@/context/AppContext';

interface ElderCardProps {
    elder: Elder;
    onClick: () => void;
    activeMedicinesCount: number;
}

export function ElderCard({ elder, onClick, activeMedicinesCount }: ElderCardProps) {
    const { removeVital } = useApp();
    return (
        <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/20"
            onClick={onClick}
        >
            <CardContent className="p-6 text-center space-y-4">
                <div className="text-6xl mx-auto filter drop-shadow-md">{elder.avatar}</div>
                <div>
                    <h3 className="text-xl font-bold">{elder.name}</h3>
                    <p className="text-muted-foreground font-medium">{elder.relation}</p>
                    <p className="text-sm text-muted-foreground mt-1">{elder.age} years old</p>
                </div>

                {elder.conditions.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2">
                        {elder.conditions.slice(0, 2).map((c, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                {c}
                            </span>
                        ))}
                        {elder.conditions.length > 2 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                +{elder.conditions.length - 2}
                            </span>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="bg-secondary/20 p-4 grid grid-cols-2 gap-4">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-0.5">
                        <Pill className="h-4 w-4" />
                        <span className="text-xs font-medium">Meds</span>
                    </div>
                    <p className="font-bold text-lg">{activeMedicinesCount}</p>
                </div>
                <div className="text-center border-l border-border/50">
                    <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-0.5">
                        <Activity className="h-4 w-4" />
                        <span className="text-xs font-medium">Status</span>
                    </div>
                    <p className="font-bold text-lg text-success">Good</p>
                </div>
            </CardFooter>

            {/* Vitals Section */}
            <div className="px-6 pb-6 pt-0 space-y-3" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Recent Vitals</h4>
                    <AddVitalDialog elderId={elder.id} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {elder.vitals && elder.vitals.slice(-2).reverse().map((vital) => (
                        <div key={vital.id} className="text-xs p-2 bg-secondary/30 rounded flex justify-between items-center group">
                            <span>{vital.type.replace('_', ' ')}: <span className="font-semibold">{vital.value} {vital.unit}</span></span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                                onClick={() => removeVital(elder.id, vital.id)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                    {(!elder.vitals || elder.vitals.length === 0) && (
                        <p className="text-xs text-muted-foreground col-span-2">No vitals recorded yet.</p>
                    )}
                </div>
            </div>
        </Card>
    );
}
