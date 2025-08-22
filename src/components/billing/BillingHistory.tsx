'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Icons } from '@/components/icons';

interface BillingHistoryItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'succeeded' | 'pending' | 'failed';
  invoiceUrl?: string;
}

export function BillingHistory() {
  const { data: session } = useSession();
  const [history, setHistory] = useState<BillingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    if (session) {
      fetchBillingHistory();
    }
  }, [session, page]);

  const fetchBillingHistory = async () => {
    try {
      const loading = page === 1 ? setIsLoading : setIsLoadingMore;
      loading(true);
      
      const response = await fetch(`/api/billing/history?page=${page}&limit=${pageSize}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch billing history');
      }
      
      const data = await response.json();
      
      if (page === 1) {
        setHistory(data);
      } else {
        setHistory(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === pageSize);
    } catch (error) {
      console.error('Error fetching billing history:', error);
      toast.error('Failed to load billing history');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100); // Convert from cents to dollars
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      succeeded: {
        label: 'Paid',
        className: 'bg-green-100 text-green-800',
      },
      pending: {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-800',
      },
      failed: {
        label: 'Failed',
        className: 'bg-red-100 text-red-800',
      },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, className: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your payment history and download invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-4 border rounded-lg">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>View your payment history and download invoices.</CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8">
            <Icons.receipt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No billing history</h3>
            <p className="mt-1 text-sm text-gray-500">Your billing history will appear here when you make a payment.</p>
          </div>
        ) : (
          <div className="overflow-hidden border rounded-lg">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(item.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.description}
                    </TableCell>
                    <TableCell>{formatCurrency(item.amount)}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right">
                      {item.invoiceUrl && (
                        <a
                          href={item.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {hasMore && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={isLoadingMore}
              className="w-full sm:w-auto"
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
      </CardContent>
    </Card>
  );
}
