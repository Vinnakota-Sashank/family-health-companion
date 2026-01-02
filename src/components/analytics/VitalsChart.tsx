
import { Vital, VitalType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from 'recharts';
import { format } from 'date-fns';

interface VitalsChartProps {
    data: Vital[];
    type: VitalType;
    title: string;
    color?: string;
}

export function VitalsChart({ data, type, title, color = "#8884d8" }: VitalsChartProps) {
    // Filter for specific vital type and sort by date
    const chartData = data
        .filter((v) => v.type === type)
        .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
        .map((v) => ({
            date: new Date(v.recordedAt),
            value: parseFloat(v.value.toString()), // Ensure number for charts
            unit: v.unit
        }));

    if (chartData.length === 0) {
        return (
            <Card className="shadow-card h-full">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[200px]">
                    <p className="text-muted-foreground text-sm">No data available</p>
                </CardContent>
            </Card>
        );
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border border-border p-2 rounded shadow-md text-sm">
                    <p className="font-semibold mb-1">{format(new Date(label), 'MMM d, h:mm a')}</p>
                    <p style={{ color: color }}>
                        {title}: {payload[0].value} {payload[0].payload.unit}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="shadow-card hover:shadow-elevated transition-all">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id={`color-${type}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(date) => format(date, 'MMM d')}
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={color}
                                strokeWidth={2}
                                fillOpacity={1}
                                fill={`url(#color-${type})`}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
