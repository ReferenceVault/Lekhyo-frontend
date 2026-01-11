import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import PropertyDetail from './pages/PropertyDetail'
import Checkout from './pages/Checkout'
import GuestDashboard from './pages/GuestDashboard'
import ManagementDashboard from './pages/ManagementDashboard'
import ManagementProperties from './pages/ManagementProperties'
import PropertyEditor from './pages/PropertyEditor'
import PropertyCalendar from './pages/PropertyCalendar'
import BookingOperations from './pages/BookingOperations'
import Compliance from './pages/Compliance'
import AboutUs from './pages/AboutUs'
import ContactUs from './pages/ContactUs'
import Login from './pages/Login'

function AppRoutes() {
  const location = useLocation();
  
  // Extract page name from path
  const getPageName = (pathname: string): string => {
    if (pathname === '/' || pathname === '/home') return 'Home';
    if (pathname.startsWith('/property-detail')) return 'PropertyDetail';
    if (pathname.startsWith('/property-calendar')) return 'PropertyCalendar';
    if (pathname.startsWith('/checkout')) return 'Checkout';
    if (pathname.startsWith('/guest-dashboard')) return 'GuestDashboard';
    if (pathname.startsWith('/management-dashboard')) return 'ManagementDashboard';
    if (pathname.startsWith('/management-properties')) return 'ManagementProperties';
    if (pathname.startsWith('/property-editor')) return 'PropertyEditor';
    if (pathname.startsWith('/booking-operations')) return 'BookingOperations';
    if (pathname.startsWith('/compliance')) return 'Compliance';
    if (pathname.startsWith('/about-us')) return 'AboutUs';
    if (pathname.startsWith('/contact-us')) return 'ContactUs';
    if (pathname.startsWith('/login')) return 'Login';
    return 'Home';
  };

  const currentPageName = getPageName(location.pathname);

  // Don't wrap Login page with Layout
  if (currentPageName === 'Login') {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <Layout currentPageName={currentPageName}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/property-detail" element={<PropertyDetail />} />
        <Route path="/property-calendar" element={<PropertyCalendar />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/guest-dashboard" element={<GuestDashboard />} />
        <Route path="/management-dashboard" element={<ManagementDashboard />} />
        <Route path="/management-properties" element={<ManagementProperties />} />
        <Route path="/property-editor" element={<PropertyEditor />} />
        <Route path="/booking-operations" element={<BookingOperations />} />
        <Route path="/compliance" element={<Compliance />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return <AppRoutes />;
}

export default App
