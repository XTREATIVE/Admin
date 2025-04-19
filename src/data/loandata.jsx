// src/data/loanDummyData.js

// Tabs for loan repayments UI
export const loanTabs = [
    'Upcoming Repayments',
    'Pending Repayments',
    'Repayment History',
    'Defaulted Loans',
  ];
  
  // Sample upcoming/pending/defaulted repayment blocks
  export const repaymentBlocks = [
    {
      id: 'L001',
      vendor: 'Vendor A',
      loanId: 'LN1001',
      dueDate: '2025-05-01',
      amountDue: 'UGX 250,000',
      amountPaid: '',
      paidDate: '',
      paymentMethod: '',
      status: 'Upcoming',
      action: 'Remind',
    },
    {
      id: 'L002',
      vendor: 'Vendor B',
      loanId: 'LN1002',
      dueDate: '2025-04-20',
      amountDue: 'UGX 500,000',
      amountPaid: 'UGX 100,000',
      paidDate: '2025-04-15',
      paymentMethod: 'Mobile Money',
      status: 'Pending',
      action: 'Confirm',
    },
    {
      id: 'L003',
      vendor: 'Vendor C',
      loanId: 'LN1003',
      dueDate: '2025-03-15',
      amountDue: 'UGX 300,000',
      amountPaid: 'UGX 300,000',
      paidDate: '2025-03-14',
      paymentMethod: 'Bank Transfer',
      status: 'Paid',
      action: 'View Receipt',
    },
    {
      id: 'L004',
      vendor: 'Vendor D',
      loanId: 'LN1004',
      dueDate: '2025-02-10',
      amountDue: 'UGX 150,000',
      amountPaid: '',
      paidDate: '',
      paymentMethod: '',
      status: 'Defaulted',
      action: 'Review',
    },
    // ...add as many entries as needed for pagination
  ];
  
  // Historical repayment records
  export const repaymentHistory = [
    {
      id: 'H001',
      vendor: 'Vendor C',
      loanId: 'LN1003',
      paidDate: '2025-03-14',
      amountPaid: 'UGX 300,000',
      paymentMethod: 'Bank Transfer',
      status: 'Paid',
    },
    {
      id: 'H002',
      vendor: 'Vendor B',
      loanId: 'LN1002',
      paidDate: '2025-04-15',
      amountPaid: 'UGX 100,000',
      paymentMethod: 'Mobile Money',
      status: 'Partial',
    },
    {
      id: 'H003',
      vendor: 'Vendor E',
      loanId: 'LN1005',
      paidDate: '2025-01-20',
      amountPaid: 'UGX 400,000',
      paymentMethod: 'Cash',
      status: 'Paid',
    },
  ];
  