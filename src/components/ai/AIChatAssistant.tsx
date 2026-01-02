
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface AIChatAssistantProps {
    elderId: string;
}

export function AIChatAssistant({ elderId }: AIChatAssistantProps) {
    const { elders, getMedicinesForElder, getVitalsForElder } = useApp();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Hello! I'm your MediMinds health assistant. You can ask me about medications, vitals, or general health advice for this profile.",
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const elder = elders.find((e) => e.id === elderId);
    const medicines = getMedicinesForElder(elderId);
    const vitals = getVitalsForElder(elderId);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    const generateResponse = async (query: string) => {
        setIsTyping(true);

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const lowerQuery = query.toLowerCase();
        let response = "I'm not sure about that. Consult a doctor for specific medical advice.";

        if (lowerQuery.includes('medicine') || lowerQuery.includes('medication')) {
            const medNames = medicines.map((m) => m.name).join(', ');
            response = medNames
                ? `${elder?.name} is currently taking: ${medNames}. Always follow the prescribed dosage.`
                : `${elder?.name} has no active medications listed.`;
        } else if (lowerQuery.includes('vital') || lowerQuery.includes('bp') || lowerQuery.includes('sugar')) {
            const latestVital = vitals[vitals.length - 1];
            response = latestVital
                ? `The latest vital reading was ${latestVital.type}: ${latestVital.value} ${latestVital.unit} on ${new Date(latestVital.recordedAt).toLocaleDateString()}.`
                : "No vital readings recorded recently.";
        } else if (lowerQuery.includes('side effect')) {
            response = "Common side effects depend on the specific medication. Please upload a prescription or consult the medicine leaflet. Navigate to the 'Prescription' tab to analyze a new prescription.";
        } else if (lowerQuery.includes('diet') || lowerQuery.includes('food')) {
            response = "A balanced diet rich in vegetables and low in sodium is generally recommended. For specific conditions like diabetes or hypertension, please follow the doctor's dietary chart.";
        } else if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
            response = `Hello! How can I help you with ${elder?.name || 'your elder'}'s health today?`;
        }

        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: response,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setIsTyping(false);
    };

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputValue('');
        generateResponse(inputValue);
    };

    return (
        <Card className="h-[500px] flex flex-col shadow-card">
            <CardHeader className="border-b bg-muted/20">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Health Assistant
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full p-4">
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                    }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-secondary text-secondary-foreground'
                                        }`}
                                >
                                    {msg.role === 'user' ? (
                                        <User className="h-5 w-5" />
                                    ) : (
                                        <Bot className="h-5 w-5" />
                                    )}
                                </div>
                                <div
                                    className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                                            : 'bg-secondary text-secondary-foreground rounded-tl-none'
                                        }`}
                                >
                                    {msg.content}
                                    <p className="text-[10px] opacity-70 mt-1 text-right">
                                        {msg.timestamp.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                    <Bot className="h-5 w-5" />
                                </div>
                                <div className="bg-secondary p-3 rounded-lg rounded-tl-none">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="p-3 border-t bg-muted/20">
                <div className="flex w-full items-center gap-2">
                    <Input
                        placeholder="Type your question..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className="flex-1"
                    />
                    <Button size="icon" onClick={handleSend} disabled={!inputValue.trim() || isTyping}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
