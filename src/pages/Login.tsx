import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Compass, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Get redirect path from location state or default to Guest Dashboard
  const from = (location.state as any)?.from?.pathname || createPageUrl('GuestDashboard');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Accept any email and password for demo purposes
      if (!email || !password) {
        setError('Please enter both email and password');
        setIsLoading(false);
        return;
      }

      // Simulate login API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create a mock user object
      const userData = {
        id: '1',
        email: email,
        full_name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        user_type: 'guest',
      };

      // Store in localStorage for persistence
      localStorage.setItem('lekhyo_user', JSON.stringify(userData));
      localStorage.setItem('lekhyo_authenticated', 'true');

      // Redirect to the intended page or Guest Dashboard
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#B5573E] flex items-center justify-center">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-light tracking-wide text-[#2C2C2C]">Lekhyo</span>
          </Link>
          <p className="text-sm text-[#2C2C2C]/60 font-light">
            Curated spaces with stories
          </p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/90 border-[#2C2C2C]/10 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-light text-[#2C2C2C] text-center">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center font-light">
              Sign in to access your bookings and explore spaces
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2C2C2C]/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2C2C2C]/40" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-white"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#B5573E] hover:bg-[#9a4935] text-white gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  'Signing in...'
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <div className="text-center text-xs text-[#2C2C2C]/60 font-light pt-2">
                <p>Demo mode: Any email and password will work</p>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-[#2C2C2C]/10">
              <p className="text-center text-sm text-[#2C2C2C]/60 font-light">
                Don't have an account?{' '}
                <Link
                  to={createPageUrl('Home')}
                  className="text-[#B5573E] hover:text-[#9a4935] font-medium"
                >
                  Explore as guest
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            to={createPageUrl('Home')}
            className="text-sm text-[#2C2C2C]/60 hover:text-[#B5573E] font-light"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
