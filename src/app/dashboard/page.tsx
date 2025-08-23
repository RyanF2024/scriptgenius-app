'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/loading/PageLoading';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, FileText, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';


export default function DashboardPage() {
  const { user, signOut, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { data, isLoading, error } = useDashboardData();

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [signOut]);


  if (isAuthLoading) {
    return <PageLoading />;
  }

  if (!isAuthLoading && !user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button 
          variant="outline" 
          onClick={handleSignOut}
          disabled={isLoading}
        >
          Sign Out
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{data?.totalProjects ?? 0}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{data?.activeProjects ?? 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="text-destructive">
            Failed to load recent activity. Please try again later.
          </div>
        ) : (
          <div className="space-y-4">
            {data?.recentActivity?.slice(0, 5).map((activity) => (
              <Card key={activity.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.type}
                      </p>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
