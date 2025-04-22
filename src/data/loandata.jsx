// src/data/loandata.jsx

// Loan platform settings
export const loanSettings = {
    interestRate: 0.025,               // 2.5% interest on the outstanding principal
    requireGuarantor: true,            // guarantor must be another vendor on the platform
    paymentMethods: [
      'Wallet',
      'Airtel Money',
      'MTN Mobile Money',
      'Visa',
      'Mastercard',
    ],
  };
  
  // Tabs for loan UI
  export const loanTabs = [
    'Loan Applications',    // Vendor loan applications (Pending, Rejected, or Approved)
    'Upcoming Due Loans',   // Loans with upcoming due dates (Admin overview)
    'Repayment History',    // Completed repayments
    'Overdue Loans',        // Loans past due
  ];
  
  // Array of Bible names for vendors and guarantors
  const bibleNames = [
    'Atuhura Wilson', 'Alinatwe Janet', 'Josh Noah', 'Arinda Abraham', 'Nakiza Sarah', 'Ajira Isaac', 'Reeana Rebekah', 'Opio Jacob',
    'Feli Leah', 'Seera Rachel', 'Murih Joseph', 'Ajarah Moses', 'Alina Miriam', 'Dezih Aaron', 'Wendi Joshua', 'Alisha Deborah',
    'Tenor Samuel', 'Swandi Ruth', 'Nakungu Esther', 'Tuhaise David', 'Fahad Bashil', 'Shalom Solomon', 'Tolyna Elijah',
    'Alinda Eli', 'sharry Isaiah', 'Peace Jeremiah', 'Dani Daniel', 'William Jonah', 'Arora John', 'Amiliya Mary'
  ];
  
  // Generate 30 sample loan applications for vendors
  const statuses = ['Pending', 'Rejected', 'Approved'];
  export const loanApplications = Array.from({ length: 30 }, (_, i) => {
    const id = `A${String(i + 1).padStart(3, '0')}`;
    const vendorName = bibleNames[i % bibleNames.length];
    const walletBalance = `UGX ${(i + 1) * 100_000}`;
    const requestedAmount = `UGX ${(i + 1) * 50_000}`;
    const guarantorName = bibleNames[(i + 1) % bibleNames.length];
    const appliedDay = 10 + (i % 20);
    const appliedDate = `2025-04-${String(appliedDay).padStart(2, '0')}`;
    const status = statuses[i % statuses.length];
  
    return {
      applicationId: id,
      vendor: { name: vendorName, walletBalance },
      requestedAmount,
      guarantor: guarantorName,
      appliedDate,
      status,
    };
  });
  
  // Sample repayment blocks for upcoming and overdue loans
  export const repaymentBlocks = [
    {
      id: 'L001',
      vendor: { name: 'Adam', walletBalance: 'UGX 1,200,000' },
      guarantor: 'Eve',
      principal: 'UGX 250,000',
      interestRate: loanSettings.interestRate,
      dueDate: '2025-05-01',
      daysUntilDue: 10,              // days from current date (2025-04-21)
      amountDue: 'UGX 256,250',      // principal + interest
      amountPaid: '',
      paymentMethod: '',
      status: 'Upcoming',            // appears under "Upcoming Due Loans"
      adminAction: 'Send Reminder',
    },
    {
      id: 'L002',
      vendor: { name: 'Eve', walletBalance: 'UGX 800,000' },
      guarantor: 'Noah',
      principal: 'UGX 500,000',
      interestRate: loanSettings.interestRate,
      dueDate: '2025-04-20',
      daysUntilDue: -1,             // was due yesterday
      amountDue: 'UGX 512,500',
      amountPaid: 'UGX 100,000',
      paymentMethod: 'MTN Mobile Money',
      status: 'Overdue',            // appears under "Overdue Loans"
      adminAction: 'Review',
    },
    {
      id: 'L003',
      vendor: { name: 'Abraham', walletBalance: 'UGX 300,000' },
      guarantor: 'Sarah',
      principal: 'UGX 150,000',
      interestRate: loanSettings.interestRate,
      dueDate: '2025-02-10',
      daysUntilDue: -70,            // long overdue
      amountDue: 'UGX 153,750',
      amountPaid: '',
      paymentMethod: '',
      status: 'Overdue',
      adminAction: 'Review',
    },
    // ...additional entries for pagination
  ];
  
  // Historical repayment records
  export const repaymentHistory = [
    {
      id: 'H001',
      vendor: { name: 'Noah', walletBalance: 'UGX 500,000' },
      loanId: 'LN1003',
      paidDate: '2025-03-14',
      amountPaid: 'UGX 307,500',
      paymentMethod: 'Visa',
      status: 'Paid',
    },
    {
      id: 'H002',
      vendor: { name: 'Eve', walletBalance: 'UGX 800,000' },
      loanId: 'LN1002',
      paidDate: '2025-04-15',
      amountPaid: 'UGX 100,000',
      paymentMethod: 'MTN Mobile Money',
      status: 'Paid',            // partially paid
    },
    {
      id: 'H003',
      vendor: { name: 'Sarah', walletBalance: 'UGX 600,000' },
      loanId: 'LN1005',
      paidDate: '2025-01-20',
      amountPaid: 'UGX 400,000',
      paymentMethod: 'Airtel Money',
      status: 'Paid',
    },
  ];