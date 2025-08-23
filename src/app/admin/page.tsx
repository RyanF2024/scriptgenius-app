import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Activity, FileText, Shield } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const stats = [
    {
      title: 'Users',
      value: '1,234',
      description: 'Total registered users',
      icon: Users,
      link: '/admin/users',
    },
    {
      title: 'Active Sessions',
      value: '42',
      description: 'Currently active users',
      icon: Activity,
      link: '/admin/monitoring',
    },
    {
      title: 'Reports',
      value: '7',
      description: 'New reports to review',
      icon: FileText,
      link: '/admin/reports',
    },
    {
      title: 'Moderation',
      value: '3',
      description: 'Items pending review',
      icon: Shield,
      link: '/admin/moderation',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your ScriptGenius administration
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link href={stat.link} key={stat.title} className="group">
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Activity items will be populated dynamically */}
              <div className="text-sm text-muted-foreground">
                No recent activity
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Status</span>
                <span className="inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <span className="inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Storage</span>
                <span className="text-sm text-muted-foreground">75% used</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
