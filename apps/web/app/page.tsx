'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';
import LeadsByStagesChart from '@/components/charts/LeadsByStagesChart';
import RevenueDonutChart from '@/components/charts/RevenueDonutChart';
import LeadsOverTimeChart from '@/components/charts/LeadsOverTimeChart';
import MyTasksPanel from '@/components/dashboard/MyTasksPanel';
import {
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [leadsByStages, setLeadsByStages] = useState<any[]>([]);
  const [revenueBySource, setRevenueBySource] = useState<any[]>([]);
  const [revenueByType, setRevenueByType] = useState<any[]>([]);
  const [leadsOverTime, setLeadsOverTime] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, stagesRes, sourceRes, typeRes, timeRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/analytics/leads-by-stages'),
        api.get('/analytics/revenue-by-source'),
        api.get('/analytics/revenue-by-type'),
        api.get('/analytics/leads-over-time'),
      ]);

      setStats(statsRes.data);
      setLeadsByStages(stagesRes.data);
      setRevenueBySource(sourceRes.data.map((item: any) => ({ name: item.source, value: item.revenue })));
      setRevenueByType(typeRes.data.map((item: any) => ({ name: item.type, value: item.revenue })));
      setLeadsOverTime(timeRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600 dark:text-slate-400">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              Welcome back! Here's what's happening with your CRM.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => router.push('/leads/new')}
            className="flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Quick Add
          </Button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Won Revenue"
            value={`$${stats?.wonRevenue?.toLocaleString() || 0}`}
            icon={<CurrencyDollarIcon className="h-8 w-8 text-green-600" />}
            trend="up"
            trendValue="12.5%"
            bgColor="bg-green-50"
          />
          <MetricCard
            title="Lost Revenue"
            value={`$${stats?.lostRevenue?.toLocaleString() || 0}`}
            icon={<CurrencyDollarIcon className="h-8 w-8 text-red-600" />}
            trend="down"
            trendValue="3.2%"
            bgColor="bg-red-50"
          />
          <MetricCard
            title="Average Lead Value"
            value={`$${stats?.avgLeadValue?.toFixed(2) || 0}`}
            icon={<CurrencyDollarIcon className="h-8 w-8 text-blue-600" />}
            bgColor="bg-blue-50"
          />
          <MetricCard
            title="Total Leads"
            value={stats?.totalLeads || 0}
            icon={<UserGroupIcon className="h-8 w-8 text-purple-600" />}
            bgColor="bg-purple-50"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Avg Leads Per Day"
            value={stats?.avgLeadsPerDay?.toFixed(1) || 0}
            icon={<ArrowTrendingUpIcon className="h-8 w-8 text-indigo-600" />}
            bgColor="bg-indigo-50"
          />
          <MetricCard
            title="Total Quotations"
            value={stats?.totalQuotes || 0}
            icon={<DocumentTextIcon className="h-8 w-8 text-orange-600" />}
            bgColor="bg-orange-50"
          />
          <MetricCard
            title="Total Contacts"
            value={`${stats?.totalPersons || 0} / ${stats?.totalOrganizations || 0}`}
            subtitle="Persons / Organizations"
            icon={<UserGroupIcon className="h-8 w-8 text-teal-600" />}
            bgColor="bg-teal-50"
          />
        </div>

        {/* My Tasks Panel */}
        <div className="grid grid-cols-1 gap-6">
          <MyTasksPanel />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Open Leads By Stages">
            {leadsByStages.length > 0 ? (
              <LeadsByStagesChart data={leadsByStages} />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500 dark:text-slate-500 dark:text-slate-400">
                No data available
              </div>
            )}
          </Card>

          <Card title="Revenue By Sources">
            {revenueBySource.length > 0 ? (
              <RevenueDonutChart data={revenueBySource} title="" />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500 dark:text-slate-500 dark:text-slate-400">
                No data available
              </div>
            )}
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Revenue By Types">
            {revenueByType.length > 0 ? (
              <RevenueDonutChart data={revenueByType} title="" />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500 dark:text-slate-500 dark:text-slate-400">
                No data available
              </div>
            )}
          </Card>

          <Card title="Leads Over Time">
            {leadsOverTime.length > 0 ? (
              <LeadsOverTimeChart data={leadsOverTime} />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500 dark:text-slate-500 dark:text-slate-400">
                No data available
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionButton
              label="Add Lead"
              onClick={() => router.push('/leads/new')}
            />
            <QuickActionButton
              label="Add Deal"
              onClick={() => router.push('/deals/new')}
            />
            <QuickActionButton
              label="Add Contact"
              onClick={() => router.push('/persons/new')}
            />
            <QuickActionButton
              label="Create Quote"
              onClick={() => router.push('/quotes/new')}
            />
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  bgColor = 'bg-gray-50',
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  trendValue?: string;
  bgColor?: string;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-slate-400 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-500 dark:text-slate-500 dark:text-slate-400">{subtitle}</p>}
          {trend && trendValue && (
            <div className="mt-2 flex items-center">
              {trend === 'up' ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>{icon}</div>
      </div>
    </Card>
  );
}

function QuickActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-4 text-center border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 dark:hover:border-blue-400 transition-colors"
    >
      <PlusIcon className="h-6 w-6 mx-auto text-gray-400 dark:text-slate-400 dark:text-slate-500 mb-2" />
      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{label}</span>
    </button>
  );
}
