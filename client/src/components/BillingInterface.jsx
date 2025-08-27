import React from "react"; 
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, RotateCcw, FileText, ShoppingCart } from "lucide-react";

export default function BillingInterface({
  billItems,
  totalAmount,
  isLoading,
  onRemoveItem,
  onResetBill,
  onGenerateInvoice,
  customerPhone,
  onCustomerPhoneChange,
}) {
  if (isLoading) {
    return (
      <Card className="shadow-sm border border-gray-100">
        <CardContent className="p-6 flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-gray-100">
      {/* Billing Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900" data-testid="text-billing-title">
            Current Bill
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-primary" data-testid="text-total-amount">
                ₹{totalAmount.toFixed(2)}
              </p>
            </div>
            <Button 
              onClick={onResetBill}
              variant="outline"
              className="text-error border-error hover:bg-red-50"
              data-testid="button-reset-bill"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>
      
      {/* Billing Table */}
      <div className="overflow-x-auto">
        {billItems.length === 0 ? (
          <div className="px-6 py-12 text-center" data-testid="empty-bill-state">
            <div className="text-gray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4" />
              <p className="text-lg">No items in bill</p>
              <p className="text-sm">Use voice commands to add items</p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-left">Item</TableHead>
                <TableHead className="text-left">Quantity</TableHead>
                <TableHead className="text-left">Rate</TableHead>
                <TableHead className="text-left">Amount</TableHead>
                <TableHead className="text-left">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50" data-testid={`row-item-${item.id}`}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      <span className="font-medium text-gray-900">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-700">{item.quantity}</TableCell>
                  <TableCell className="text-gray-700">₹{item.rate.toFixed(2)}/unit</TableCell>
                  <TableCell className="font-semibold text-gray-900">₹{item.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => onRemoveItem(item.id)}
                      variant="ghost"
                      size="sm"
                      className="text-error hover:text-red-700 hover:bg-red-50"
                      data-testid={`button-remove-${item.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      
      {/* Billing Actions */}
      <div className="p-6 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Customer Info */}
          <div className="flex-1 w-full sm:w-auto">
            <Label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-2">
              Customer Phone
            </Label>
            <Input
              id="customerPhone"
              type="tel"
              value={customerPhone}
              onChange={(e) => onCustomerPhoneChange(e.target.value)}
              placeholder="Enter phone number"
              className="w-full"
              data-testid="input-customer-phone"
            />
          </div>
          
          {/* Generate Invoice Button */}
          <div className="w-full sm:w-auto">
            <Button
              onClick={onGenerateInvoice}
              className="w-full sm:w-auto bg-primary hover:bg-blue-700 text-white shadow-lg"
              data-testid="button-generate-invoice"
            >
              <FileText className="w-4 h-4 mr-2" />
              Generate Invoice
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
