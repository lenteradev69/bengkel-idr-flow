
import { Transaction } from "@/contexts/AppContext";
import { formatIDR } from "./currencyFormatter";

// Function to print a receipt
export const printReceipt = (receiptRef: React.RefObject<HTMLDivElement>) => {
  if (!receiptRef.current) return;
  
  const originalContents = document.body.innerHTML;
  const printContent = receiptRef.current.innerHTML;
  
  document.body.innerHTML = printContent;
  window.print();
  document.body.innerHTML = originalContents;
  
  // Re-add event listeners that might have been removed
  window.location.reload();
};

// Function to download receipt as PDF
export const downloadReceiptAsPDF = async (
  receiptRef: React.RefObject<HTMLDivElement>,
  transaction: Transaction
) => {
  if (!receiptRef.current) return;
  
  try {
    // We're using this approach since we don't want to add external PDF libraries
    const receiptElement = receiptRef.current;
    
    // Create a new window for printing to PDF
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window');
    }
    
    // Apply styling in the new window
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt #${transaction.id}</title>
          <style>
            body {
              font-family: sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .receipt-container {
              border: 1px solid #e5e7eb;
              padding: 20px;
              border-radius: 8px;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .mt-4 { margin-top: 1rem; }
            .pt-4 { padding-top: 1rem; }
            .border-t { border-top: 1px solid #e5e7eb; }
            .border-b { border-bottom: 1px solid #e5e7eb; }
            .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
            .font-bold { font-weight: bold; }
            .text-lg { font-size: 1.125rem; }
            .text-gray-500 { color: #6b7280; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; border-bottom: 1px solid #e5e7eb; }
            .text-sm { font-size: 0.875rem; }
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            ${receiptElement.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
};

// Format a transaction date for display
export const formatTransactionDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};
