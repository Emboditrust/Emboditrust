'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Building,
  Users,
  CheckCircle,
  Clock,
  RefreshCw,
  MoreHorizontal,
  Calendar,
  Eye,
  Trash2,
  QrCode,
  ChevronRight,
  Shield,
  TrendingUp,
  AlertTriangle,
  FileText,
  Package
} from "lucide-react";
import { toast } from "sonner";
import { HiUserGroup } from "react-icons/hi2";

interface Client {
  id: string;
  clientId: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  manufacturerId: string;
  brandPrefix: string;
  registrationNumber: string;
  registrationDate: string;
  status: 'active' | 'suspended' | 'inactive';
  contractStartDate: string;
  contractEndDate: string;
  monthlyLimit: number;
  codesGenerated: number;
  lastBatchDate?: string;
  logoUrl?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

interface VerificationStats {
  totalVerifications: number;
  validVerifications: number;
  invalidVerifications: number;
  uniqueProductsScanned: number;
  conversionRate: number;
  lastVerificationDate?: string;
}

interface VerificationAttempt {
  id: string;
  timestamp: string;
  scannedCode: string;
  scratchCode: string;
  result: 'scanned' | 'valid' | 'invalid' | 'already_used' | 'suspected_counterfeit';
  ipAddress: string;
  userAgent?: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [verificationStats, setVerificationStats] = useState<{[key: string]: VerificationStats}>({});
  const [verificationAttempts, setVerificationAttempts] = useState<{[key: string]: VerificationAttempt[]}>({});
  const [loadingVerifications, setLoadingVerifications] = useState<{[key: string]: boolean}>({});
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    manufacturerId: '',
    brandPrefix: 'EMB',
    registrationNumber: '',
    registrationDate: new Date().toISOString().split('T')[0],
    contractStartDate: new Date().toISOString().split('T')[0],
    contractEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    monthlyLimit: '10000',
    logoUrl: '',
    website: '',
    additionalInfo: '',
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/clients", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        const clientsData = data.clients || [];
        setClients(clientsData);
        
