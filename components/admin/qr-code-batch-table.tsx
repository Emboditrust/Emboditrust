"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Trash2,
  AlertTriangle,
  Calendar,
  Package,
  Building,
  Copy,
  CheckCircle,
  QrCode,
  Key,
  Printer,
  FileText,
  BarChart3,
  RefreshCw,
  ExternalLink,
  Users,
  MapPin,
  Shield,
} from "lucide-react";

// Mock data for demonstration
const mockBatches = [
  {
    batchId: "BATCH-2024-001",
    productName: "Paracetamol 500mg Tablets",
    companyName: "EmbodiTrust Pharmaceuticals",
    manufacturerId: "MFG-NG-2024-001",
    quantity: 1000,
    createdAt: new Date("2024-01-15"),
    status: "active",
    verifiedCount: 245,
    suspiciousCount: 12,
    codesGenerated: 1000,
    brandPrefix: "EMB",
    lastVerification: new Date("2024-02-20"),
    verificationRate: 24.5,
    locations: ["Nigeria", "Ghana", "Cameroon"],
    sampleCodes: [
      { qrCodeId: "QR1234567890", scratchCode: "ABC-123-XYZ-456", qrCodeImage: "/placeholder-qr.png" },
      { qrCodeId: "QR1234567891", scratchCode: "DEF-456-GHI-789", qrCodeImage: "/placeholder-qr.png" },
      { qrCodeId: "QR1234567892", scratchCode: "JKL-789-MNO-012", qrCodeImage: "/placeholder-qr.png" },
    ]
  },
  {
    batchId: "BATCH-2024-002",
    productName: "Amoxicillin 250mg Capsules",
    companyName: "GlaxoSmithKline Nigeria",
    manufacturerId: "MFG-NG-2024-002",
    quantity: 5000,
    createdAt: new Date("2024-01-20"),
    status: "printed",
    verifiedCount: 1890,
    suspiciousCount: 8,
    codesGenerated: 5000,
    brandPrefix: "GSK",
    lastVerification: new Date("2024-02-25"),
    verificationRate: 37.8,
    locations: ["Nigeria", "South Africa", "Kenya"],
    sampleCodes: [
      { qrCodeId: "QR2234567890", scratchCode: "PQR-123-STU-456", qrCodeImage: "/placeholder-qr.png" },
      { qrCodeId: "QR2234567891", scratchCode: "VWX-456-YZA-789", qrCodeImage: "/placeholder-qr.png" },
    ]
  },
  {
    batchId: "BATCH-2024-003",
    productName: "Vitamin C 1000mg Tablets",
    companyName: "Fidson Healthcare",
    manufacturerId: "MFG-NG-2024-003",
    quantity: 2500,
    createdAt: new Date("2024-02-01"),
    status: "shipped",
    verifiedCount: 1250,
    suspiciousCount: 5,
    codesGenerated: 2500,
    brandPrefix: "FID",
    lastVerification: new Date("2024-02-28"),
    verificationRate: 50.0,
    locations: ["Nigeria", "Togo", "Benin"],
    sampleCodes: [
      { qrCodeId: "QR3234567890", scratchCode: "BCD-123-EFG-456", qrCodeImage: "/placeholder-qr.png" },
    ]
  },
];

