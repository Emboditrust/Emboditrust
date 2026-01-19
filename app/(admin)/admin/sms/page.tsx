'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  MessageSquare,
  Phone,
  Globe,
  Shield,
  Download,
  Search,
  Filter,
  Calendar,
  BarChart3,
  RefreshCw,
  Eye,
  FileText,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowUpDown,
  PhoneCall,
  Smartphone,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Copy,
  ExternalLink,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';

interface SMSVerification {
  id: string;
  sessionId: string;
  phoneNumber: string;
  formattedPhone: string;
  countryCode: string;
  carrier: string;
  network: string;
  verificationResult: string;
  smsStatus: string;
  messageId?: string;
  smsCost: number;
  productName?: string;
  companyName?: string;
  batchId?: string;
  manufacturerId?: string;
  verificationCount?: number;
  isFirstVerification?: boolean;
  ipAddress: string;
  createdAt: string;
  completedAt: string;
  attempts: number;
}

interface SMSStats {
  total: number;
  today: number;
  valid: number;
  invalid: number;
  already_used: number;
  failed: number;
  totalCost: number;
  costToday: number;
  byCarrier: Record<string, number>;
  byCountry: Record<string, number>;
  byHour: Record<string, number>;
  byResult: Record<string, number>;
}

interface TermiiBalance {
  balance: number;
  currency: string;
  lastUpdated: string;
}

