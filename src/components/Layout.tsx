import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { 
  Menu, X, User, LogOut, Home, Building2, Calendar, 
  ClipboardList, FileText, Settings, ChevronDown, Compass, Info, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children, currentPageName }: any) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  // Reload user when location changes (e.g., after login)
  useEffect(() => {
    loadUser();
  }, [location.pathname]);

  const loadUser = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const userData = await base44.auth.me();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.log('Not authenticated');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const isManagementPage = currentPageName?.startsWith('Management') || 
    currentPageName === 'PropertyEditor' || 
    currentPageName === 'BookingOperations' ||
    currentPageName === 'Compliance';

  const isGalleryPage = !isManagementPage;

  const isStaff = user?.user_type && ['curator', 'regional_manager', 'compliance_officer', 'super_admin'].includes(user.user_type);

  // Gallery pages get minimal chrome
  if (isGalleryPage && currentPageName !== 'GuestDashboard') {
    return (
      <div className="min-h-screen bg-[#F5F0E8]">
        <style>{`
          :root {
            --lekhyo-terracotta: #B5573E;
            --lekhyo-cream: #F5F0E8;
            --lekhyo-sage: #8B9D77;
            --lekhyo-charcoal: #2C2C2C;
            --lekhyo-warm-white: #FDFCFA;
          }
          body {
            font-family: 'Inter', system-ui, sans-serif;
          }
          .cursor-glow {
            box-shadow: 0 0 40px rgba(181, 87, 62, 0.3);
          }
          @keyframes breathe {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 1; }
          }
          .breathing {
            animation: breathe 3s ease-in-out infinite;
          }
        `}</style>

        {/* Minimal floating nav for gallery */}
        <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 bg-[#F5F0E8]/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#B5573E] flex items-center justify-center">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-light tracking-wide text-[#2C2C2C]">Lekhyo</span>
            </Link>

            <div className="flex items-center gap-4">
              {/* Hamburger Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-[#2C2C2C] hover:bg-white/50 p-2 relative z-[101]">
                    <Menu className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 z-[102]">
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('AboutUs')} className="cursor-pointer">
                      <Info className="w-4 h-4 mr-2" />
                      About Us
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('ContactUs')} className="cursor-pointer">
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Us
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('ManagementDashboard')} className="cursor-pointer">
                      <Home className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {!isLoading && (
                <>
                  {user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="gap-2 text-[#2C2C2C] hover:bg-white/50">
                          <User className="w-4 h-4" />
                          <span className="hidden sm:inline">{user.full_name?.split(' ')[0]}</span>
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 z-[102]">
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl('GuestDashboard')} className="cursor-pointer">
                            My Bookings
                          </Link>
                        </DropdownMenuItem>
                        {isStaff && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link to={createPageUrl('ManagementDashboard')} className="cursor-pointer">
                                Management Portal
                              </Link>
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => base44.auth.logout()}
                          className="text-red-600 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button 
                      variant="ghost" 
                      className="text-[#2C2C2C] hover:bg-white/50"
                      onClick={() => navigate(createPageUrl('Login'), { state: { from: { pathname: location.pathname } } })}
                    >
                      Sign In
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </nav>

        <main>{children}</main>
      </div>
    );
  }

  // Management portal & Guest Dashboard get full navigation
  const managementNav = [
    { name: 'Dashboard', page: 'ManagementDashboard', icon: Home },
    { name: 'Properties', page: 'ManagementProperties', icon: Building2 },
    { name: 'Bookings', page: 'BookingOperations', icon: Calendar },
    { name: 'Compliance', page: 'Compliance', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        :root {
          --lekhyo-terracotta: #B5573E;
          --lekhyo-cream: #F5F0E8;
          --lekhyo-sage: #8B9D77;
          --lekhyo-charcoal: #2C2C2C;
        }
      `}</style>

      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button 
                className="lg:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <Link to={createPageUrl('Home')} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#B5573E] flex items-center justify-center">
                  <Compass className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-light tracking-wide text-[#2C2C2C]">Lekhyo</span>
              </Link>

              {isManagementPage && (
                <span className="hidden sm:inline-block px-2 py-1 bg-[#B5573E]/10 text-[#B5573E] text-xs font-medium rounded">
                  Architect's Desk
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              {isManagementPage && (
                <Link to={createPageUrl('Home')}>
                  <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                    <Compass className="w-4 h-4" />
                    View Gallery
                  </Button>
                </Link>
              )}

              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#B5573E] flex items-center justify-center text-white text-sm">
                        {user.full_name?.[0] || 'U'}
                      </div>
                      <span className="hidden sm:inline">{user.full_name}</span>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 z-[102]">
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('GuestDashboard')} className="cursor-pointer">
                        My Bookings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => base44.auth.logout()}
                      className="text-red-600 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar for management pages */}
        {isManagementPage && (
          <>
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex w-64 flex-col fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200">
              <nav className="flex-1 p-4 space-y-1">
                {managementNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPageName === item.page;
                  return (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-[#B5573E]/10 text-[#B5573E]' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </aside>

            {/* Mobile sidebar */}
            {mobileMenuOpen && (
              <div className="lg:hidden fixed inset-0 top-16 z-40">
                <div className="absolute inset-0 bg-black/20" onClick={() => setMobileMenuOpen(false)} />
                <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white">
                  <nav className="p-4 space-y-1">
                    {managementNav.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.page}
                          to={createPageUrl(item.page)}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
                        >
                          <Icon className="w-5 h-5" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </nav>
                </aside>
              </div>
            )}
          </>
        )}

        {/* Main content */}
        <main className={`flex-1 ${isManagementPage ? 'lg:ml-64' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
