
import React, { forwardRef } from "react";
import { Transaction } from "@/contexts/AppContext";
import { formatIDR } from "@/utils/currencyFormatter";
import { formatTransactionDate } from "@/utils/receiptUtils";

interface ReceiptProps {
  transaction: Transaction;
  workshopName?: string;
  workshopAddress?: string;
  workshopPhone?: string;
}

const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(
  ({ transaction, workshopName = "Bengkel POS", workshopAddress = "Jl. Workshop No. 123", workshopPhone = "0812-3456-7890" }, ref) => {
    return (
      <div ref={ref} className="bg-white p-6 max-w-md mx-auto">
        <div className="text-center border-b pb-4">
          <h3 className="text-xl font-bold">{workshopName}</h3>
          <p className="text-sm text-muted-foreground">{workshopAddress}</p>
          <p className="text-sm text-muted-foreground">{workshopPhone}</p>
          <p className="text-sm mt-2">
            Receipt #{transaction.id}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatTransactionDate(transaction.date)}
          </p>
        </div>
              
        <div className="mt-4">
          <p><strong>Customer:</strong> {transaction.customerName || 'Walk-in Customer'}</p>
        </div>
              
        <div className="border-t border-b py-4 mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1 text-sm">Item</th>
                <th className="text-right py-1 text-sm">Price</th>
                <th className="text-right py-1 text-sm">Qty</th>
                <th className="text-right py-1 text-sm">Total</th>
              </tr>
            </thead>
            <tbody>
              {transaction.items.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="py-1 text-sm">{item.name}</td>
                  <td className="text-right py-1 text-sm currency">{formatIDR(item.price)}</td>
                  <td className="text-right py-1 text-sm">{item.quantity}</td>
                  <td className="text-right py-1 text-sm currency">{formatIDR(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
              
        <div className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="currency">{formatIDR(transaction.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span className="currency">{formatIDR(transaction.tax)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount:</span>
            <span className="currency">{formatIDR(transaction.discount)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total:</span>
            <span className="currency">{formatIDR(transaction.total)}</span>
          </div>
        </div>
              
        <div className="text-center text-muted-foreground text-sm pt-4 mt-4 border-t">
          <p>Thank you for your business!</p>
          <p className="mt-1">Please come again!</p>
        </div>
      </div>
    );
  }
);

Receipt.displayName = "Receipt";

export { Receipt };
