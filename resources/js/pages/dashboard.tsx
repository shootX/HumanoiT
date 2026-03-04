import React, { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/page-template';
import { 
  RefreshCw, BarChart3, Download, Users, Activity, UserPlus, DollarSign,
  FolderOpen, CheckSquare, Clock, Receipt, FileText, Building2,
  TrendingUp, AlertTriangle, Calendar, Target, Wallet, CreditCard, Ticket, X,
  Settings as SettingsIcon, Globe, Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils/currency';
import { Link, useForm } from '@inertiajs/react';

interface DashboardData {
  cards: Array<{
    title: string;
    value: number;
    format?: string;
    icon?: string;
  }>;
  projects?: {
    total: number;
    active: number;
    completed: number;
    overdue: number;
  };
  tasks?: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
  budgets?: {
    totalBudget: number;
    spent: number;
    remaining: number;
    utilization: number;
  };
  expenses?: {
    total: number;
    pending: number;
    approved: number;
    pendingAmount?: number;
    approvedAmount?: number;
  };
  invoices?: {
    total: number;
    paid: number;
    pending: number;
    overdue: number;
    paidAmount?: number;
    pendingAmount?: number;
    overdueAmount?: number;
  };
  upcomingDeadlines?: Array<{
    id: number;
    title: string;
    deadline: string;
    deadlineFormatted: string;
    daysLeft: number;
    status: string;
    progress: number;
  }>;
  topProjects?: Array<{
    id: number;
    title: string;
    progress: number;
    status: string;
    deadline?: string;
  }>;
  workspaceMembers?: number;
  recentActivities?: Array<{
    id: number;
    type: string;
    description: string;
    user: string;
    time: string;
  }>;
}

interface PageAction {
  label: string;
  icon: React.ReactNode;
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  onClick: () => void;
}

export default function Dashboard({ dashboardData, isSuperAdmin, isSaasMode = true, hasRoleDashboardAccess = false }: { dashboardData: DashboardData; isSuperAdmin?: boolean; isSaasMode?: boolean; hasRoleDashboardAccess?: boolean }) {
  const { t } = useTranslation();
  
  // If super admin, render super admin dashboard
  if (isSuperAdmin) {
    return (
      <PageTemplate 
        title={t('Dashboard')}
        url="/dashboard"
        actions={[
          {
            label: t('Refresh'),
            icon: <RefreshCw className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => window.location.reload()
          }
        ]}
      >
        <div className="space-y-6">
          {/* Main Stats Cards */}
          <div className={`grid gap-4 ${isSaasMode ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
            <Card className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('Total Companies')}</p>
                    <h3 className="mt-2 text-3xl font-bold">{(dashboardData?.cards?.[0]?.value ?? 0).toLocaleString()}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dashboardData?.companies?.active ?? 0} {t('active')}, {dashboardData?.companies?.inactive ?? 0} {t('inactive')}
                    </p>
                  </div>
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-3">
                    <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {!isSaasMode && (
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('Total Projects')}</p>
                      <h3 className="mt-2 text-3xl font-bold">{(dashboardData?.projects?.total ?? 0).toLocaleString()}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dashboardData?.projects?.active ?? 0} {t('active projects')}
                      </p>
                    </div>
                    <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
                      <FolderOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {!isSaasMode && (
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('System Users')}</p>
                      <h3 className="mt-2 text-3xl font-bold">{(dashboardData?.users?.total ?? 0).toLocaleString()}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('Across all companies')}
                      </p>
                    </div>
                    <div className="rounded-full bg-purple-100 dark:bg-purple-900/20 p-3">
                      <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {isSaasMode && (
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('Total Plans')}</p>
                      <h3 className="mt-2 text-3xl font-bold">{(dashboardData?.cards?.[1]?.value ?? 0).toLocaleString()}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dashboardData?.plans?.active ?? 0} {t('active')}, {dashboardData?.plans?.inactive ?? 0} {t('inactive')}
                      </p>
                    </div>
                    <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
                      <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {isSaasMode && (
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('Plan Orders')}</p>
                      <h3 className="mt-2 text-3xl font-bold">{(dashboardData?.cards?.[2]?.value ?? 0).toLocaleString()}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dashboardData?.planOrders?.pending ?? 0} {t('pending approvals')}
                      </p>
                    </div>
                    <div className="rounded-full bg-purple-100 dark:bg-purple-900/20 p-3">
                      <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {isSaasMode && (
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('Total Revenue')}</p>
                      <h3 className="mt-2 text-3xl font-bold">{formatCurrency(dashboardData?.cards?.[3]?.value ?? 0)}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatCurrency(dashboardData?.revenue?.monthly ?? 0)} {t('this month')}
                      </p>
                    </div>
                    <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/20 p-3">
                      <DollarSign className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Module Cards */}
          {isSaasMode ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4" />
                    {t('Plan Orders')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('Pending')}</span>
                    <Badge variant={(dashboardData?.planOrders?.pending ?? 0) > 0 ? "destructive" : "secondary"}>
                      {dashboardData?.planOrders?.pending ?? 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('Approved')}</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      {dashboardData?.planOrders?.approved ?? 0}
                    </Badge>
                  </div>
                  <Link href={route('plan-orders.index')} className="block">
                    <div className="text-xs text-primary hover:underline mt-2">{t('Manage Orders')} →</div>
                  </Link>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-4 w-4" />
                    {t('Plan Requests')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('Pending')}</span>
                    <Badge variant={(dashboardData?.planRequests?.pending ?? 0) > 0 ? "destructive" : "secondary"}>
                      {dashboardData?.planRequests?.pending ?? 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('Approved')}</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      {dashboardData?.planRequests?.approved ?? 0}
                    </Badge>
                  </div>
                  <Link href={route('plan-requests.index')} className="block">
                    <div className="text-xs text-primary hover:underline mt-2">{t('Manage Requests')} →</div>
                  </Link>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Ticket className="h-4 w-4" />
                    {t('Coupons')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('Active')}</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      {dashboardData?.coupons?.active ?? 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('Total')}</span>
                    <span className="font-semibold">{dashboardData?.coupons?.total ?? 0}</span>
                  </div>
                  <Link href={route('coupons.index')} className="block">
                    <div className="text-xs text-primary hover:underline mt-2">{t('Manage Coupons')} →</div>
                  </Link>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <SettingsIcon className="h-4 w-4" />
                    {t('System Management')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('Companies')}</span>
                    <Badge variant="secondary">
                      {dashboardData?.companies?.total ?? 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('Active')}</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      {dashboardData?.companies?.active ?? 0}
                    </Badge>
                  </div>
                  <Link href={route('companies.index')} className="block">
                    <div className="text-xs text-primary hover:underline mt-2">{t('Manage Companies')} →</div>
                  </Link>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <DollarSign className="h-4 w-4" />
                    {t('Currencies')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('Available')}</span>
                    <Badge variant="secondary">
                      {dashboardData?.currencies?.total ?? 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('Default')}</span>
                    <span className="font-semibold">{dashboardData?.currencies?.default ?? 'USD'}</span>
                  </div>
                  <Link href={route('currencies.index')} className="block">
                    <div className="text-xs text-primary hover:underline mt-2">{t('Manage Currencies')} →</div>
                  </Link>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Globe className="h-4 w-4" />
                    {t('Landing Page')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('Status')}</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      {t('Active')}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('Custom Pages')}</span>
                    <span className="font-semibold">{dashboardData?.customPages?.total ?? 0}</span>
                  </div>
                  <Link href={route('landing-page')} className="block">
                    <div className="text-xs text-primary hover:underline mt-2">{t('Manage Landing Page')} →</div>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* System Overview Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {t('System Overview')}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {t('Live Data')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('Companies')}</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 rounded-lg bg-green-50 dark:bg-green-900/10">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                            <span className="text-sm font-medium">{t('Active Companies')}</span>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            {dashboardData?.companies?.active ?? 0}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg bg-red-50 dark:bg-red-900/10">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                            <span className="text-sm font-medium">{t('Inactive Companies')}</span>
                          </div>
                          <Badge variant={(dashboardData?.companies?.inactive ?? 0) > 0 ? "destructive" : "secondary"}>
                            {dashboardData?.companies?.inactive ?? 0}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {!isSaasMode && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('System Activity')}</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/10">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full" />
                              <span className="text-sm font-medium">{t('Total Projects')}</span>
                            </div>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                              {dashboardData?.projects?.total ?? 0}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-purple-50 dark:bg-purple-900/10">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-purple-500 rounded-full" />
                              <span className="text-sm font-medium">{t('System Users')}</span>
                            </div>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                              {dashboardData?.users?.total ?? 0}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {isSaasMode && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('Plans & Orders')}</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/10">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full" />
                              <span className="text-sm font-medium">{t('Total Plans')}</span>
                            </div>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                              {dashboardData?.plans?.total ?? 0}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-purple-50 dark:bg-purple-900/10">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-purple-500 rounded-full" />
                              <span className="text-sm font-medium">{t('Approved Orders')}</span>
                            </div>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                              {dashboardData?.planOrders?.approved ?? 0}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {isSaasMode && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('Most Bought Plan')}</h4>
                        <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
                          {dashboardData?.mostBoughtPlan ? (
                            <>
                              <p className="font-semibold text-blue-900 dark:text-blue-100">{dashboardData.mostBoughtPlan.name}</p>
                              <p className="text-sm text-blue-700 dark:text-blue-300">{dashboardData.mostBoughtPlan.count} {t('orders')}</p>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">{t('No data available')}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('Most Used Coupon')}</h4>
                        <div className="p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10">
                          {dashboardData?.mostUsedCoupon ? (
                            <>
                              <p className="font-semibold text-green-900 dark:text-green-100">{dashboardData.mostUsedCoupon.name}</p>
                              <p className="text-sm text-green-700 dark:text-green-300">{dashboardData.mostUsedCoupon.code} • {dashboardData.mostUsedCoupon.count} {t('uses')}</p>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">{t('No data available')}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-3 pt-2 border-t">
                    <Link href={route('companies.index')} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                      <Building2 className="h-3 w-3" />
                      {t('Manage Companies')}
                    </Link>
                    {isSaasMode && (
                      <Link href={route('plans.index')} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                        <CreditCard className="h-3 w-3" />
                        {t('Manage Plans')}
                      </Link>
                    )}
                    {isSaasMode && (
                      <Link href={route('plans.create')} className="inline-flex items-center gap-1 text-sm text-green-600 hover:underline">
                        <Target className="h-3 w-3" />
                        {t('Create Plan')}
                      </Link>
                    )}
                    {!isSaasMode && (
                      <Link href={route('settings')} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                        <SettingsIcon className="h-3 w-3" />
                        {t('System Settings')}
                      </Link>
                    )}
                    {!isSaasMode && (
                      <Link href={route('currencies.index')} className="inline-flex items-center gap-1 text-sm text-green-600 hover:underline">
                        <DollarSign className="h-3 w-3" />
                        {t('Manage Currencies')}
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    {t('Recent Activities')}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {t('Live')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {(dashboardData?.recentActivities ?? []).length > 0 ? (dashboardData?.recentActivities ?? []).map((activity: any, index: number) => {
                    const getActivityIcon = (type: string) => {
                      switch (type) {
                        case 'plan_order':
                          return <FileText className="h-4 w-4 text-blue-500" />;
                        case 'plan_request':
                          return <Clock className="h-4 w-4 text-yellow-500" />;
                        case 'company_registration':
                          return <Building2 className="h-4 w-4 text-green-500" />;
                        default:
                          return <Activity className="h-4 w-4 text-gray-500" />;
                      }
                    };
                    
                    const getActivityColor = (type: string) => {
                      switch (type) {
                        case 'plan_order':
                          return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
                        case 'plan_request':
                          return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
                        case 'company_registration':
                          return 'border-l-green-500 bg-green-50 dark:bg-green-900/10';
                        default:
                          return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/10';
                      }
                    };
                    
                    return (
                      <div key={activity.id} className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${getActivityColor(activity.type)} transition-all hover:shadow-sm`}>
                        <div className="flex-shrink-0 mt-0.5">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-5 mb-1">{activity.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {activity.user}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {activity.time}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {activity.type?.replace('_', ' ')}
                        </Badge>
                      </div>
                    );
                  }) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{t('No recent activities')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          

        </div>
      </PageTemplate>
    );
  }

  const pageActions: PageAction[] = [
    {
      label: t('Refresh'),
      icon: <RefreshCw className="h-4 w-4" />,
      variant: 'outline',
      onClick: () => window.location.reload()
    }
  ];

  // Use actual data from backend
  const budgets = dashboardData?.budgets || { totalBudget: 0, spent: 0, remaining: 0, utilization: 0 };
  const recentActivities = dashboardData?.recentActivities || [];
  const upcomingDeadlines = dashboardData?.upcomingDeadlines || [];
  const topProjects = dashboardData?.topProjects || [];

  return (
    <PageTemplate 
      title={t('Dashboard')}
      url="/dashboard"
      actions={pageActions}
    >
      <div className="space-y-6 min-h-screen relative">
        {/* Soft gradient background */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
        {/* Main Stats Cards - Dynamically rendered based on backend */}
        {dashboardData?.cards && dashboardData.cards.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {dashboardData.cards.map((card: any, index: number) => {
              const getCardIcon = (title: string) => {
                if (title?.includes('Branch') || title?.includes('Project')) return <FolderOpen className="h-6 w-6 text-green-600 dark:text-green-400" />;
                if (title?.includes('Task')) return <CheckSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />;
                if (title?.includes('Invoice')) return <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />;
                if (title?.includes('Paid') || title?.includes('Amount') || title?.includes('Revenue')) return <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />;
                if (title?.includes('Pending') || title?.includes('Progress')) return <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />;
                if (title?.includes('Expense')) return <Receipt className="h-6 w-6 text-orange-600 dark:text-orange-400" />;
                if (title?.includes('Wallet')) return <Wallet className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />;
                return <Activity className="h-6 w-6 text-gray-600 dark:text-gray-400" />;
              };
              const getCardColor = (title: string) => {
                if (title?.includes('Branch') || title?.includes('Project')) return 'bg-green-100 dark:bg-green-900/20';
                if (title?.includes('Task')) return 'bg-purple-100 dark:bg-purple-900/20';
                if (title?.includes('Invoice')) return 'bg-indigo-100 dark:bg-indigo-900/20';
                if (title?.includes('Paid') || title?.includes('Amount')) return 'bg-emerald-100 dark:bg-emerald-900/20';
                if (title?.includes('Pending') || title?.includes('Progress')) return 'bg-amber-100 dark:bg-amber-900/20';
                if (title?.includes('Expense')) return 'bg-orange-100 dark:bg-orange-900/20';
                return 'bg-gray-100 dark:bg-gray-900/20';
              };
              return (
                <Card key={index} className="overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-card to-card/80 shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-muted-foreground truncate">{t(card.title)}</p>
                        <h3 className="mt-1 text-2xl font-bold">
                          {card.format === 'currency' ? formatCurrency(card.value) : card.value.toLocaleString()}
                        </h3>
                      </div>
                      <div className={`rounded-full flex-shrink-0 ${getCardColor(card.title)} p-2.5`}>
                        {getCardIcon(card.title)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Secondary Stats Grid - Detailed Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Workspace Members */}
          {(dashboardData?.workspaceMembers ?? 0) > 0 && (
            <Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Users className="h-4 w-4" />
                  {t('Team Members')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{dashboardData.workspaceMembers}</p>
                <Link href={route('workspaces.index')} className="text-xs text-primary hover:underline mt-1 block">{t('Manage Workspace')} →</Link>
              </CardContent>
            </Card>
          )}
          {/* Budget Overview */}
          {dashboardData?.budgets && (budgets.totalBudget > 0 || budgets.spent > 0) && (
            <Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Wallet className="h-4 w-4" />
                  {t('Budget Overview')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('Utilization')}</span>
                  <span className="font-medium">{budgets.utilization}%</span>
                </div>
                <Progress value={Math.min(budgets.utilization, 100)} className="h-2" />
                <div className="grid grid-cols-2 gap-2 text-sm pt-1">
                  <div>
                    <span className="text-muted-foreground">{t('Spent')}</span>
                    <p className="font-semibold">{formatCurrency(budgets.spent)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('Remaining')}</span>
                    <p className="font-semibold text-green-600">{formatCurrency(budgets.remaining)}</p>
                  </div>
                </div>
                <Link href={route('budgets.dashboard')} className="text-xs text-primary hover:underline block mt-1">{t('View Budgets')} →</Link>
              </CardContent>
            </Card>
          )}
          {/* Expense Details */}
          {dashboardData?.expenses && (
            <Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Receipt className="h-4 w-4" />
                  {t('Expenses')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('Approved')}</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">{dashboardData.expenses.approved}</Badge>
                </div>
                <p className="font-semibold">{formatCurrency(dashboardData.expenses.approvedAmount ?? 0)}</p>
                <div className="flex justify-between text-sm pt-1">
                  <span>{t('Pending')}</span>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">{dashboardData.expenses.pending}</Badge>
                </div>
                <p className="font-semibold text-amber-600">{formatCurrency(dashboardData.expenses.pendingAmount ?? 0)}</p>
                <Link href={route('expenses.index')} className="text-xs text-primary hover:underline block mt-1">{t('View Expenses')} →</Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Upcoming Deadlines - full width when present */}
        {upcomingDeadlines.length > 0 && (
          <Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-5 w-5" />
                {t('Upcoming Deadlines')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {upcomingDeadlines.map((item: any) => (
                  <Link key={item.id} href={route('projects.show', item.id)} className="block p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm truncate flex-1">{item.title}</p>
                      <Badge variant={item.daysLeft <= 3 ? "destructive" : "secondary"} className="ml-2 flex-shrink-0">
                        {item.daysLeft} {t('days')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {item.deadlineFormatted}
                      <span>•</span>
                      <span>{item.progress}%</span>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href={route('projects.index')} className="text-xs text-primary hover:underline block mt-3">{t('View All Projects')} →</Link>
            </CardContent>
          </Card>
        )}

        {/* Top Projects & Recent Activities - side by side */}
        <div className="grid gap-6 md:grid-cols-2">
          {topProjects.length > 0 && (
            <Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-5 w-5" />
                  {t('Branches with Most Tasks')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topProjects.map((item: any) => (
                    <Link key={item.id} href={route('projects.show', item.id)} className="block p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-sm truncate flex-1">{item.title}</p>
                        <span className="font-semibold text-green-600 ml-2">{item.tasksCount ?? 0} {t('tasks')}</span>
                      </div>
                      {item.deadline && <p className="text-xs text-muted-foreground mt-1">{item.deadline}</p>}
                    </Link>
                  ))}
                </div>
                <Link href={route('projects.index')} className="text-xs text-primary hover:underline block mt-3">{t('View All Projects')} →</Link>
              </CardContent>
            </Card>
          )}
          <Card className={`rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-300 ${topProjects.length === 0 ? 'md:col-span-2' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {t('Recent Activities')}
                </div>
                <Badge variant="outline" className="text-xs">
                  {t('Live')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recentActivities.map((activity, index) => {
                  const getActivityIcon = (type: string) => {
                    switch (type) {
                      case 'task':
                        return <CheckSquare className="h-4 w-4 text-blue-500" />;
                      case 'project':
                        return <FolderOpen className="h-4 w-4 text-green-500" />;
                      case 'expense':
                        return <Receipt className="h-4 w-4 text-yellow-500" />;
                      case 'invoice':
                        return <FileText className="h-4 w-4 text-purple-500" />;
                      default:
                        return <Activity className="h-4 w-4 text-gray-500" />;
                    }
                  };
                  
                  const getActivityColor = (type: string) => {
                    switch (type) {
                      case 'task':
                        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
                      case 'project':
                        return 'border-l-green-500 bg-green-50 dark:bg-green-900/10';
                      case 'expense':
                        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
                      case 'invoice':
                        return 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/10';
                      default:
                        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/10';
                    }
                  };
                  
                  return (
                    <div key={activity.id} className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${getActivityColor(activity.type)} transition-all hover:shadow-sm`}>
                      <div className="flex-shrink-0 mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-5 mb-1">{activity.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {activity.user}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {activity.time}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {activity.type}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t('Quick Actions')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Link href={route('projects.index')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm">
                    <FolderOpen className="h-4 w-4" />
                    {t('View Projects')}
                  </Link>
                  <Link href={route('tasks.index')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm">
                    <CheckSquare className="h-4 w-4" />
                    {t('View Tasks')}
                  </Link>
                  {dashboardData?.expenses && (
                    <Link href={route('expenses.create')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm">
                      <Receipt className="h-4 w-4" />
                      {t('Submit Expense')}
                    </Link>
                  )}
                  {hasRoleDashboardAccess && (
                    <Link href={route('roles.index')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm">
                      <Shield className="h-4 w-4" />
                      {t('Workspace Roles')}
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
      </div>
    </PageTemplate>
  );
}