// app/admin/batches/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Search,
  Filter,
  Download,
  Eye,
  QrCode,
  Package,
  Building,
  Calendar,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Printer,
  Copy,
  FileText,
  Clock,
  Shield,
  Users,
  FileDown,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface Batch {
  batchId: string;
  clientId: string;
  companyName: string;
  productName: string;
  quantity: number;
  generated: number;
  verified: number;
  suspicious: number;
  createdAt: string;
  status: 'active' | 'completed' | 'suspended';
  brandPrefix: string;
  manufacturerId: string;
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/batches');
      const data = await response.json();
      if (data.success) {
        setBatches(data.batches || []);
      } else {
        toast.error("Failed to load batches");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const safeFormatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      
      // Format the date consistently
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = search === "" || 
      batch.batchId.toLowerCase().includes(search.toLowerCase()) ||
      batch.companyName.toLowerCase().includes(search.toLowerCase()) ||
      batch.productName.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || batch.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "completed": return "bg-blue-100 text-blue-800 border-blue-200";
      case "suspended": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-3 w-3" />;
      case "completed": return <CheckCircle className="h-3 w-3" />;
      case "suspended": return <AlertTriangle className="h-3 w-3" />;
      default: return <AlertTriangle className="h-3 w-3" />;
    }
  };

  const exportBatchesCSV = () => {
    if (filteredBatches.length === 0) {
      toast.error("No batches to export");
      return;
    }

    const csvRows = [
      ['Batch ID', 'Company', 'Product', 'Quantity', 'Verified', 'Suspicious', 'Status', 'Created Date'],
      ...filteredBatches.map(batch => [
        batch.batchId,
        batch.companyName,
        batch.productName,
        batch.quantity,
        batch.verified,
        batch.suspicious,
        batch.status,
        safeFormatDate(batch.createdAt)
      ])
    ];

    const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batches-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success("Batches exported successfully");
  };

  // Don't render table on server to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="text-gray-500 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR Code Batches</h1>
          <p className="text-gray-500">View all generated QR code batches across all clients</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={exportBatchesCSV}
            className="gap-2"
          >
            <FileDown className="h-4 w-4" />
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={fetchBatches}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Link href="/admin/clients">
            <Button className="gap-2">
              <Users className="h-4 w-4" />
              Manage Clients
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Batches</p>
                <p className="text-2xl font-bold">{batches.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-100" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <p className="text-2xl font-bold">
                  {batches.reduce((sum, batch) => sum + batch.quantity, 0).toLocaleString()}
                </p>
              </div>
              <QrCode className="h-8 w-8 text-green-100" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Verified</p>
                <p className="text-2xl font-bold text-green-600">
                  {batches.reduce((sum, batch) => sum + batch.verified, 0).toLocaleString()}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-100" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Suspicious</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {batches.reduce((sum, batch) => sum + batch.suspicious, 0)}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Batches</CardTitle>
          <CardDescription>Search and filter batches by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search batches by ID, company, or product..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Batches Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Batches</CardTitle>
          <CardDescription>
            View and manage all QR code batches generated in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="text-gray-500 mt-2">Loading batches...</p>
            </div>
          ) : filteredBatches.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {batches.length === 0 ? "No batches yet" : "No batches found"}
              </h3>
              <p className="text-gray-500 mb-6">
                {batches.length === 0 
                  ? "No QR code batches have been generated yet. Generate your first batch from the Clients page."
                  : "No batches match your search criteria"
                }
              </p>
              {batches.length === 0 && (
                <Link href="/admin/clients">
                  <Button className="gap-2">
                    <Users className="h-4 w-4" />
                    Go to Clients
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Batch ID</TableHead>
                    <TableHead className="font-semibold">Company</TableHead>
                    <TableHead className="font-semibold">Product</TableHead>
                    <TableHead className="font-semibold">Quantity</TableHead>
                    <TableHead className="font-semibold">Verification Rate</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBatches.map((batch) => {
                    const verificationRate = batch.quantity > 0 
                      ? Math.round((batch.verified / batch.quantity) * 100)
                      : 0;
                    
                    return (
                      <TableRow key={batch.batchId} className="hover:bg-gray-50/50">
                        <TableCell className="font-mono text-sm">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-blue-500" />
                            <span className="truncate max-w-[120px]">{batch.batchId}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium">{batch.companyName}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                {batch.brandPrefix}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            <div className="font-medium truncate">{batch.productName}</div>
                            <div className="text-xs text-gray-500">ID: {batch.manufacturerId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                              {batch.quantity.toLocaleString()}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{verificationRate}%</span>
                              <span className="text-xs text-gray-500">
                                ({batch.verified}/{batch.quantity})
                              </span>
                            </div>
                            <Progress 
                              value={verificationRate} 
                              className="h-2"
                            />
                            {batch.suspicious > 0 && (
                              <div className="text-xs text-yellow-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {batch.suspicious} suspicious
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`${getStatusColor(batch.status)} gap-1 capitalize`}
                          >
                            {getStatusIcon(batch.status)}
                            {batch.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {safeFormatDate(batch.createdAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination would go here */}
          {filteredBatches.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing {filteredBatches.length} of {batches.length} batches
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  1
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}