export default function SMSAdminPage() {
  const router = useRouter();
  const [verifications, setVerifications] = useState<SMSVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SMSStats | null>(null);
  const [balance, setBalance] = useState<TermiiBalance | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  const [selectedVerification, setSelectedVerification] = useState<SMSVerification | null>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [sendTestDialog, setSendTestDialog] = useState(false);
  const [testSMS, setTestSMS] = useState({
    phoneNumber: '',
    message: 'SCRATCH TESTCODE123'
  });
  const [sendingTest, setSendingTest] = useState(false);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 50;

  useEffect(() => {
    fetchVerifications();
    fetchStats();
    fetchBalance();
  }, [page, dateRange, statusFilter, resultFilter, sortField, sortOrder]);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        dateRange,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(resultFilter !== 'all' && { result: resultFilter }),
        ...(search && { search }),
        sortBy: sortField,
        sortOrder
      });

      const response = await fetch(`/api/admin/sms/verifications?${params}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setVerifications(data.verifications || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        toast.error('Failed to load verifications');
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/admin/sms/stats?dateRange=${dateRange}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/admin/sms/balance', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const exportCSV = () => {
    if (verifications.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = [
      'Session ID',
      'Phone Number',
      'Country',
      'Carrier',
      'Result',
      'SMS Status',
      'Product Name',
      'Company',
      'Batch ID',
      'Manufacturer ID',
      'Verification Count',
      'First Verification',
      'SMS Cost',
      'IP Address',
      'Created At',
      'Completed At',
      'Attempts'
    ];

    const rows = verifications.map(v => [
      v.sessionId,
      v.formattedPhone,
      v.countryCode,
      v.carrier,
      v.verificationResult,
      v.smsStatus,
      v.productName || 'N/A',
      v.companyName || 'N/A',
      v.batchId || 'N/A',
      v.manufacturerId || 'N/A',
      v.verificationCount?.toString() || '0',
      v.isFirstVerification ? 'Yes' : 'No',
      `₦${v.smsCost.toFixed(2)}`,
      v.ipAddress,
      new Date(v.createdAt).toISOString(),
      new Date(v.completedAt).toISOString(),
      v.attempts.toString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sms-verifications-${dateRange}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('CSV exported successfully');
  };

  const sendTestSMS = async () => {
    if (!testSMS.phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    if (!testSMS.message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSendingTest(true);
    try {
      const response = await fetch('/api/admin/sms/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(testSMS)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Test SMS sent successfully', {
          description: `Message ID: ${data.messageId}`
        });
        setTestSMS({ phoneNumber: '', message: 'SCRATCH TESTCODE123' });
        setSendTestDialog(false);
      } else {
        toast.error('Failed to send test SMS', {
          description: data.error || 'Unknown error'
        });
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setSendingTest(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'delivered': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'failed': return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'valid': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'invalid': return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'already_used': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'failed': return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'valid': return <CheckCircle className="h-3 w-3" />;
      case 'invalid': return <XCircle className="h-3 w-3" />;
      case 'already_used': return <AlertTriangle className="h-3 w-3" />;
      default: return null;
    }
  };

  const maskPhone = (phone: string) => {
    if (phone.length <= 10) return phone;
    return phone.replace(/(\d{4})\d+(\d{3})/, '$1****$2');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SMS Verification Dashboard</h1>
          <p className="text-gray-500">
            Monitor SMS and USSD product verifications
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={fetchVerifications} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={exportCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => setSendTestDialog(true)} variant="secondary" className="gap-2">
            <Phone className="h-4 w-4" />
            Test SMS
          </Button>
        </div>
      </div>

      {/* Stats and Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Balance Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Termii Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {balance ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Current Balance</p>
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(balance.balance)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-sm text-gray-500">
                  Last updated: {new Date(balance.lastUpdated).toLocaleString()}
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Low Balance Alert</p>
                      <p className="text-xs text-yellow-700">
                        Alert when below ₦10,000
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {stats && (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Today</p>
                    <p className="text-2xl font-bold">{stats.today.toLocaleString()}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Total: {stats.total.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Successful</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.valid.toLocaleString()}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {stats.total > 0 ? Math.round((stats.valid / stats.total) * 100) : 0}% success rate
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Today's Cost</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(stats.costToday)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-500" />
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Total: {formatCurrency(stats.totalCost)}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="verifications" className="mb-8">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="verifications" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Verifications
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Shield className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Verifications Tab */}
        <TabsContent value="verifications">
          <Card>
            <CardHeader>
              <CardTitle>Verification Logs</CardTitle>
              <CardDescription>
                All SMS and USSD verification attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Phone, Session ID, Product..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="status">SMS Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="result">Verification Result</Label>
                  <Select value={resultFilter} onValueChange={setResultFilter}>
                    <SelectTrigger id="result">
                      <SelectValue placeholder="All Results" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Results</SelectItem>
                      <SelectItem value="valid">Valid</SelectItem>
                      <SelectItem value="invalid">Invalid</SelectItem>
                      <SelectItem value="already_used">Already Used</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dateRange">Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger id="dateRange">
                      <SelectValue placeholder="Today" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Clear Filters Button */}
              <div className="flex justify-end mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('all');
                    setResultFilter('all');
                    setDateRange('today');
                    setPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              </div>

              {/* Table */}
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading verifications...</p>
                </div>
              ) : verifications.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No verifications found
                  </h3>
                  <p className="text-gray-500">Try changing your filters or date range</p>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="cursor-pointer" onClick={() => handleSort('createdAt')}>
                            <div className="flex items-center gap-1">
                              Date & Time
                              <ArrowUpDown className="h-3 w-3" />
                            </div>
                          </TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Carrier</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSort('verificationResult')}>
                            <div className="flex items-center gap-1">
                              Result
                              <ArrowUpDown className="h-3 w-3" />
                            </div>
                          </TableHead>
                          <TableHead>SMS Status</TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSort('smsCost')}>
                            <div className="flex items-center gap-1">
                              Cost
                              <ArrowUpDown className="h-3 w-3" />
                            </div>
                          </TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {verifications.map((verification) => (
                          <TableRow key={verification.id}>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(verification.createdAt).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(verification.createdAt).toLocaleTimeString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{maskPhone(verification.formattedPhone)}</div>
                              <Badge variant="outline" className="text-xs mt-1">
                                <Globe className="h-2 w-2 mr-1" />
                                {verification.countryCode}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{verification.carrier || 'Unknown'}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[200px] truncate">
                                {verification.productName || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {verification.batchId || 'No batch'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getResultColor(verification.verificationResult)} gap-1`}>
                                {getResultIcon(verification.verificationResult)}
                                {verification.verificationResult.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(verification.smsStatus)}>
                                {verification.smsStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{formatCurrency(verification.smsCost)}</div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedVerification(verification);
                                  setViewDialog(true);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-500">
                        Page {page} of {totalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(prev => Math.max(1, prev - 1))}
                          disabled={page === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={page === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Carrier Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Carrier Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.byCarrier).map(([carrier, count]) => (
                      <div key={carrier} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span>{carrier}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{count.toLocaleString()}</span>
                          <span className="text-sm text-gray-500">
                            ({Math.round((count / stats.total) * 100)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Result Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Verification Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.byResult).map(([result, count]) => (
                      <div key={result} className="flex items-center justify-between">
                        <Badge className={getResultColor(result)}>
                          {result.replace('_', ' ')}
                        </Badge>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{count.toLocaleString()}</span>
                          <span className="text-sm text-gray-500">
                            ({Math.round((count / stats.total) * 100)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Termii Configuration</CardTitle>
              <CardDescription>
                SMS and USSD service settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="shortcode">SMS Shortcode</Label>
                  <div className="flex gap-2 mt-1">
                    <Input id="shortcode" value={process.env.TERMII_SHORTCODE || '34568'} readOnly />
                    <Button variant="outline" onClick={() => navigator.clipboard.writeText(process.env.TERMII_SHORTCODE || '34568')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Send SMS to this number
                  </p>
                </div>

                <div>
                  <Label htmlFor="ussd">USSD Code</Label>
                  <div className="flex gap-2 mt-1">
                    <Input id="ussd" value={process.env.TERMII_USSD_CODE || '*347*758#'} readOnly />
                    <Button variant="outline" onClick={() => navigator.clipboard.writeText(process.env.TERMII_USSD_CODE || '*347*758#')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Dial this code for USSD
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <Label>Webhook URLs</Label>
                <div className="space-y-3 mt-2">
                  <div>
                    <Label htmlFor="sms-webhook" className="text-sm">SMS Webhook</Label>
                    <div className="flex gap-2 mt-1">
                      <Input 
                        id="sms-webhook" 
                        value={`${process.env.NEXTAUTH_URL || 'https://emboditrust.com'}/api/termii/sms`} 
                        readOnly 
                      />
                      <Button variant="outline" onClick={() => navigator.clipboard.writeText(`${process.env.NEXTAUTH_URL || 'https://emboditrust.com'}/api/termii/sms`)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ussd-webhook" className="text-sm">USSD Webhook</Label>
                    <div className="flex gap-2 mt-1">
                      <Input 
                        id="ussd-webhook" 
                        value={`${process.env.NEXTAUTH_URL || 'https://emboditrust.com'}/api/termii/ussd`} 
                        readOnly 
                      />
                      <Button variant="outline" onClick={() => navigator.clipboard.writeText(`${process.env.NEXTAUTH_URL || 'https://emboditrust.com'}/api/termii/ussd`)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label>Support Information</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="support-phone" className="text-sm">Support Phone</Label>
                    <Input id="support-phone" value="0800-EMBODI (362634)" readOnly />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp" className="text-sm">WhatsApp</Label>
                    <Input id="whatsapp" value="+234 908 700 0247" readOnly />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Verification Dialog */}
      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Verification Details</DialogTitle>
            <DialogDescription>
              Session ID: {selectedVerification?.sessionId}
            </DialogDescription>
          </DialogHeader>

          {selectedVerification && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium">{selectedVerification.formattedPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Carrier</p>
                  <p className="font-medium">{selectedVerification.carrier || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Country</p>
                  <Badge variant="outline">{selectedVerification.countryCode}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">IP Address</p>
                  <code className="text-sm">{selectedVerification.ipAddress}</code>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Verification Result</h4>
                <div className="flex items-center gap-3">
                  <Badge className={`${getResultColor(selectedVerification.verificationResult)} gap-1`}>
                    {getResultIcon(selectedVerification.verificationResult)}
                    {selectedVerification.verificationResult.replace('_', ' ')}
                  </Badge>
                  <Badge className={getStatusColor(selectedVerification.smsStatus)}>
                    SMS: {selectedVerification.smsStatus}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">SMS Cost</p>
                  <p className="font-medium">{formatCurrency(selectedVerification.smsCost)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Message ID</p>
                  <code className="text-xs block truncate">{selectedVerification.messageId || 'N/A'}</code>
                </div>
              </div>

              {selectedVerification.productName && (
                <>
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold mb-2">Product Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Product Name</p>
                        <p className="font-medium">{selectedVerification.productName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Company</p>
                        <p className="font-medium">{selectedVerification.companyName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Batch ID</p>
                        <code className="text-sm">{selectedVerification.batchId}</code>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Verification Count</p>
                        <p className="font-medium">{selectedVerification.verificationCount}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p>{new Date(selectedVerification.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completed At</p>
                  <p>{new Date(selectedVerification.completedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Test SMS Dialog */}
      <Dialog open={sendTestDialog} onOpenChange={setSendTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test SMS</DialogTitle>
            <DialogDescription>
              Test SMS delivery to any phone number
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="test-phone">Phone Number</Label>
              <Input
                id="test-phone"
                placeholder="+2348012345678 or 08012345678"
                value={testSMS.phoneNumber}
                onChange={(e) => setTestSMS({...testSMS, phoneNumber: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="test-message">Message</Label>
              <Textarea
                id="test-message"
                placeholder="Enter message to send"
                value={testSMS.message}
                onChange={(e) => setTestSMS({...testSMS, message: e.target.value})}
                rows={3}
              />
              <p className="text-sm text-gray-500 mt-1">
                For product verification, use: SCRATCH TESTCODE123
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSendTestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={sendTestSMS} disabled={sendingTest} className="gap-2">
              {sendingTest ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4" />
                  Send Test SMS
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}