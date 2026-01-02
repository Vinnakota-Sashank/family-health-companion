import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Shield, Bell, Users, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { signIn, signUp } from '@/services/authService';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        toast({
          title: 'Account created!',
          description: 'You are now signed up and logged in.',
        });
      } else {
        await signIn(email, password);
        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
        });
      }

      // Sync with local app context
      // Note: passing password to local login as it might be used by mock logic, 
      // but in real app we'd just set the user object.
      await login(email, password);
      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast({
        title: isSignUp ? 'Sign up failed' : 'Login failed',
        description: error.message || 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Bell,
      title: 'Smart Reminders',
      description: 'Elders receive SMS & voice reminders automatically',
    },
    {
      icon: Heart,
      title: 'Health Tracking',
      description: 'Track vitals, medicines, and appointments in one place',
    },
    {
      icon: Shield,
      title: 'AI-Powered Insights',
      description: 'Get weekly summaries and care recommendations',
    },
    {
      icon: Users,
      title: 'Family Care',
      description: 'Manage health for multiple family members easily',
    },
  ];

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left - Branding */}
        <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
          <div className="max-w-lg mx-auto lg:mx-0">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-5xl">🏥</span>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-primary">MediMinds</h1>
                <p className="text-muted-foreground">Complete care for your family</p>
              </div>
            </div>

            <p className="text-lg lg:text-xl text-foreground mb-8 leading-relaxed">
              The smart way to care for your elderly family members.
              <span className="text-primary font-medium"> You manage everything</span> —
              they receive gentle reminders via SMS or voice calls.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-xl bg-card shadow-card animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <span className="text-3xl">💡</span>
              <div>
                <p className="text-sm font-medium text-foreground">How it works</p>
                <p className="text-xs text-muted-foreground">
                  You (the caregiver) manage all health data here. Your elders don't need to use any app —
                  they simply receive reminders on their phone.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Login Form */}
        <div className="lg:w-1/2 p-8 lg:p-16 flex items-center justify-center bg-card/50">
          <Card className="w-full max-w-md shadow-elevated border-0">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-muted-foreground mt-2">
                  {isSignUp ? 'Sign up to care for your family' : 'Sign in to manage your family\'s health'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="caregiver@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {isSignUp ? 'Creating Account...' : 'Signing in...'}
                    </>
                  ) : (
                    <>
                      {isSignUp ? 'Sign Up' : 'Sign In'}
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  {isSignUp
                    ? 'Already have an account? Sign In'
                    : 'Don\'t have an account? Sign Up'}
                </button>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-secondary/50 text-center">
                <p className="text-sm text-muted-foreground">
                  Demo: Use a real email to test Firebase Auth (password 6+ chars)
                </p>
              </div>

              <p className="mt-6 text-center text-xs text-muted-foreground">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground border-t border-border bg-card/30">
        <p>© 2024 MediMinds • AI-powered family health assistant for Indian families</p>
      </footer>
    </div>
  );
}
