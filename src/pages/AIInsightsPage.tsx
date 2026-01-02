import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { analyzePrescription } from '@/services/geminiService';
import { AppLayout } from '@/components/layout/AppLayout';
import { TrendBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
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
import { AIChatAssistant } from '@/components/ai/AIChatAssistant';
import { VitalsChart } from '@/components/analytics/VitalsChart';
import { Activity } from 'lucide-react';

export default function AIInsightsPage() {
  const { elders, healthSummaries, addMedicine, addPrescription, getVitalsForElder } = useApp();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedMedicines, setParsedMedicines] = useState<Partial<Medicine>[]>([]);
  const [selectedElderId, setSelectedElderId] = useState<string>(elders[0]?.id || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleScan = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);

    try {
      const result = await analyzePrescription(selectedFile, selectedElderId);

      if (result && result.medicines) {
        // Convert parsed format to ParsedMedicine (Partial<Medicine>)
        const mappedMedicines: Partial<Medicine>[] = result.medicines.map(m => ({
          name: m.name || '',
          dosage: m.dosage || '',
          frequency: m.frequency || '',
          mealTiming: (m.timing && m.timing.toLowerCase().includes('before')) ? 'before' :
            (m.timing && m.timing.toLowerCase().includes('with')) ? 'with' : 'after',
          duration: m.duration || '',
          notes: m.instructions || ''
        }));

        setParsedMedicines(mappedMedicines);

        toast({
          title: 'Prescription Analyzed',
          description: `AI has extracted ${mappedMedicines.length} medicines from the prescription.`,
        });
      } else {
        toast({
          title: 'Analysis Failed',
          description: 'Could not extract medicines. Please try a clearer image.',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to analyze prescription. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
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
    setSelectedFile(null);
  };

  const updateParsedMedicine = (index: number, field: keyof Medicine, value: string) => {
    const updated = [...parsedMedicines];
    updated[index] = { ...updated[index], [field]: value };
    setParsedMedicines(updated);
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ai-assistant" className="gap-2">
              <Sparkles className="h-4 w-4" />
              AI Assistant
            </TabsTrigger>
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

          {/* AI Assistant Tab */}
          <TabsContent value="ai-assistant" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <p className="text-sm font-medium">Select Profile:</p>
                <div className="flex gap-2">
                  {elders.map((elder) => (
                    <Button
                      key={elder.id}
                      variant={selectedElderId === elder.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedElderId(elder.id)}
                      className="gap-2"
                    >
                      {elder.avatar} {elder.name}
                    </Button>
                  ))}
                </div>
              </div>
              <AIChatAssistant elderId={selectedElderId} />
            </div>
          </TabsContent>

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

                <div className="relative">
                  {!selectedElderId ? (
                    <div>
                      <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-secondary/10">
                        <p className="text-muted-foreground">Please select an elder profile above to upload</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {!selectedFile ? (
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={handleFileSelect}
                            disabled={isProcessing}
                          />
                          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="font-medium">Click to select prescription image</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Supports JPG, PNG, WEBP
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-border rounded-xl p-6 text-center bg-secondary/10">
                          <FileText className="h-8 w-8 mx-auto text-primary mb-2" />
                          <p className="font-medium mb-1">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground mb-4">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <div className="flex gap-2 justify-center">
                            <Button variant="outline" onClick={() => setSelectedFile(null)} disabled={isProcessing}>
                              Change File
                            </Button>
                            <Button onClick={handleScan} disabled={isProcessing}>
                              {isProcessing ? 'Scanning...' : 'Scan Prescription'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
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
                        <div key={idx} className="p-4 rounded-lg bg-background border border-border space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Medicine Name</label>
                              <Input
                                value={med.name}
                                onChange={(e) => updateParsedMedicine(idx, 'name', e.target.value)}
                                placeholder="Name"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Dosage</label>
                              <Input
                                value={med.dosage}
                                onChange={(e) => updateParsedMedicine(idx, 'dosage', e.target.value)}
                                placeholder="e.g. 500mg"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Frequency</label>
                              <Input
                                value={med.frequency}
                                onChange={(e) => updateParsedMedicine(idx, 'frequency', e.target.value)}
                                placeholder="e.g. Twice daily"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Timing</label>
                              <Input
                                value={med.mealTiming}
                                onChange={(e) => updateParsedMedicine(idx, 'mealTiming', e.target.value)}
                                placeholder="before/after/with"
                              />
                            </div>
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

                    {/* Vitals Charts */}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        Vitals Trends
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <VitalsChart
                          title="Blood Pressure"
                          type="BP"
                          data={getVitalsForElder(elder.id)}
                          color="#ef4444"
                        />
                        <VitalsChart
                          title="Blood Sugar"
                          type="Sugar"
                          data={getVitalsForElder(elder.id)}
                          color="#3b82f6"
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
    </AppLayout >
  );
}
