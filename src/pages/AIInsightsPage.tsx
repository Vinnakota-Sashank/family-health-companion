import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { TrendBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  Brain, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Stethoscope,
  ClipboardList,
  MessageSquare
} from 'lucide-react';
import { Medicine } from '@/types';

export default function AIInsightsPage() {
  const { elders, healthSummaries, addMedicine, addPrescription } = useApp();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedMedicines, setParsedMedicines] = useState<Partial<Medicine>[]>([]);
  const [selectedElderId, setSelectedElderId] = useState<string>(elders[0]?.id || '');

  const handlePrescriptionUpload = async () => {
    setIsProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockParsedMedicines: Partial<Medicine>[] = [
      { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', mealTiming: 'after' },
      { name: 'Aspirin', dosage: '75mg', frequency: 'Once daily', mealTiming: 'after' },
      { name: 'Pantoprazole', dosage: '40mg', frequency: 'Once daily', mealTiming: 'before' },
    ];
    
    setParsedMedicines(mockParsedMedicines);
    setIsProcessing(false);
    
    toast({
      title: 'Prescription Analyzed',
      description: 'AI has extracted 3 medicines from the prescription.',
    });
  };

  const handleAddParsedMedicines = () => {
    parsedMedicines.forEach((med) => {
      addMedicine({
        elderId: selectedElderId,
        name: med.name || '',
        dosage: med.dosage || '',
        frequency: med.frequency || 'Once daily',
        times: ['09:00'],
        mealTiming: med.mealTiming || 'after',
        duration: 'Ongoing',
        notes: 'Added via AI prescription parsing',
        startDate: new Date().toISOString().split('T')[0],
      });
    });

    addPrescription({
      elderId: selectedElderId,
      doctorName: 'Dr. AI Parsed',
      date: new Date().toISOString().split('T')[0],
      aiParsed: true,
      medicines: parsedMedicines,
      notes: 'Prescription uploaded and parsed by AI',
    });

    toast({
      title: 'Medicines Added',
      description: `${parsedMedicines.length} medicines have been added to the schedule.`,
    });

    setParsedMedicines([]);
  };

  const doctorVisitChecklist = [
    'List of current medications with dosages',
    'Recent vital readings (BP, blood sugar)',
    'Any new symptoms or concerns',
    'Previous doctor\'s recommendations',
    'Questions about medication side effects',
    'Diet and lifestyle changes to discuss',
  ];

  const suggestedQuestions = [
    'Are there any potential drug interactions I should know about?',
    'What warning signs should I watch for?',
    'Should we consider adjusting the medication dosage?',
    'Are there any lifestyle changes that could help?',
    'When should we schedule the next follow-up?',
  ];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" />
            AI Insights & Assistance
          </h1>
          <p className="text-muted-foreground">Smart tools to manage health better</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="prescription" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="prescription" className="gap-2">
              <Upload className="h-4 w-4" />
              Prescription
            </TabsTrigger>
            <TabsTrigger value="summary" className="gap-2">
              <FileText className="h-4 w-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="doctor" className="gap-2">
              <Stethoscope className="h-4 w-4" />
              Doctor Visit
            </TabsTrigger>
          </TabsList>

          {/* Prescription Upload Tab */}
          <TabsContent value="prescription" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-warning" />
                  AI Prescription Parser
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Upload a prescription image and our AI will automatically extract medicine details.
                </p>

                <div className="space-y-2">
                  <label className="text-sm font-medium">For Elder</label>
                  <div className="flex gap-2 flex-wrap">
                    {elders.map((elder) => (
                      <Button
                        key={elder.id}
                        variant={selectedElderId === elder.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedElderId(elder.id)}
                      >
                        {elder.avatar} {elder.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div 
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={handlePrescriptionUpload}
                >
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="font-medium">Click to upload prescription</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supports JPG, PNG, PDF (Demo: Click to simulate)
                  </p>
                </div>

                {isProcessing && (
                  <div className="text-center py-4">
                    <div className="animate-pulse-soft">
                      <Brain className="h-8 w-8 mx-auto text-primary mb-2" />
                      <p className="text-primary font-medium">AI is analyzing the prescription...</p>
                    </div>
                  </div>
                )}

                {/* Parsed Results */}
                {parsedMedicines.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">AI-Parsed Medicines</span>
                    </div>
                    
                    <div className="space-y-3">
                      {parsedMedicines.map((med, idx) => (
                        <div key={idx} className="p-4 rounded-lg bg-success/5 border border-success/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{med.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {med.dosage} • {med.frequency} • {med.mealTiming} food
                              </p>
                            </div>
                            <span className="text-xs px-2 py-1 bg-success/10 text-success rounded-full">
                              AI-generated
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button onClick={handleAddParsedMedicines} className="w-full gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Add All Medicines to Schedule
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            {elders.map((elder) => {
              const summary = healthSummaries.find(s => s.elderId === elder.id);
              if (!summary) return null;

              return (
                <Card key={elder.id} className="shadow-card">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{elder.avatar}</span>
                        <div>
                          <CardTitle className="text-lg">{elder.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Week of {new Date(summary.weekStarting).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </p>
                        </div>
                      </div>
                      <TrendBadge trend={summary.trend} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Adherence Rate */}
                    <div className="p-4 rounded-lg bg-secondary/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Medicine Adherence</span>
                        <span className="text-2xl font-bold text-primary">{summary.adherenceRate}%</span>
                      </div>
                      <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${summary.adherenceRate}%` }}
                        />
                      </div>
                    </div>

                    {/* AI Summary */}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <Sparkles className="h-4 w-4 text-warning" />
                        AI-Generated Summary
                      </p>
                      <p className="text-foreground">{summary.vitalsOverview}</p>
                    </div>

                    {/* Concerns */}
                    {summary.concerns.length > 0 && (
                      <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                        <p className="font-medium text-destructive mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Concerns to Address
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          {summary.concerns.map((concern, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">{concern}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                      <p className="font-medium text-success mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Recommendations
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {summary.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Doctor Visit Tab */}
          <TabsContent value="doctor" className="space-y-4">
            {/* Pre-visit Checklist */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Pre-Visit Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Prepare these items before your next doctor visit:
                </p>
                <div className="space-y-3">
                  {doctorVisitChecklist.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                      <input type="checkbox" className="h-5 w-5 rounded border-border accent-primary" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Suggested Questions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-warning" />
                  Suggested Questions for Doctor
                </CardTitle>
                <p className="text-sm text-muted-foreground">AI-generated based on health data</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suggestedQuestions.map((question, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
                      <p className="text-sm">{question}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Post-Visit Notes */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-success" />
                  Post-Visit Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full h-32 p-4 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Record notes from the doctor visit here..."
                />
                <Button className="mt-4 w-full">
                  Save Notes & Update Care Plan
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