export default function QRCodeBatchTable() {
  const [batches, setBatches] = useState(mockBatches);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewBatch, setViewBatch] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch = 
      batch.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.manufacturerId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || batch.status === statusFilter;
    
    const matchesDate = dateFilter === "all" || 
      (dateFilter === "today" && 
        format(new Date(batch.createdAt), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")) ||
      (dateFilter === "week" && 
        new Date(batch.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === "month" && 
        new Date(batch.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredBatches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBatches = filteredBatches.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = async () => {
    if (selectedBatch) {
      try {
        // API call would go here
        setBatches(prev => prev.filter(b => b.batchId !== selectedBatch.batchId));
        toast.success(`Batch ${selectedBatch.batchId} deleted successfully`, {
          description: "All associated codes have been removed from the system"
        });
        setDeleteDialogOpen(false);
        setSelectedBatch(null);
      } catch (error) {
        toast.error("Failed to delete batch");
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const viewBatchDetails = (batch: any) => {
    setViewBatch(batch);
    setViewDialogOpen(true);
  };

  const downloadBatchCSV = (batch: any) => {
    toast.info(`Downloading CSV for batch: ${batch.batchId}`, {
      description: "Preparing file for download..."
    });
    
    // Simulate CSV generation
    const csvContent = `Batch ID,Product Name,Company,Manufacturer ID,Quantity,Status,Verified Count,Suspicious Count,Verification Rate\n${batch.batchId},${batch.productName},${batch.companyName},${batch.manufacturerId},${batch.quantity},${batch.status},${batch.verifiedCount},${batch.suspiciousCount},${batch.verificationRate}%`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-details-${batch.batchId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const printBatchLabels = (batch: any) => {
    toast.info(`Printing labels for batch: ${batch.batchId}`, {
      description: "Opening print preview..."
    });
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>QR Code Labels - ${batch.batchId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .label { 
              display: inline-block; 
              width: 2.5in; 
              height: 1.5in; 
              border: 1px solid #ccc; 
              margin: 0.1in; 
              padding: 10px; 
              text-align: center; 
              page-break-inside: avoid;
            }
            .qr-code { width: 80px; height: 80px; margin: 0 auto 5px; }
            .code { font-family: monospace; font-size: 10px; margin: 2px 0; }
            @media print {
              .page-break { page-break-after: always; }
            }
          </style>
        </head>
        <body>
          <h2>QR Code Labels - ${batch.batchId}</h2>
          <p>${batch.productName} • ${batch.companyName}</p>
          <div>
            ${batch.sampleCodes?.map((code: any, i: number) => `
              <div class="label">
                <div class="qr-code">
                  <img src="${code.qrCodeImage || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIGZpbGw9IiNmNWY1ZjUiLz48dGV4dCB4PSI0MCIgeT0iNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UVJ7JEkraX08L3RleHQ+PC9zdmc+'}" alt="QR Code" style="width:100%;height:100%;">
                </div>
                <div class="code">QR: ${code.qrCodeId}</div>
                <div class="code">Scratch: ${code.scratchCode}</div>
                <div style="font-size: 8px; color: #666; margin-top: 3px;">
                  ${batch.productName}<br>
                  Batch: ${batch.batchId}
                </div>
              </div>
              ${(i + 1) % 6 === 0 ? '<div class="page-break"></div>' : ''}
            `).join('') || '<p>No sample codes available</p>'}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 1000);
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const refreshBatches = () => {
    toast.info("Refreshing batch data...");
    // In production, this would fetch from API
  };

  const exportAllBatches = () => {
    toast.info("Exporting all batches to CSV...", {
      description: "This may take a moment"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "printed": return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped": return "bg-purple-100 text-purple-800 border-purple-200";
      case "archived": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-3 w-3" />;
      case "printed": return <Printer className="h-3 w-3" />;
      case "shipped": return <Package className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code Batches
              </CardTitle>
              <CardDescription>
                Manage batches of QR + Scratch code pairs for pharmaceutical products
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search batches..."
                  className="pl-9 w-full sm:w-[200px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="printed">Printed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[120px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={refreshBatches}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Batch Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                      {batches.reduce((sum, batch) => sum + batch.verifiedCount, 0).toLocaleString()}
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
                      {batches.reduce((sum, batch) => sum + batch.suspiciousCount, 0)}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-100" />
                </div>
              </CardContent>
            </Card>
          </div>

          {paginatedBatches.length === 0 ? (
            <div className="text-center py-12">
              <QrCode className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No batches found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {batches.length === 0
                  ? "No QR code batches have been generated yet. Create your first batch above."
                  : "No batches match your search criteria."}
              </p>
              {batches.length === 0 && (
                <Button className="mt-4" onClick={() => window.location.hash = 'generate'}>
                  Create First Batch
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Batch ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verification Rate</TableHead>
                      <TableHead>Date Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBatches.map((batch) => (
                      <TableRow key={batch.batchId} className="hover:bg-gray-50/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                <QrCode className="h-4 w-4 text-blue-600" />
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-sm">{batch.batchId}</div>
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
                            <Building className="h-4 w-4 text-gray-500" />
                            <span className="truncate max-w-[150px]">
                              {batch.companyName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                              {batch.quantity.toLocaleString()}
                            </Badge>
                            <div className="text-xs text-gray-500">
                              {batch.verifiedCount} verified
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(batch.status)} flex items-center gap-1 capitalize`}
                          >
                            {getStatusIcon(batch.status)}
                            {batch.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{batch.verificationRate}%</span>
                              <span className="text-gray-500">{batch.verifiedCount}/{batch.quantity}</span>
                            </div>
                            <Progress value={batch.verificationRate} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div>
                              <div className="text-sm">
                                {format(new Date(batch.createdAt), "MMM d, yyyy")}
                              </div>
                              <div className="text-xs text-gray-500">
                                Last verify: {format(new Date(batch.lastVerification), "MMM d")}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => viewBatchDetails(batch)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => downloadBatchCSV(batch)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download CSV
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => printBatchLabels(batch)}>
                                <Printer className="h-4 w-4 mr-2" />
                                Print Labels
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => copyToClipboard(batch.batchId)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Batch ID
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-yellow-600">
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Flag Issues
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedBatch(batch);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Batch
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredBatches.length)} of {filteredBatches.length} batches
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink 
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(pageNum);
                              }}
                              isActive={currentPage === pageNum}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      {totalPages > 5 && (
                        <PaginationItem>
                          <span className="px-2">...</span>
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationNext 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                          }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Batch
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete batch{" "}
              <span className="font-mono font-semibold">
                {selectedBatch?.batchId}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Warning: Permanent Deletion</p>
                <p>
                  Deleting this batch will:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Remove all associated QR codes and scratch codes</li>
                  <li>Delete all verification records for this batch</li>
                  <li>Make existing products unverifiable</li>
                  <li>Remove batch from analytics and reports</li>
                </ul>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete Batch Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Batch Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Batch Details: {viewBatch?.batchId}
            </DialogTitle>
            <DialogDescription>
              Detailed information and analytics for this QR code batch
            </DialogDescription>
          </DialogHeader>
          
          {viewBatch && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Product Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{viewBatch.productName}</p>
                          <p className="text-sm text-gray-500">Product Name</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Building className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{viewBatch.companyName}</p>
                          <p className="text-sm text-gray-500">Manufacturer</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-mono">{viewBatch.manufacturerId}</p>
                          <p className="text-sm text-gray-500">Manufacturer ID</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Batch Specifications</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Brand Prefix:</span>
                        <Badge variant="outline">{viewBatch.brandPrefix}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Products:</span>
                        <span className="font-medium">{viewBatch.quantity.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Status:</span>
                        <Badge className={`${getStatusColor(viewBatch.status)} capitalize`}>
                          {viewBatch.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Date Created:</span>
                        <span>{format(new Date(viewBatch.createdAt), "PPP")}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Verification Analytics</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <p className="text-3xl font-bold text-blue-600">{viewBatch.verifiedCount}</p>
                        <p className="text-sm text-blue-800">Verified Products</p>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg text-center">
                        <p className="text-3xl font-bold text-yellow-600">{viewBatch.suspiciousCount}</p>
                        <p className="text-sm text-yellow-800">Suspicious Verifications</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Verification Rate</span>
                        <span className="font-medium">{viewBatch.verificationRate}%</span>
                      </div>
                      <Progress value={viewBatch.verificationRate} className="h-3" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Verification Locations:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {viewBatch.locations?.map((loc: string, i: number) => (
                          <Badge key={i} variant="secondary">{loc}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code Samples */}
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Sample QR Codes</h4>
                    <p className="text-sm text-gray-500">First 3 generated codes from this batch</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => printBatchLabels(viewBatch)}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print All Labels
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadBatchCSV(viewBatch)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Full CSV
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {viewBatch.sampleCodes?.map((code: any, index: number) => (
                    <div key={index} className="border rounded-xl p-4">
                      <div className="text-center mb-3">
                        <div className="w-32 h-32 mx-auto mb-2 border rounded-lg overflow-hidden">
                          <img 
                            src={code.qrCodeImage || '/placeholder-qr.png'} 
                            alt={`QR Code ${code.qrCodeId}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mb-1">Scan to verify product</p>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-medium text-gray-500">QR Code ID</p>
                          <div className="flex items-center justify-between">
                            <p className="font-mono text-sm truncate">{code.qrCodeId}</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(code.qrCodeId)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Scratch Code</p>
                          <div className="flex items-center justify-between">
                            <p className="font-mono text-sm truncate text-yellow-700">{code.scratchCode}</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(code.scratchCode)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          <p>Verification URL: {window.location.origin}/verify/{code.qrCodeId}</p>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="col-span-3 text-center py-8 text-gray-500">
                      No sample codes available for this batch
                    </div>
                  )}
                </div>
              </div>

              {/* Batch Actions */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">Batch Actions</h4>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => printBatchLabels(viewBatch)} className="gap-2">
                    <Printer className="h-4 w-4" />
                    Print Label Sheets
                  </Button>
                  <Button variant="outline" onClick={() => downloadBatchCSV(viewBatch)} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download Complete CSV
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    View Analytics
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Verification Portal
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      setViewDialogOpen(false);
                      setSelectedBatch(viewBatch);
                      setDeleteDialogOpen(true);
                    }}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Batch
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}