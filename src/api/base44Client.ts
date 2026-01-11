// Placeholder for base44 client
// This should be replaced with actual implementation

// Mock data - 4 properties for development
const MOCK_PROPERTIES = [
  {
    id: '1',
    name: 'BRAC Guest House, Sylhet',
    description: 'A serene retreat nestled in the tea gardens of Sylhet. This peaceful guest house offers a perfect blend of comfort and local culture, surrounded by lush tea plantations.',
    curator_note: 'Perfect for those seeking solitude amidst nature. The morning tea garden walks are unforgettable.',
    status: 'published',
    location: {
      region: 'Sylhet',
      district: 'Sylhet',
      address: 'Srimangal Road, Sylhet',
    },
    photos: [
      { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80', caption: 'Main building', category: 'general' },
      { url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80', caption: 'Garden view', category: 'general' },
    ],
    category_tags: ['solitude', 'heritage', 'nature'],
    safety_features: {
      women_safety: true,
    },
    canteen: {
      available: true,
    },
    rooms_count: 12,
    created_date: new Date('2024-01-15').toISOString(),
  },
  {
    id: '2',
    name: 'Grameen Foundation Guest House, Dhaka',
    description: 'A modern guest house in the heart of Dhaka, designed for working professionals. Features quiet workspaces and excellent connectivity.',
    curator_note: 'Ideal for business travelers. The dedicated work areas make it perfect for focused work.',
    status: 'published',
    location: {
      region: 'Dhaka',
      district: 'Dhaka',
      address: 'Gulshan-2, Dhaka',
    },
    photos: [
      { url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80', caption: 'Modern rooms', category: 'general' },
      { url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80', caption: 'Workspace', category: 'general' },
    ],
    category_tags: ['work', 'professional', 'business'],
    safety_features: {
      women_safety: true,
    },
    canteen: {
      available: true,
    },
    rooms_count: 20,
    created_date: new Date('2024-02-10').toISOString(),
  },
  {
    id: '3',
    name: 'Heritage Guest House, Cox\'s Bazar',
    description: 'An elegant heritage property overlooking the Bay of Bengal. This beautifully restored colonial-era guest house tells stories of Bangladesh\'s rich history.',
    curator_note: 'A journey through time. Every corner speaks of the legacy of social movements in Bangladesh.',
    status: 'published',
    location: {
      region: 'Chittagong',
      district: 'Cox\'s Bazar',
      address: 'Kolatoli Road, Cox\'s Bazar',
    },
    photos: [
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80', caption: 'Heritage architecture', category: 'general' },
      { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', caption: 'Ocean view', category: 'general' },
    ],
    category_tags: ['legacy', 'heritage', 'history'],
    safety_features: {
      women_safety: true,
    },
    canteen: {
      available: true,
    },
    rooms_count: 15,
    created_date: new Date('2024-01-20').toISOString(),
  },
  {
    id: '4',
    name: 'Community Guest House, Rangpur',
    description: 'A warm, family-friendly guest house in rural Rangpur. Perfect for family gatherings and community events, with spacious common areas and traditional Bengali hospitality.',
    curator_note: 'The heart of community. Families love the shared spaces and local cuisine prepared with care.',
    status: 'published',
    location: {
      region: 'Rangpur',
      district: 'Rangpur',
      address: 'Pirgacha, Rangpur',
    },
    photos: [
      { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80', caption: 'Family spaces', category: 'general' },
      { url: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&q=80', caption: 'Gathering hall', category: 'general' },
    ],
    category_tags: ['gathering', 'family', 'community', 'event'],
    safety_features: {
      women_safety: true,
    },
    canteen: {
      available: true,
    },
    rooms_count: 18,
    created_date: new Date('2024-02-05').toISOString(),
  },
];

// Helper function to get dates
const getDate = (daysFromNow: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

// Mock data - Bookings with all status types
const MOCK_BOOKINGS = [
  // Today's Arrivals
  {
    id: '1',
    booking_ref: 'LEK-2025-001',
    guest_name: 'Ahmed Rahman',
    guest_email: 'ahmed.rahman@email.com',
    guest_phone: '+880 1712 345678',
    property_id: '1',
    check_in_date: getDate(0), // Today
    check_out_date: getDate(3),
    guests_count: 2,
    total_amount: 4500,
    base_amount: 4000,
    vat_amount: 500,
    pricing_tier: 'social',
    payment_method: 'card',
    status: 'confirmed',
    payment_status: 'paid',
    invoice_no: 'INV-2025-001',
    created_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    special_requests: 'Late check-in requested (after 8 PM)',
  },
  {
    id: '2',
    booking_ref: 'LEK-2025-002',
    guest_name: 'Fatima Begum',
    guest_email: 'fatima.begum@email.com',
    guest_phone: '+880 1712 345679',
    property_id: '2',
    check_in_date: getDate(0), // Today
    check_out_date: getDate(2),
    guests_count: 1,
    total_amount: 3200,
    base_amount: 3000,
    vat_amount: 200,
    pricing_tier: 'social',
    payment_method: 'bank_transfer',
    status: 'pending_payment',
    payment_status: 'pending',
    invoice_no: null,
    created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Today's Departures
  {
    id: '3',
    booking_ref: 'LEK-2025-003',
    guest_name: 'Karim Hassan',
    guest_email: 'karim.hassan@email.com',
    guest_phone: '+880 1712 345680',
    property_id: '3',
    check_in_date: getDate(-3),
    check_out_date: getDate(0), // Today
    guests_count: 3,
    total_amount: 6750,
    base_amount: 6000,
    vat_amount: 750,
    pricing_tier: 'corporate',
    payment_method: 'card',
    status: 'checked_in',
    payment_status: 'paid',
    invoice_no: 'INV-2025-003',
    created_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    checked_in_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    booking_ref: 'LEK-2025-004',
    guest_name: 'Nusrat Jahan',
    guest_email: 'nusrat.jahan@email.com',
    guest_phone: '+880 1712 345681',
    property_id: '4',
    check_in_date: getDate(-5),
    check_out_date: getDate(0), // Today
    guests_count: 4,
    total_amount: 8000,
    base_amount: 7500,
    vat_amount: 500,
    pricing_tier: 'social',
    payment_method: 'card',
    status: 'checked_in',
    payment_status: 'paid',
    invoice_no: 'INV-2025-004',
    created_date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    checked_in_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    special_requests: 'Family with 2 children, need extra bedding',
  },
  // Active Bookings
  {
    id: '5',
    booking_ref: 'LEK-2025-005',
    guest_name: 'Mohammad Ali',
    guest_email: 'mohammad.ali@email.com',
    guest_phone: '+880 1712 345682',
    property_id: '1',
    check_in_date: getDate(2),
    check_out_date: getDate(5),
    guests_count: 2,
    total_amount: 4500,
    base_amount: 4000,
    vat_amount: 500,
    pricing_tier: 'social',
    payment_method: 'card',
    status: 'confirmed',
    payment_status: 'paid',
    invoice_no: 'INV-2025-005',
    created_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    booking_ref: 'LEK-2025-006',
    guest_name: 'Sadia Islam',
    guest_email: 'sadia.islam@email.com',
    guest_phone: '+880 1712 345683',
    property_id: '2',
    check_in_date: getDate(1),
    check_out_date: getDate(4),
    guests_count: 1,
    total_amount: 3600,
    base_amount: 3300,
    vat_amount: 300,
    pricing_tier: 'corporate',
    payment_method: 'card',
    status: 'confirmed',
    payment_status: 'paid',
    invoice_no: 'INV-2025-006',
    created_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    booking_ref: 'LEK-2025-007',
    guest_name: 'Rashid Ahmed',
    guest_email: 'rashid.ahmed@email.com',
    guest_phone: '+880 1712 345684',
    property_id: '3',
    check_in_date: getDate(-2),
    check_out_date: getDate(2),
    guests_count: 2,
    total_amount: 6000,
    base_amount: 5500,
    vat_amount: 500,
    pricing_tier: 'social',
    payment_method: 'card',
    status: 'checked_in',
    payment_status: 'paid',
    invoice_no: 'INV-2025-007',
    created_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    checked_in_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Pending Payment
  {
    id: '8',
    booking_ref: 'LEK-2025-008',
    guest_name: 'Taslima Khatun',
    guest_email: 'taslima.khatun@email.com',
    guest_phone: '+880 1712 345685',
    property_id: '4',
    check_in_date: getDate(3),
    check_out_date: getDate(6),
    guests_count: 3,
    total_amount: 5400,
    base_amount: 5000,
    vat_amount: 400,
    pricing_tier: 'social',
    payment_method: 'bank_transfer',
    status: 'pending_payment',
    created_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '9',
    booking_ref: 'LEK-2025-009',
    guest_name: 'Iqbal Hossain',
    guest_email: 'iqbal.hossain@email.com',
    guest_phone: '+880 1712 345686',
    property_id: '1',
    check_in_date: getDate(5),
    check_out_date: getDate(8),
    guests_count: 2,
    total_amount: 4500,
    base_amount: 4000,
    vat_amount: 500,
    pricing_tier: 'social',
    payment_method: 'bank_transfer',
    status: 'pending_payment',
    created_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Inquiries
  {
    id: '10',
    booking_ref: 'LEK-2025-010',
    guest_name: 'Farhana Begum',
    guest_email: 'farhana.begum@email.com',
    guest_phone: '+880 1712 345687',
    property_id: '2',
    check_in_date: getDate(7),
    check_out_date: getDate(10),
    guests_count: 1,
    total_amount: 3600,
    base_amount: 3300,
    vat_amount: 300,
    pricing_tier: 'corporate',
    payment_method: null,
    status: 'inquiry',
    created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    special_requests: 'Need quiet room for work',
  },
  {
    id: '11',
    booking_ref: 'LEK-2025-011',
    guest_name: 'Shamim Reza',
    guest_email: 'shamim.reza@email.com',
    guest_phone: '+880 1712 345688',
    property_id: '3',
    check_in_date: getDate(10),
    check_out_date: getDate(15),
    guests_count: 4,
    total_amount: 11250,
    base_amount: 10000,
    vat_amount: 1250,
    pricing_tier: 'development',
    payment_method: null,
    status: 'inquiry',
    created_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Checked Out
  {
    id: '12',
    booking_ref: 'LEK-2025-012',
    guest_name: 'Ayesha Rahman',
    guest_email: 'ayesha.rahman@email.com',
    guest_phone: '+880 1712 345689',
    property_id: '4',
    check_in_date: getDate(-7),
    check_out_date: getDate(-4),
    guests_count: 2,
    total_amount: 4500,
    base_amount: 4000,
    vat_amount: 500,
    pricing_tier: 'social',
    payment_method: 'card',
    status: 'checked_out',
    payment_status: 'paid',
    invoice_no: 'INV-2025-012',
    created_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    checked_in_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    checked_out_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '13',
    booking_ref: 'LEK-2025-013',
    guest_name: 'Mizanur Rahman',
    guest_email: 'mizanur.rahman@email.com',
    guest_phone: '+880 1712 345690',
    property_id: '1',
    check_in_date: getDate(-10),
    check_out_date: getDate(-7),
    guests_count: 3,
    total_amount: 5400,
    base_amount: 5000,
    vat_amount: 400,
    pricing_tier: 'social',
    payment_method: 'card',
    status: 'checked_out',
    payment_status: 'paid',
    invoice_no: 'INV-2025-013',
    created_date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    checked_in_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    checked_out_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Cancelled
  {
    id: '14',
    booking_ref: 'LEK-2025-014',
    guest_name: 'Rokeya Sultana',
    guest_email: 'rokeya.sultana@email.com',
    guest_phone: '+880 1712 345691',
    property_id: '2',
    check_in_date: getDate(5),
    check_out_date: getDate(8),
    guests_count: 1,
    total_amount: 3600,
    base_amount: 3300,
    vat_amount: 300,
    pricing_tier: 'corporate',
    payment_method: 'card',
    status: 'cancelled',
    payment_status: 'refunded',
    invoice_no: 'INV-2025-014',
    created_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '15',
    booking_ref: 'LEK-2025-015',
    guest_name: 'Abdul Kader',
    guest_email: 'abdul.kader@email.com',
    guest_phone: '+880 1712 345692',
    property_id: '3',
    check_in_date: getDate(8),
    check_out_date: getDate(12),
    guests_count: 2,
    total_amount: 6000,
    base_amount: 5500,
    vat_amount: 500,
    pricing_tier: 'social',
    payment_method: 'bank_transfer',
    status: 'cancelled',
    payment_status: 'refunded',
    invoice_no: 'INV-2025-015',
    created_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Refunded
  {
    id: '16',
    booking_ref: 'LEK-2025-016',
    guest_name: 'Nasima Akter',
    guest_email: 'nasima.akter@email.com',
    guest_phone: '+880 1712 345693',
    property_id: '4',
    check_in_date: getDate(12),
    check_out_date: getDate(15),
    guests_count: 3,
    total_amount: 5400,
    base_amount: 5000,
    vat_amount: 400,
    pricing_tier: 'social',
    payment_method: 'card',
    status: 'refunded',
    payment_status: 'refunded',
    invoice_no: 'INV-2025-016',
    created_date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Guest Register data
const MOCK_GUEST_REGISTERS = [
  {
    id: '1',
    booking_id: '1',
    property_id: '1',
    guest_name: 'Ahmed Rahman',
    father_name: 'Abdul Rahman',
    phone: '+880 1712 345678',
    id_type: 'nid',
    id_number: '1234567890123',
    nationality: 'Bangladeshi',
    permanent_address: 'House 45, Road 7, Dhanmondi, Dhaka',
    present_address: 'House 45, Road 7, Dhanmondi, Dhaka',
    purpose_of_visit: 'Tourism',
    coming_from: 'Dhaka',
    going_to: 'Sylhet',
    room_number: '101',
    check_in_time: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000).toISOString(),
    check_out_time: null,
    created_date: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    booking_id: '3',
    property_id: '3',
    guest_name: 'Karim Hassan',
    father_name: 'Hassan Ali',
    phone: '+880 1712 345680',
    id_type: 'passport',
    id_number: 'A12345678',
    nationality: 'Bangladeshi',
    permanent_address: 'Village: Shyampur, Upazila: Beanibazar, Sylhet',
    present_address: 'Gulshan-2, Dhaka',
    purpose_of_visit: 'Business',
    coming_from: 'Dhaka',
    going_to: 'Cox\'s Bazar',
    room_number: '205',
    check_in_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    check_out_time: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000).toISOString(),
    created_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    booking_id: '4',
    property_id: '4',
    guest_name: 'Nusrat Jahan',
    father_name: 'Mohammad Jahan',
    phone: '+880 1712 345681',
    id_type: 'nid',
    id_number: '9876543210987',
    nationality: 'Bangladeshi',
    permanent_address: 'House 12, Block C, Mirpur, Dhaka',
    present_address: 'House 12, Block C, Mirpur, Dhaka',
    purpose_of_visit: 'Family Gathering',
    coming_from: 'Dhaka',
    going_to: 'Rangpur',
    room_number: '301',
    check_in_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    check_out_time: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000).toISOString(),
    created_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    booking_id: '7',
    property_id: '3',
    guest_name: 'Rashid Ahmed',
    father_name: 'Ahmed Ali',
    phone: '+880 1712 345684',
    id_type: 'nid',
    id_number: '4567890123456',
    nationality: 'Bangladeshi',
    permanent_address: 'Village: Bhola, District: Bhola',
    present_address: 'Chittagong',
    purpose_of_visit: 'Tourism',
    coming_from: 'Chittagong',
    going_to: 'Cox\'s Bazar',
    room_number: '102',
    check_in_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    check_out_time: null,
    created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    booking_id: '12',
    property_id: '4',
    guest_name: 'Ayesha Rahman',
    father_name: 'Rahman Ali',
    phone: '+880 1712 345689',
    id_type: 'nid',
    id_number: '7890123456789',
    nationality: 'Bangladeshi',
    permanent_address: 'House 8, Road 12, Banani, Dhaka',
    present_address: 'House 8, Road 12, Banani, Dhaka',
    purpose_of_visit: 'Tourism',
    coming_from: 'Dhaka',
    going_to: 'Rangpur',
    room_number: '201',
    check_in_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    check_out_time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    created_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    booking_id: '13',
    property_id: '1',
    guest_name: 'Mizanur Rahman',
    father_name: 'Rahman Hossain',
    phone: '+880 1712 345690',
    id_type: 'nid',
    id_number: '2345678901234',
    nationality: 'Bangladeshi',
    permanent_address: 'Village: Sreemangal, Moulvibazar',
    present_address: 'Sreemangal, Moulvibazar',
    purpose_of_visit: 'Family Visit',
    coming_from: 'Moulvibazar',
    going_to: 'Sylhet',
    room_number: '103',
    check_in_time: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    check_out_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    booking_id: '5',
    property_id: '1',
    guest_name: 'Mohammad Ali',
    father_name: 'Ali Hassan',
    phone: '+880 1712 345682',
    id_type: 'nid',
    id_number: '3456789012345',
    nationality: 'Bangladeshi',
    permanent_address: 'House 23, Road 5, Uttara, Dhaka',
    present_address: 'House 23, Road 5, Uttara, Dhaka',
    purpose_of_visit: 'Tourism',
    coming_from: 'Dhaka',
    going_to: 'Sylhet',
    room_number: '104',
    check_in_time: null, // Future booking
    check_out_time: null,
    created_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    booking_id: '6',
    property_id: '2',
    guest_name: 'Sadia Islam',
    father_name: 'Islam Uddin',
    phone: '+880 1712 345683',
    id_type: 'nid',
    id_number: '5678901234567',
    nationality: 'Bangladeshi',
    permanent_address: 'House 15, Road 3, Dhanmondi, Dhaka',
    present_address: 'House 15, Road 3, Dhanmondi, Dhaka',
    purpose_of_visit: 'Business',
    coming_from: 'Dhaka',
    going_to: 'Dhaka',
    room_number: '202',
    check_in_time: null, // Future booking
    check_out_time: null,
    created_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Compliance Export data
const MOCK_COMPLIANCE_EXPORTS = [
  {
    id: '1',
    property_id: 'all',
    export_type: 'guest_register',
    date_from: getDate(-30),
    date_to: getDate(-7),
    record_count: 45,
    created_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    exported_by: 'Admin User',
  },
  {
    id: '2',
    property_id: '1',
    export_type: 'vat_report',
    date_from: getDate(-30),
    date_to: getDate(-1),
    record_count: 12,
    created_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    exported_by: 'Finance Team',
  },
  {
    id: '3',
    property_id: 'all',
    export_type: 'guest_register',
    date_from: getDate(-60),
    date_to: getDate(-30),
    record_count: 38,
    created_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    exported_by: 'Compliance Officer',
  },
  {
    id: '4',
    property_id: '3',
    export_type: 'vat_report',
    date_from: getDate(-15),
    date_to: getDate(-1),
    record_count: 8,
    created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    exported_by: 'Admin User',
  },
];

export const base44 = {
  auth: {
    isAuthenticated: async () => {
      const auth = localStorage.getItem('lekhyo_authenticated');
      return auth === 'true';
    },
    me: async () => {
      const userStr = localStorage.getItem('lekhyo_user');
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    },
    redirectToLogin: (returnUrl?: string) => {
      // This will be handled by React Router navigation
      window.location.href = `/login${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`;
    },
    logout: async () => {
      localStorage.removeItem('lekhyo_user');
      localStorage.removeItem('lekhyo_authenticated');
      window.location.href = '/';
    },
  },
  entities: {
    Property: {
      list: async (sort?: string) => {
        const properties = [...MOCK_PROPERTIES];
        if (sort === '-created_date') {
          properties.sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
        }
        return properties;
      },
      filter: async (params: any) => {
        let properties = [...MOCK_PROPERTIES];
        
        if (params.status) {
          properties = properties.filter(p => p.status === params.status);
        }
        
        if (params.id) {
          properties = properties.filter(p => p.id === params.id);
        }
        
        return properties;
      },
      create: async (data: any) => ({
        ...data,
        id: String(MOCK_PROPERTIES.length + 1),
        created_date: new Date().toISOString(),
      }),
      update: async (id: string, data: any) => ({
        ...data,
        id,
      }),
      delete: async (id: string) => {},
    },
    Booking: {
      list: async (sort?: string, limit?: number) => {
        const bookings = [...MOCK_BOOKINGS];
        if (sort === '-created_date') {
          bookings.sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
        }
        return limit ? bookings.slice(0, limit) : bookings;
      },
      filter: async (params: any, sort?: string) => {
        let bookings = [...MOCK_BOOKINGS];
        
        if (params.guest_id) {
          bookings = bookings.filter(b => b.guest_id === params.guest_id);
        }
        
        if (params.property_id) {
          bookings = bookings.filter(b => b.property_id === params.property_id);
        }
        
        if (params.status) {
          bookings = bookings.filter(b => b.status === params.status);
        }
        
        if (sort === '-created_date') {
          bookings.sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
        }
        
        return bookings;
      },
      create: async (data: any) => ({
        ...data,
        id: String(MOCK_BOOKINGS.length + 1),
        booking_ref: `LEK-${Date.now()}`,
        created_date: new Date().toISOString(),
      }),
      update: async (id: string, data: any) => {
        const index = MOCK_BOOKINGS.findIndex(b => b.id === id);
        if (index >= 0) {
          MOCK_BOOKINGS[index] = { ...MOCK_BOOKINGS[index], ...data };
          return MOCK_BOOKINGS[index];
        }
        return { ...data, id };
      },
    },
    Room: {
      list: async () => [],
      filter: async (params: any) => {
        // Mock rooms data based on property
        const rooms: any[] = [];
        const propertyId = params.property_id;
        
        if (propertyId === '1') {
          // BRAC Guest House, Sylhet
          rooms.push(
            { id: 'r1-1', property_id: '1', name: 'Standard Room', room_type: 'standard', capacity: 2, status: 'active', has_ac: true, has_attached_bath: true },
            { id: 'r1-2', property_id: '1', name: 'Deluxe Room', room_type: 'deluxe', capacity: 3, status: 'active', has_ac: true, has_attached_bath: true },
            { id: 'r1-3', property_id: '1', name: 'Family Room', room_type: 'family', capacity: 4, status: 'active', has_ac: true, has_attached_bath: true }
          );
        } else if (propertyId === '2') {
          // Grameen Foundation Guest House, Dhaka
          rooms.push(
            { id: 'r2-1', property_id: '2', name: 'Business Room', room_type: 'standard', capacity: 1, status: 'active', has_ac: true, has_attached_bath: true },
            { id: 'r2-2', property_id: '2', name: 'Executive Room', room_type: 'deluxe', capacity: 2, status: 'active', has_ac: true, has_attached_bath: true },
            { id: 'r2-3', property_id: '2', name: 'Suite', room_type: 'suite', capacity: 2, status: 'active', has_ac: true, has_attached_bath: true }
          );
        } else if (propertyId === '3') {
          // Heritage Guest House, Cox's Bazar
          rooms.push(
            { id: 'r3-1', property_id: '3', name: 'Heritage Room', room_type: 'standard', capacity: 2, status: 'active', has_ac: false, has_attached_bath: true },
            { id: 'r3-2', property_id: '3', name: 'Ocean View Room', room_type: 'deluxe', capacity: 3, status: 'active', has_ac: true, has_attached_bath: true },
            { id: 'r3-3', property_id: '3', name: 'Family Suite', room_type: 'family', capacity: 4, status: 'active', has_ac: true, has_attached_bath: true }
          );
        } else if (propertyId === '4') {
          // Community Guest House, Rangpur
          rooms.push(
            { id: 'r4-1', property_id: '4', name: 'Community Room', room_type: 'standard', capacity: 2, status: 'active', has_ac: false, has_attached_bath: false },
            { id: 'r4-2', property_id: '4', name: 'Family Room', room_type: 'family', capacity: 4, status: 'active', has_ac: false, has_attached_bath: true },
            { id: 'r4-3', property_id: '4', name: 'Large Family Room', room_type: 'family', capacity: 6, status: 'active', has_ac: false, has_attached_bath: true }
          );
        }
        
        // Filter by status if provided
        if (params.status) {
          return rooms.filter(r => r.status === params.status);
        }
        
        return rooms;
      },
      create: async (data: any) => ({}),
      update: async (id: string, data: any) => ({}),
      delete: async (id: string) => {},
    },
    Pricing: {
      filter: async (params: any) => {
        // Mock pricing data based on property
        const pricing: any[] = [];
        const propertyId = params.property_id;
        const isActive = params.is_active !== false; // Default to true
        
        // Base rates per property (per night)
        const baseRates: any = {
          '1': { standard: 1500, deluxe: 2000, family: 2500 }, // BRAC Sylhet
          '2': { standard: 2000, deluxe: 3000, suite: 4000 }, // Grameen Dhaka
          '3': { standard: 1800, deluxe: 2500, family: 3200 }, // Heritage Cox's Bazar
          '4': { standard: 1200, family: 2000 }, // Community Rangpur
        };
        
        const rates = baseRates[propertyId] || { standard: 1500 };
        const tiers = ['social', 'corporate', 'development'];
        const tierMultipliers: any = { social: 1.0, corporate: 1.2, development: 0.7 };
        
        // Generate pricing for each room type and tier
        Object.keys(rates).forEach((roomType: string) => {
          tiers.forEach((tier: string) => {
            const baseRate = Math.round(rates[roomType] * tierMultipliers[tier]);
            pricing.push({
              id: `p-${propertyId}-${roomType}-${tier}`,
              property_id: propertyId,
              room_type: roomType,
              tier: tier,
              base_rate: baseRate,
              is_active: isActive,
            });
          });
        });
        
        // Filter by is_active if provided
        if (params.is_active !== undefined) {
          return pricing.filter(p => p.is_active === params.is_active);
        }
        
        return pricing;
      },
      create: async (data: any) => ({}),
      update: async (id: string, data: any) => ({}),
      delete: async (id: string) => {},
    },
    GuestRegister: {
      list: async (sort?: string, limit?: number) => {
        const registers = [...MOCK_GUEST_REGISTERS];
        if (sort === '-created_date') {
          registers.sort((a, b) => new Date(b.created_date || b.check_in_time).getTime() - new Date(a.created_date || a.check_in_time).getTime());
        }
        return limit ? registers.slice(0, limit) : registers;
      },
    },
    ComplianceExport: {
      list: async (sort?: string, limit?: number) => {
        const exports = [...MOCK_COMPLIANCE_EXPORTS];
        if (sort === '-created_date') {
          exports.sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
        }
        return limit ? exports.slice(0, limit) : exports;
      },
      create: async (data: any) => {
        const newExport = {
          ...data,
          id: String(MOCK_COMPLIANCE_EXPORTS.length + 1),
          created_date: new Date().toISOString(),
          exported_by: 'System User',
        };
        MOCK_COMPLIANCE_EXPORTS.unshift(newExport);
        return newExport;
      },
    },
  },
  integrations: {
    Core: {
      InvokeLLM: async (params: any) => ({}),
      UploadFile: async (params: any) => ({ file_url: '' }),
    },
  },
};
