import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

export const AdminLoginPage = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem('admin_authenticated', 'true');
        toast.success('Successfully logged in');
        navigate('/admin/dashboard');
      } else {
        toast.error('Incorrect password');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-cosmic stars-bg p-3 md:p-4">
      <Card className="w-full max-w-md glass-card border-primary/20">
        <CardHeader className="space-y-1 p-4 md:p-6">
          <CardTitle className="text-xl md:text-2xl font-bold text-center text-glow-cyan font-display">Admin Panel</CardTitle>
          <CardDescription className="text-center text-xs md:text-sm">
            Enter password to access admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
          <form onSubmit={handleLogin} className="space-y-3 md:space-y-4">
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="password" className="text-xs md:text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 md:h-11 text-sm md:text-base"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-10 md:h-11 text-sm md:text-base rounded-full bg-gradient-primary hover:scale-105 glow-cyan transition-all"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