        // Fetch verification stats for each client
        clientsData.forEach((client:any) => {
          fetchClientVerificationStats(client.manufacturerId);
        });
      }
    } catch (error) {
      console.error("Failed to load clients");
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const fetchClientVerificationStats = async (manufacturerId: string) => {
    setLoadingVerifications(prev => ({ ...prev, [manufacturerId]: true }));
    try {
      const response = await fetch(`/api/admin/verifications/client/${manufacturerId}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setVerificationStats(prev => ({
          ...prev,
          [manufacturerId]: data.stats
        }));
      }
    } catch (error) {
      console.error(`Failed to load verification stats for ${manufacturerId}`, error);
    } finally {
      setLoadingVerifications(prev => ({ ...prev, [manufacturerId]: false }));
    }
  };

  const fetchClientVerificationAttempts = async (manufacturerId: string, clientName: string) => {
    setLoadingVerifications(prev => ({ ...prev, [`${manufacturerId}_attempts`]: true }));
    try {
      const response = await fetch(`/api/admin/verifications/client/${manufacturerId}/attempts?limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setVerificationAttempts(prev => ({
            ...prev,
            [manufacturerId]: data.attempts || []
          }));
          
          // Show verification attempts in a dialog
          const attemptsDialog = document.getElementById('verification-attempts-dialog') as HTMLDialogElement;
          if (attemptsDialog) {
            attemptsDialog.showModal();
          }
        }
      }
    } catch (error) {
      console.error(`Failed to load verification attempts for ${manufacturerId}`, error);
      toast.error(`Failed to load verification attempts for ${clientName}`);
    } finally {
      setLoadingVerifications(prev => ({ ...prev, [`${manufacturerId}_attempts`]: false }));
    }
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          monthlyLimit: Number(formData.monthlyLimit),
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Client created successfully');
        setAddDialogOpen(false);
        setFormData({
          companyName: '',
          contactPerson: '',
          email: '',
          phone: '',
          address: '',
          manufacturerId: '',
          brandPrefix: 'EMB',
          registrationNumber: '',
          registrationDate: new Date().toISOString().split('T')[0],
          contractStartDate: new Date().toISOString().split('T')[0],
          contractEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          monthlyLimit: '10000',
          logoUrl: '',
          website: '',
          additionalInfo: '',
        });
        fetchClients();
      } else {
        toast.error(result.message || 'Failed to create client');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleDelete = async () => {
    if (!selectedClient) return;

    try {
      const response = await fetch(`/api/admin/clients/${selectedClient.clientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        credentials: 'include',
      });

      if (response.ok) {
        toast.success(`Client ${selectedClient.companyName} deleted successfully`);
        setDeleteDialogOpen(false);
        setSelectedClient(null);
        fetchClients();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete client");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-teal-100 text-teal-800",
      suspended: "bg-yellow-100 text-yellow-800",
      inactive: "bg-yellow-100 text-yellow-800",
    };
    return styles[status as keyof typeof styles] || styles.inactive;
  };

  const getStatusText = (status: string) => {
    const texts = {
      active: 'Approved',
      suspended: 'Suspended',
      inactive: 'Trial'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getVerificationResultBadge = (result: string) => {
    const styles = {
      valid: "bg-green-100 text-green-800",
      invalid: "bg-red-100 text-red-800",
      scanned: "bg-blue-100 text-blue-800",
      already_used: "bg-yellow-100 text-yellow-800",
      suspected_counterfeit: "bg-orange-100 text-orange-800"
    };
    return styles[result as keyof typeof styles] || styles.scanned;
  };

  const getVerificationResultText = (result: string) => {
    const texts = {
      valid: 'Valid',
      invalid: 'Invalid',
      scanned: 'Scanned',
      already_used: 'Already Used',
      suspected_counterfeit: 'Counterfeit'
    };
    return texts[result as keyof typeof texts] || result;
  };

  const generateQRForClient = (clientId: string) => {
    router.push(`/admin/generate?clientId=${clientId}`);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = search === "" ||
      client.companyName.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase()) ||
      client.clientId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate aggregate stats
  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    trial: clients.filter(c => c.status === 'inactive').length,
    products: clients.reduce((sum, c) => sum + c.codesGenerated, 0),
    totalVerifications: Object.values(verificationStats).reduce((sum, stats) => sum + (stats?.totalVerifications || 0), 0),
    validVerifications: Object.values(verificationStats).reduce((sum, stats) => sum + (stats?.validVerifications || 0), 0),
  };

  // Get verification stats for a specific client
  const getClientVerificationStats = (manufacturerId: string) => {
    return verificationStats[manufacturerId] || {
      totalVerifications: 0,
      validVerifications: 0,
      invalidVerifications: 0,
      uniqueProductsScanned: 0,
      conversionRate: 0,
      lastVerificationDate: null
    };
  };

  // Get verification attempts for a specific client
  const getClientVerificationAttempts = (manufacturerId: string) => {
    return verificationAttempts[manufacturerId] || [];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="md:flex hidden items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage client accounts and verification tracking</p>
            </div>
            <div className="flex items-center gap-2">
              <img 
                src="https://github.com/shadcn.png" 
                alt="Admin User"
                className="w-8 h-8 rounded-full grayscale object-cover"
              />
              <span className="font-medium text-[14px] text-gray-900">Admin User</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Section */}
        <div className="mb-8">
          <div className="flex items-center  justify-between mb-6">
            <h2 className="text-xl font-semibold">Overview</h2>
            <div className="flex  items-center gap-3">
              <div className="relative md:block hidden">
                <Search className="absolute  left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search clients by name, email, or ID..."
                  className="pl-10 w-80"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button onClick={() => setAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                   <HiUserGroup className="h-10 w-10 text-blue-500 opacity-20" />
                  <div>
                    <p className="text-sm text-gray-500">Total Clients</p>
                    <p className="text-3xl font-bold mt-1">{stats.total}</p>
                    
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                      +{clients.filter(c => {
                        const monthAgo = new Date();
                        monthAgo.setMonth(monthAgo.getMonth() - 1);
                        return new Date(c.createdAt) > monthAgo;
                      }).length}
                    </p>
                 
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                   <Package className="h-10 w-10 text-purple-500 opacity-20" />
                  <div>
                    <p className="text-sm text-gray-500">Active Products</p>
                    <p className="text-3xl font-bold mt-1">{stats.products.toLocaleString()}</p>
                    
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                      +{Math.round(stats.products * 0.1).toLocaleString()}
                    </p>
                 
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                   <Clock className="h-10 w-10 text-yellow-500 opacity-20" />
                  <div>
                    <p className="text-sm text-gray-500">Trial Clients</p>
                    <p className="text-3xl font-bold mt-1">{stats.trial}</p>
                    
                  </div>
                  <p className="text-sm text-yellow-600 mt-1">
                      {stats.trial > 0 ? `${Math.round((stats.trial / stats.total) * 100)}% of total` : 'No trials'}
                    </p>
                 
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                   <Shield className="h-10 w-10 text-green-500 opacity-20" />
                  <div>
                    <p className="text-sm text-gray-500">Total Verifications</p>
                    <p className="text-3xl font-bold mt-1">{stats.totalVerifications.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        {stats.validVerifications.toLocaleString()} valid
                      </span>
                      <span className="text-xs text-gray-500">
                        {stats.totalVerifications > 0 ? 
                          Math.round((stats.validVerifications / stats.totalVerifications) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                 
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Clients Table */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Client</span>
                <span className="text-gray-400">▼</span>
              </div>
              <div className="flex items-center gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchClients}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Loading clients...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Client</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Mail</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Plan</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Products</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Verifications</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Conversion</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Joined</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Status</th>
                        <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClients.slice(0, 10).map((client) => {
                        const clientStats = getClientVerificationStats(client.manufacturerId);
                        const isLoading = loadingVerifications[client.manufacturerId];
                        
                        return (
                          <tr key={client.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium text-gray-900">{client.companyName}</div>
                                <div className="text-xs text-gray-500 font-mono">ID: {client.clientId}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600">{client.email}</td>
                            <td className="py-3 px-4">
                              <Badge className={
                                client.monthlyLimit >= 50000 ? "bg-purple-600 hover:bg-purple-700 text-white" : 
                                client.monthlyLimit >= 10000 ? "bg-pink-600 hover:bg-pink-700 text-white" : 
                                "bg-purple-600 hover:bg-purple-700 text-white"
                              }>
                                {client.monthlyLimit >= 50000 ? 'Enterprise' : 
                                 client.monthlyLimit >= 10000 ? 'Professional' : 'Starter'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-gray-900">
                              <div className="font-semibold">{client.codesGenerated.toLocaleString()}</div>
                              <div className="text-xs text-gray-500">of {client.monthlyLimit.toLocaleString()}</div>
                            </td>
                            <td className="py-3 px-4">
                              {isLoading ? (
                                <div className="flex items-center">
                                  <RefreshCw className="h-3 w-3 animate-spin mr-2 text-gray-400" />
                                  <span className="text-gray-400">Loading...</span>
                                </div>
                              ) : (
                                <div>
                                  <div className="font-semibold text-gray-900">
                                    {clientStats.totalVerifications.toLocaleString()}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {clientStats.validVerifications.toLocaleString()} valid
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {isLoading ? (
                                <div className="text-gray-400">...</div>
                              ) : (
                                <div className="flex items-center">
                                  <div className={`w-16 h-2 bg-gray-200 rounded-full overflow-hidden`}>
                                    <div 
                                      className={`h-full ${
                                        clientStats.conversionRate >= 70 ? 'bg-green-500' :
                                        clientStats.conversionRate >= 40 ? 'bg-yellow-500' :
                                        'bg-red-500'
                                      }`}
                                      style={{ width: `${Math.min(clientStats.conversionRate, 100)}%` }}
                                    />
                                  </div>
                                  <span className={`text-xs font-medium ml-2 ${
                                    clientStats.conversionRate >= 70 ? 'text-green-600' :
                                    clientStats.conversionRate >= 40 ? 'text-yellow-600' :
                                    'text-red-600'
                                  }`}>
                                    {clientStats.conversionRate}%
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4 text-teal-500" />
                                {formatDate(client.createdAt)}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={getStatusBadge(client.status)}>
                                {getStatusText(client.status)}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-56 p-0" align="end">
                                  <div className="py-1">
                                    <Link href={`/admin/clients/${client.clientId}`}>
                                      <Button
                                        variant="ghost"
                                        className="w-full justify-start px-3 py-2 text-sm font-normal hover:bg-gray-100"
                                      >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                      </Button>
                                    </Link>
                                    <Button
                                      variant="ghost"
                                      className="w-full justify-start px-3 py-2 text-sm font-normal hover:bg-gray-100"
                                      onClick={() => generateQRForClient(client.clientId)}
                                    >
                                      <QrCode className="h-4 w-4 mr-2" />
                                      Generate QR Codes
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      className="w-full justify-start px-3 py-2 text-sm font-normal hover:bg-gray-100"
                                      onClick={() => fetchClientVerificationAttempts(client.manufacturerId, client.companyName)}
                                      disabled={loadingVerifications[`${client.manufacturerId}_attempts`]}
                                    >
                                      <FileText className="h-4 w-4 mr-2" />
                                      View Verification Logs
                                    </Button>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <Button
                                      variant="ghost"
                                      className="w-full justify-start px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                                      onClick={() => {
                                        setSelectedClient(client);
                                        setDeleteDialogOpen(true);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Client
                                    </Button>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t">
                  <span className="text-sm text-gray-600">Showing {Math.min(10, filteredClients.length)} of {filteredClients.length}</span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0">←</Button>
                    <Button size="sm" className="w-8 h-8 p-0 bg-teal-500 hover:bg-teal-600 text-white">1</Button>
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0">2</Button>
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0">3</Button>
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0">4</Button>
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0">5</Button>
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0">→</Button>
                  </div>
                </div>

                {/* View All Link */}
                {filteredClients.length > 10 && (
                  <div className="flex justify-center mt-4">
                    <Link href="/admin/clients/all">
                      <Button variant="link" className="gap-1">
                        View All Clients
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Client Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Building className="h-6 w-6" />
              Add New Client
            </DialogTitle>
            <DialogDescription>
              Register a new pharmaceutical company for QR code generation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase">Company Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name *</label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    placeholder="e.g., EmbodiTrust Pharmaceuticals"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Brand Prefix (3 letters) *</label>
                  <Input
                    value={formData.brandPrefix}
                    onChange={(e) => setFormData({...formData, brandPrefix: e.target.value.toUpperCase().slice(0, 3)})}
                    placeholder="EMB"
                    className="uppercase font-mono"
                    maxLength={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Manufacturer ID *</label>
                  <Input
                    value={formData.manufacturerId}
                    onChange={(e) => setFormData({...formData, manufacturerId: e.target.value.toUpperCase()})}
                    placeholder="MFG-NG-2024-001"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Registration Number *</label>
                  <Input
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                    placeholder="NAFDAC-REG-12345"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Company Address *</label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Full company address"
                  rows={2}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact Person *</label>
                  <Input
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address *</label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    type="email"
                    placeholder="contact@company.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number *</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+234 800 000 0000"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Website (Optional)</label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    placeholder="https://company.com"
                  />
                </div>
              </div>
            </div>

            {/* Contract Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase">Contract Details</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Registration Date *</label>
                  <Input
                    value={formData.registrationDate}
                    onChange={(e) => setFormData({...formData, registrationDate: e.target.value})}
                    type="date"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Contract Start *</label>
                  <Input
                    value={formData.contractStartDate}
                    onChange={(e) => setFormData({...formData, contractStartDate: e.target.value})}
                    type="date"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Contract End *</label>
                  <Input
                    value={formData.contractEndDate}
                    onChange={(e) => setFormData({...formData, contractEndDate: e.target.value})}
                    type="date"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Monthly QR Code Limit *</label>
                <Input
                  value={formData.monthlyLimit}
                  onChange={(e) => setFormData({...formData, monthlyLimit: e.target.value})}
                  type="number"
                  min={100}
                  max={1000000}
                />
                <p className="text-xs text-gray-500">Maximum codes per month (100 - 1,000,000)</p>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
              Register Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete Client
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold">{selectedClient?.companyName}</span>?
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">Warning: This action cannot be undone</p>
                <p>
                  All data associated with this client will be permanently deleted from the system.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedClient(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verification Attempts Dialog */}
      <Dialog>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-6 w-6" />
              Verification Attempts
              {selectedClient && (
                <span className="text-sm font-normal text-gray-500"> - {selectedClient.companyName}</span>
              )}
            </DialogTitle>
            <DialogDescription>
              Recent verification activity for this client's products
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedClient && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Attempts</p>
                      <p className="text-2xl font-bold">
                        {getClientVerificationStats(selectedClient.manufacturerId).totalVerifications.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Valid Verifications</p>
                      <p className="text-2xl font-bold text-green-600">
                        {getClientVerificationStats(selectedClient.manufacturerId).validVerifications.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Unique Products</p>
                      <p className="text-2xl font-bold">
                        {getClientVerificationStats(selectedClient.manufacturerId).uniqueProductsScanned.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Conversion Rate</p>
                      <p className="text-2xl font-bold">
                        {getClientVerificationStats(selectedClient.manufacturerId).conversionRate}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Recent Verification Attempts</h3>
                      <span className="text-sm text-gray-500">
                        Last updated: {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="divide-y">
                    {loadingVerifications[`${selectedClient.manufacturerId}_attempts`] ? (
                      <div className="py-8 text-center">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">Loading verification attempts...</p>
                      </div>
                    ) : getClientVerificationAttempts(selectedClient.manufacturerId).length > 0 ? (
                      getClientVerificationAttempts(selectedClient.manufacturerId).map((attempt, index) => (
                        <div key={index} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <Badge className={getVerificationResultBadge(attempt.result)}>
                                  {getVerificationResultText(attempt.result)}
                                </Badge>
                                <span className="text-sm text-gray-500 font-mono">
                                  {attempt.scannedCode?.substring(0, 20)}...
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                <div className="flex items-center gap-4">
                                  <span>Scratch: {attempt.scratchCode || 'N/A'}</span>
                                  <span>•</span>
                                  <span>IP: {attempt.ipAddress}</span>
                                </div>
                                {attempt.userAgent && (
                                  <div className="mt-1 text-xs text-gray-500 truncate">
                                    {attempt.userAgent.substring(0, 80)}...
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right text-sm text-gray-500 ml-4">
                              <div>{formatDateTime(attempt.timestamp)}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center">
                        <AlertTriangle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No verification attempts found</p>
                        <p className="text-sm text-gray-400 mt-1">This client's products haven't been scanned yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              const dialog = document.getElementById('verification-attempts-dialog') as HTMLDialogElement;
              if (dialog) dialog.close();
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}