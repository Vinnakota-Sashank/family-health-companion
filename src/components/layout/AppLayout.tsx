import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, Pill, Brain, FileText, LogOut, Menu, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/elder/elder-1', label: 'Elder Profiles', icon: User },
  { path: '/medicines', label: 'Medicines', icon: Pill },
  { path: '/ai-insights', label: 'AI Insights', icon: Brain },
  { path: '/history', label: 'History', icon: FileText },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useApp();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navItems.map(item => {
        const isActive = location.pathname.startsWith(item.path.split('/')[1] === 'elder' ? '/elder' : item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-card'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏥</span>
          <span className="text-lg font-bold text-primary">MediMinds</span>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🏥</span>
                  <div>
                    <h1 className="text-xl font-bold text-primary">MediMinds</h1>
                    <p className="text-xs text-muted-foreground">Complete care for your family</p>
                  </div>
                </div>
              </div>
              <nav className="flex-1 p-4 space-y-2">
                <NavLinks onClick={() => setIsOpen(false)} />
              </nav>
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                    {user?.avatar || '👤'}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex-col z-40">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏥</span>
            <div>
              <h1 className="text-xl font-bold text-primary">MediMinds</h1>
              <p className="text-xs text-muted-foreground">Complete care for your family</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLinks />
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
              {user?.avatar || '👤'}
            </div>
            <div>
              <p className="font-medium text-sm">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
