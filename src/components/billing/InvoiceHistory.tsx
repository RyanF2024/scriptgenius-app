'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export interface Invoice {
  id: string;
  number: string;
  amount_paid: number;
  currency: string;
  status: string;
  created: number;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  subscription_plan?: string;
  billing_reason?: string;
}

export function InvoiceHistory() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async (pageNumber: number = 1, append: boolean = false) => {
    try {
      if (pageNumber === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      const response = await fetch(`/api/billing/invoices?page=${pageNumber}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      
      const data = await response.json();
      
      if (append) {
        setInvoices(prev => [...prev, ...data.invoices]);
      } else {
        setInvoices(data.invoices);
      }
      
      setHasMore(data.has_more);
      setError(null);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Failed to load invoices. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchInvoices(1, false);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchInvoices(nextPage, true);
  };

  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Convert from cents to dollars
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>;
      case 'open':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Open</Badge>;
      case 'void':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">Void</Badge>;
      case 'uncollectible':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Uncollectible</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getBillingReasonLabel = (reason: string) => {
    const reasons: Record<string, string> = {
      subscription_cycle: 'Subscription Renewal',
      subscription_create: 'New Subscription',
      subscription_update: 'Subscription Update',
      subscription: 'Subscription',
      manual: 'Manual Invoice',
      upcoming: 'Upcoming',
    };
    return reasons[reason] || reason.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading && invoices.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48 mb-4" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your past invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Icons.alertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h3 className="mt-2 text-lg font-medium">Failed to load invoices</h3>
            <p className="mb-4 text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={() => fetchInvoices(1, false)}>
              <Icons.refreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>View your past invoices and payments</CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed p-8 text-center">
            <Icons.receipt className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">No invoices found</h3>
            <p className="mb-4 text-muted-foreground">
              Your billing history will appear here
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {format(new Date(invoice.created * 1000), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {invoice.billing_reason ? getBillingReasonLabel(invoice.billing_reason) : 'Invoice'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.number || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(invoice.amount_paid, invoice.currency)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(invoice.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {invoice.hosted_invoice_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(invoice.hosted_invoice_url || '#', '_blank')}
                              className="h-8"
                            >
                              <Icons.externalLink className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          )}
                          {invoice.invoice_pdf && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(invoice.invoice_pdf || '#', '_blank')}
                              className="h-8"
                            >
                              <Icons.download className="h-4 w-4 mr-2" />
                              PDF
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {hasMore && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
