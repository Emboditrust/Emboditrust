"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Building,
  User,
  Mail,
  Phone,
  Shield,
  FileText,
  QrCode,
  Package,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Download,
  Copy,
  Eye,
  RefreshCw,
  ArrowLeft,
  ExternalLink,
  BarChart3,
  Printer,
  Users,
  Activity,
  TrendingUp,
  AlertTriangle,
  Search,
  MoreHorizontal,
  Settings,
  DownloadCloud,
  FileImage,
  FileDown,
  Grid,
  EyeOff,
  Key,
  FileSpreadsheet,
  List,
  Calendar,
  MapPin,
  Globe,
  Map,
  Navigation,
  FileCheck,
  Scan,
  CheckSquare,
  Compass,
  Target,
  Wifi,
  Clock,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

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
  status: "active" | "suspended" | "inactive";
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

interface Batch {
  id?: string;
  _id?: string;
  batchId: string;
  productName: string;
  companyName: string;
  manufacturerId: string;
  quantity: number;
  createdAt?: string;
  generationDate?: string;
  status?: string;
  verifiedCount?: number;
  suspiciousCount?: number;
  verificationRate?: number;
  codesGenerated?: number;
}

interface VerificationStats {
  totalVerifications: number;
  validVerifications: number;
  invalidVerifications: number;
  uniqueProductsScanned: number;
  conversionRate: number;
  lastVerificationDate?: string;
}

interface Statistics {
  totalCodes: number;
  verifiedCodes: number;
  activeCodes: number;
  verificationRate: number;
  batches: number;
  todayVerifications: number;
  verificationStats?: VerificationStats;
}

interface BatchCode {
  qrCodeId: string;
  scratchCode: string;
  productName: string;
  companyName: string;
  batchId: string;
  manufacturerId: string;
  verificationUrl: string;
  qrCodeImage?: string;
  index: number;
  status?: string;
  verificationCount?: number;
  firstVerifiedAt?: string;
  lastVerifiedAt?: string;
}

// Pagination interface
interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;

  const [client, setClient] = useState<Client | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [batchCodes, setBatchCodes] = useState<BatchCode[]>([]);
  const [loadingBatchCodes, setLoadingBatchCodes] = useState(false);
  const [showBatchCodes, setShowBatchCodes] = useState(false);
  const [batchViewMode, setBatchViewMode] = useState<"grid" | "list">("grid");
  const [batchDetailsDialogOpen, setBatchDetailsDialogOpen] = useState(false);
  const [regeneratingBatch, setRegeneratingBatch] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState<any[]>([]);
  const [loadingVerificationAttempts, setLoadingVerificationAttempts] =
    useState(false);

  // Pagination state for verification logs
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 5,
  });

  const [editFormData, setEditFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    manufacturerId: "",
    brandPrefix: "",
    registrationNumber: "",
    status: "active" as "active" | "suspended" | "inactive",
    monthlyLimit: 0,
    website: "",
  });

  // Fetch all client data
  const fetchClientDetails = async () => {
    setLoading(true);
    try {
      // Fetch client data with statistics
      const clientResponse = await fetch(`/api/admin/clients/${clientId}`, {
        credentials: "include",
      });

      if (!clientResponse.ok) {
        const errorData = await clientResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to fetch client: ${clientResponse.status}`
        );
      }

      const clientData = await clientResponse.json();
      const client = clientData.client;
      const clientStats = clientData.statistics;

      setClient(client);

      // Set edit form data
      setEditFormData({
        companyName: client.companyName || "",
        contactPerson: client.contactPerson || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        manufacturerId: client.manufacturerId || "",
        brandPrefix: client.brandPrefix || "",
        registrationNumber: client.registrationNumber || "",
        status: client.status || "active",
        monthlyLimit: client.monthlyLimit || 0,
        website: client.website || "",
      });

      if (client.manufacturerId) {
        // Fetch batches with live data
        const batchesResponse = await fetch(
          `/api/admin/batches?manufacturerId=${client.manufacturerId}`,
          {
            credentials: "include",
          }
        );

        let batchesData = [];
        let totalBatchVerified = 0;

        if (batchesResponse.ok) {
          const batchesJson = await batchesResponse.json();
          batchesData = batchesJson.batches || [];
          setBatches(batchesData);

          // Calculate total verified codes from batches
          totalBatchVerified = batchesData.reduce(
            (sum: number, batch: Batch) => sum + (batch.verifiedCount || 0),
            0
          );
        }

        // Fetch verification stats
        const verificationStatsResponse = await fetch(
          `/api/admin/verifications/client/${client.manufacturerId}/stats`,
          {
            credentials: "include",
          }
        );

        let verificationStats = null;
        if (verificationStatsResponse.ok) {
          const statsData = await verificationStatsResponse.json();
          verificationStats = statsData.stats;
        }

        // IMPORTANT: Use the verifiedProducts count from verification stats
        // This is the correct count of products with status='verified'
        const verifiedCount =
          verificationStats?.verifiedProducts || totalBatchVerified || 0;

        // Use totalProducts from verification stats (count of all product codes)
        const totalProducts =
          verificationStats?.totalProducts || clientStats?.totalCodes || 0;

        // Calculate real verification rate
        const realVerificationRate =
          totalProducts > 0
            ? Math.round((verifiedCount / totalProducts) * 100)
            : 0;

        // Set comprehensive statistics
        setStats({
          totalCodes: totalProducts,
          verifiedCodes: verifiedCount,
          activeCodes:
            verificationStats?.activeProducts || clientStats?.activeCodes || 0,
          verificationRate: realVerificationRate,
          batches: batchesData.length,
          todayVerifications: clientStats?.todayVerifications || 0,
          verificationStats,
        });
      }
    } catch (error: any) {
      console.error("Error fetching client details:", error);
      toast.error("Failed to load client details");
      setClient(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch batches with real data
  const fetchBatches = async (manufacturerId: string) => {
    try {
      const batchesResponse = await fetch(
        `/api/admin/batches?manufacturerId=${manufacturerId}`,
        {
          credentials: "include",
        }
      );

      if (batchesResponse.ok) {
        const batchesJson = await batchesResponse.json();
        const batchesData = batchesJson.batches || batchesJson || [];
        setBatches(batchesData);

        // Calculate total codes from batches
        const totalCodes = batchesData.reduce(
          (sum: number, batch: Batch) =>
            sum + (batch.codesGenerated || batch.quantity || 0),
          0
        );

        return { batches: batchesData, totalCodes };
      }
      return { batches: [], totalCodes: 0 };
    } catch (error) {
      console.error("Error fetching batches:", error);
      return { batches: [], totalCodes: 0 };
    }
  };

  // Fetch verification statistics
  const fetchVerificationStats = async (manufacturerId: string) => {
    try {
      const verificationStatsResponse = await fetch(
        `/api/admin/verifications/client/${manufacturerId}/stats`,
        {
          credentials: "include",
        }
      );

      if (verificationStatsResponse.ok) {
        const statsData = await verificationStatsResponse.json();
        const verificationStats = statsData.stats;

        // Get today's date for filtering today's verifications
        const today = new Date();
        const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString();

        // Fetch today's verifications
        const todayVerificationsResponse = await fetch(
          `/api/admin/verifications/client/${manufacturerId}/attempts?startDate=${todayStart}&limit=1000`,
          { credentials: "include" }
        );

        let todayVerifications = 0;
        if (todayVerificationsResponse.ok) {
          const todayData = await todayVerificationsResponse.json();
          todayVerifications = todayData.attempts?.length || 0;
        }

        setStats({
          totalCodes: verificationStats.totalProducts || 0,
          verifiedCodes: verificationStats.validVerifications || 0,
          activeCodes: Math.max(
            0,
            (verificationStats.totalProducts || 0) -
              (verificationStats.validVerifications || 0)
          ),
          verificationRate: verificationStats.conversionRate || 0,
          batches: batches.length,
          todayVerifications,
          verificationStats,
        });
      }
    } catch (error) {
      console.error("Error fetching verification stats:", error);
      // Set default stats if API fails
      setStats({
        totalCodes: client?.codesGenerated || 0,
        verifiedCodes: Math.round((client?.codesGenerated || 0) * 0.3),
        activeCodes: Math.round((client?.codesGenerated || 0) * 0.7),
        verificationRate: 30,
        batches: batches.length,
        todayVerifications: Math.round((client?.codesGenerated || 0) * 0.01),
      });
    }
  };

  // Fetch verification attempts with pagination
  const fetchVerificationAttempts = async (page = 1) => {
    if (!client?.manufacturerId) return;

    setLoadingVerificationAttempts(true);
    try {
      const response = await fetch(
        `/api/admin/verifications/client/${client.manufacturerId}/attempts?page=${page}&limit=${pagination.itemsPerPage}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();

        setVerificationAttempts(data.attempts || []);

        // Update pagination from API response
        if (data.pagination) {
          setPagination({
            currentPage: data.pagination.page || page,
            totalPages: data.pagination.totalPages || 1,
            totalItems: data.pagination.total || 0,
            itemsPerPage: data.pagination.limit || pagination.itemsPerPage,
          });
        }
      } else {
        console.error("API error:", response.status);
      }
    } catch (error) {
      console.error("Error fetching verification attempts:", error);
      toast.error("Failed to load verification attempts");
    } finally {
      setLoadingVerificationAttempts(false);
    }
  };

  // Fetch batch codes
  const fetchBatchCodes = async (batchId: string) => {
    setLoadingBatchCodes(true);
    try {
      const response = await fetch(`/api/admin/batches/${batchId}/codes`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setBatchCodes(data.codes || []);
        setSelectedBatch(data.batch || null);
        setShowBatchCodes(true);
        toast.success(
          `Loaded ${
            data.total || data.codes?.length || 0
          } codes from batch ${batchId}`
        );
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to load batch codes");
        setBatchCodes([]);
      }
    } catch (error) {
      console.error("Error fetching batch codes:", error);
      toast.error("Network error loading batch codes");
      setBatchCodes([]);
    } finally {
      setLoadingBatchCodes(false);
    }
  };

  // Handle delete client
  const handleDelete = async () => {
    if (!client) return;

    try {
      const response = await fetch(`/api/admin/clients/${client.clientId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success(`Client ${client.companyName} deleted successfully`);
        router.push("/admin/clients");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete client");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  // Handle edit client
  const handleEditSubmit = async () => {
    if (!client) return;

    try {
      const response = await fetch(`/api/admin/clients/${client.clientId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        toast.success("Client updated successfully");
        setEditDialogOpen(false);
        fetchClientDetails();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update client");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  // Refresh all data
  const refreshData = () => {
    fetchClientDetails();
    if (client?.manufacturerId) {
      fetchVerificationAttempts(pagination.currentPage);
    }
    toast.success("Client data refreshed");
  };

  // Generate QR codes for client
  const generateQRForClient = () => {
    if (client) {
      router.push(`/admin/generate?clientId=${client.clientId}`);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // Download client report
  const downloadClientReport = () => {
    if (!client) return;

    const reportContent = `
EmbodiTrust Client Report
=========================
Generated: ${new Date().toLocaleDateString()}

CLIENT INFORMATION
------------------
Company: ${client.companyName}
Client ID: ${client.clientId}
Contact: ${client.contactPerson}
Email: ${client.email}
Phone: ${client.phone}
Manufacturer ID: ${client.manufacturerId}
Brand Prefix: ${client.brandPrefix}
Registration: ${client.registrationNumber}

CONTRACT DETAILS
----------------
Status: ${client.status}
Contract: ${new Date(
      client.contractStartDate
    ).toLocaleDateString()} to ${new Date(
      client.contractEndDate
    ).toLocaleDateString()}
Monthly Limit: ${client.monthlyLimit}
Codes Generated: ${client.codesGenerated}
Remaining: ${client.monthlyLimit - client.codesGenerated}

STATISTICS
----------
Total Batches: ${batches.length}
Total Codes: ${stats?.totalCodes || 0}
Verified Codes: ${stats?.verifiedCodes || 0}
Verification Rate: ${stats?.verificationRate || 0}%

VERIFICATION STATS
------------------
Total Scans: ${stats?.verificationStats?.totalVerifications || 0}
Valid Verifications: ${stats?.verificationStats?.validVerifications || 0}
Unique Products Scanned: ${stats?.verificationStats?.uniqueProductsScanned || 0}
Conversion Rate: ${stats?.verificationStats?.conversionRate || 0}%

RECENT BATCHES
--------------
${batches
  .map(
    (batch) =>
      `${batch.batchId}: ${batch.productName} (${
        batch.codesGenerated || batch.quantity
      } units)`
  )
  .join("\n")}
    `.trim();

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `client-report-${client.clientId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Client report downloaded");
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-teal-100 text-teal-800";
      case "suspended":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Approved";
      case "suspended":
        return "Suspended";
      case "inactive":
        return "Trial";
      default:
        return status;
    }
  };

  // Get contract progress
  const getContractProgress = (client: Client) => {
    const totalDays = Math.ceil(
      (new Date(client.contractEndDate).getTime() -
        new Date(client.contractStartDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const daysPassed = Math.ceil(
      (Date.now() - new Date(client.contractStartDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return Math.min(Math.max((daysPassed / totalDays) * 100, 0), 100);
  };

  // Get contract days remaining
  const getContractDaysRemaining = (client: Client) => {
    const daysRemaining = Math.ceil(
      (new Date(client.contractEndDate).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    );
    return Math.max(daysRemaining, 0);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Format date time
  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Get verification result badge
  const getVerificationResultBadge = (result: string) => {
    const styles = {
      valid: "bg-green-100 text-green-800",
      invalid: "bg-red-100 text-red-800",
      scanned: "bg-blue-100 text-blue-800",
      already_used: "bg-yellow-100 text-yellow-800",
      suspected_counterfeit: "bg-orange-100 text-orange-800",
    };
    return styles[result as keyof typeof styles] || styles.scanned;
  };

  // Get verification result text
  const getVerificationResultText = (result: string) => {
    const texts = {
      valid: "Valid",
      invalid: "Invalid",
      scanned: "Scanned",
      already_used: "Already Used",
      suspected_counterfeit: "Counterfeit",
    };
    return texts[result as keyof typeof texts] || result;
  };

  // Function to render location with all details
  const renderLocation = (location: any) => {
    if (!location) {
      return (
        <div className="text-sm text-gray-400 italic">No location data</div>
      );
    }

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-2 hover:bg-gray-100 text-left w-full"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-blue-500" />
                <span className="text-sm font-medium">
                  {location.city ||
                    location.region ||
                    location.country ||
                    "Unknown Location"}
                </span>
              </div>

              {location.country && (
                <div className="flex items-center gap-2">
                  <Globe className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-gray-600">
                    {location.country}
                  </span>
                </div>
              )}

              {location.latitude && location.longitude && (
                <div className="flex items-center gap-2">
                  <Compass className="h-3 w-3 text-purple-500" />
                  <span className="text-xs font-mono text-gray-500">
                    {location.latitude.toFixed(4)},{" "}
                    {location.longitude.toFixed(4)}
                  </span>
                </div>
              )}

              {location.isp && (
                <div className="flex items-center gap-2">
                  <Wifi className="h-3 w-3 text-orange-500" />
                  <span className="text-xs text-gray-600 truncate">
                    {location.isp}
                  </span>
                </div>
              )}

              {location.timezone && (
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-cyan-500" />
                  <span className="text-xs text-gray-600">
                    {location.timezone}
                  </span>
                </div>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Map className="h-4 w-4" />
              Complete Location Details
            </h4>

            <Separator />

            <div className="space-y-3">
              {/* Basic Location Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">City</p>
                  <p className="text-sm font-medium">
                    {location.city || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Region</p>
                  <p className="text-sm font-medium">
                    {location.region || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Country</p>
                  <p className="text-sm font-medium">
                    {location.country || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Timezone</p>
                  <p className="text-sm font-medium">
                    {location.timezone || "N/A"}
                  </p>
                </div>
              </div>

              {/* Coordinates */}
              {location.latitude && location.longitude && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    GPS Coordinates
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Latitude</p>
                      <p className="text-sm font-mono font-bold">
                        {location.latitude.toFixed(6)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Longitude</p>
                      <p className="text-sm font-mono font-bold">
                        {location.longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2 text-xs"
                    onClick={() => {
                      window.open(
                        `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
                        "_blank"
                      );
                    }}
                  >
                    <Navigation className="h-3 w-3 mr-1" />
                    View on Google Maps
                  </Button>
                </div>
              )}

              {/* Network Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      Internet Service Provider
                    </span>
                  </div>
                  <span className="text-xs font-medium truncate max-w-[150px]">
                    {location.isp || "Unknown"}
                  </span>
                </div>

                {location.organization && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        Organization
                      </span>
                    </div>
                    <span className="text-xs font-medium truncate max-w-[150px]">
                      {location.organization}
                    </span>
                  </div>
                )}
              </div>

              {/* Copy Coordinates Button */}
              {location.latitude && location.longitude && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full text-xs"
                  onClick={() => {
                    copyToClipboard(
                      `${location.latitude}, ${location.longitude}`
                    );
                  }}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Coordinates
                </Button>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  // Filter batches
  const filteredBatches = (batches || []).filter((batch) => {
    if (!batch) return false;

    const productName = batch.productName?.toLowerCase() || "";
    const batchId = batch.batchId?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return productName.includes(search) || batchId.includes(search);
  });

  // Download batch CSV
  const downloadBatchCSV = (batch: Batch) => {
    if (!batch) return;

    const csvRows = [
      [
        "Batch ID",
        "Product Name",
        "Quantity",
        "Codes Generated",
        "Created Date",
        "Verified Count",
        "Verification Rate",
      ],
      [
        batch.batchId || "",
        batch.productName || "",
        (batch.quantity || 0).toString(),
        (batch.codesGenerated || 0).toString(),
        formatDate(
          batch.createdAt || batch.generationDate || new Date().toISOString()
        ),
        (batch.verifiedCount || 0).toString(),
        (batch.verificationRate || 0).toString() + "%",
      ],
    ];

    const csvContent = csvRows
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `batch-details-${batch.batchId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success(`Batch details downloaded for ${batch.batchId}`);
  };

  // Regenerate batch codes
  const regenerateBatchCodes = async (batch: Batch) => {
    if (!batch || !client) return;

    setRegeneratingBatch(true);
    try {
      toast.info(`Regenerating codes for batch ${batch.batchId}...`);
      router.push(
        `/admin/generate?clientId=${client.clientId}&batchId=${
          batch.batchId
        }&productName=${encodeURIComponent(batch.productName)}&quantity=${
          batch.quantity
        }`
      );
    } catch (error) {
      console.error("Error regenerating batch:", error);
      toast.error("Failed to regenerate batch");
    } finally {
      setRegeneratingBatch(false);
    }
  };

  // Generate printable labels HTML
  const generatePrintableLabelsHTML = (codes: BatchCode[]) => {
  let html = ``;
  const perPage = 10; // 2 × 5 per A4

  for (let i = 0; i < codes.length; i += perPage) {
    html += `<div class="page">`;

    codes.slice(i, i + perPage).forEach(code => {
      const scratch = code.scratchCode.replace(/-/g, "");

      html += `
        <div class="card">

          <div class="top">
            <img src="${code.qrCodeImage}" class="qr" />

            <div class="right">
              <div class="headline">
                SCAN THE QR TO<br/>AUTHENTICATE
              </div>

              <div class="site">
                www.emboditrust.com
              </div>

              <div class="hint">
                Scratch the coating for verification ▼
              </div>
            </div>
          </div>

          <!-- SCRATCH COATING ZONE -->
          <div class="scratch-zone">
           
            <div class="scratch-code">${scratch}</div>
          </div>

          <div class="bottom">
            <div class="brand">EmbodiTrust</div>
            <div class="phone">📞 08127910984</div>
          </div>

        </div>
      `;
    });

    html += `</div>`;
  }

  return html;
};

  



  // Print batch codes
  const printBatchCodes = async () => {
    if (!selectedBatch) {
      toast.error("No batch selected");
      return;
    }

    try {
      toast.info("Loading all codes for printing...");

      const response = await fetch(
        `/api/admin/batches/${selectedBatch.batchId}/codes`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch all codes for printing");
      }

      const data = await response.json();
      const allCodes = data.codes || [];

      if (allCodes.length === 0) {
        toast.error("No codes to print");
        return;
      }

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Please allow popups to print");
        return;
      }

      const labelsHtml = generatePrintableLabelsHTML(allCodes);

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Healthcare Authentication Labels - ${
            selectedBatch?.batchId
          }</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
          @font-face {
  font-family: 'Outfit';
  src: url('/fonts/Outfit-VariableFont_wght.ttf') format('opentype');
  font-weight: 400;
}

@font-face {
  font-family: 'Outfit';
 src: url('/fonts/Outfit-VariableFont_wght.ttf') format('opentype');
  font-weight: 700;
}

@font-face {
  font-family: 'Outfit';
  src: url('/fonts/Outfit-VariableFont_wght.ttf') format('opentype');
  font-weight: 900;
}

@font-face {
  font-family: 'Outfit';
   src: url('/fonts/Outfit-VariableFont_wght.ttf') format('opentype');
  font-weight: 400;
}
         
         @page {
  size: A4;
  margin: 12mm;
}

body {
  margin: 0;
  padding: 0;
  background: white;
  font-family: Outfit, sans-serif;
}

.page {
  width: 186mm;
  height: 270mm;
  display: grid;
  grid-template-columns: repeat(2, 88mm);
  grid-template-rows: repeat(5, 52mm);
  gap: 2mm;
  page-break-after: always;
}

/* CARD */
.card {
  width: 88mm;
  height: 52mm;
  border-radius: 10px;
  border: 1px solid #ddd;
  padding: 4mm;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* TOP */
.top {
  display: flex;
  gap: 4mm;
}

.qr {
  width: 26mm;
  height: 26mm;
}

.right {
  flex: 1;
}

.headline {
  font-size: 11pt;
  font-weight: 900;
  line-height: 1.05;
}

.site {
  font-size: 8.5pt;
  margin-top: 1.5mm;
}

.hint {
  font-size: 8pt;
  margin-top: 1.5mm;
}

/* SCRATCH COATING AREA */
.scratch-zone {
  background: #d3d3d3;
  border-radius: 7px;
  padding: 3mm;
  text-align: center;
}

.scratch-label {
  font-size: 13pt;
  font-weight: 900;
  letter-spacing: 1px;
}

.scratch-code {
  margin-top: 1mm;
  font-family: Outfit;
  font-size: 11pt;
  letter-spacing: 3px;
}

/* BOTTOM */
.bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  font-family: Outfit, serif;
  font-size: 12pt;
  font-weight: bold;
}

.phone {
  font-size: 10pt;
  font-weight: bold;
}


          </style>
        </head>
        <body>
         
          
          <div class="labels-container">
            ${labelsHtml}
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                setTimeout(() => {
                  window.close();
                }, 1000);
              }, 1000);
            };
            
            window.addEventListener('afterprint', function() {
              setTimeout(() => {
                window.close();
              }, 1500);
            });
            
            // Fallback close
            setTimeout(() => {
              window.close();
            }, 10000);
          </script>
        </body>
        </html>
      `);

      printWindow.document.close();
      toast.success(`Preparing to print ${allCodes.length} labels...`);
    } catch (error) {
      console.error("Error printing labels:", error);
      toast.error("Failed to load codes for printing");
    }
  };

  // View batch details
  const viewBatchDetails = (batch: Batch) => {
    setSelectedBatch(batch);
    setBatchDetailsDialogOpen(true);
  };

  // Close batch codes view
  const closeBatchCodesView = () => {
    setShowBatchCodes(false);
    setBatchCodes([]);
  };

  // Download batch codes CSV
  const downloadBatchCodesCSV = () => {
    if (batchCodes.length === 0) {
      toast.error("No codes to download");
      return;
    }

    const csvRows = [
      [
        "Index",
        "QR Code ID",
        "Scratch Code",
        "Product Name",
        "Company Name",
        "Batch ID",
        "Manufacturer ID",
        "Verification URL",
        "Status",
        "Verification Count",
      ],
      ...batchCodes.map((code) => [
        code.index,
        code.qrCodeId,
        code.scratchCode.replace(/-/g, ""),
        code.productName,
        code.companyName,
        code.batchId,
        code.manufacturerId,
        code.verificationUrl,
        code.status || "active",
        code.verificationCount || 0,
      ]),
    ];

    const csvContent = csvRows
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `batch-codes-${selectedBatch?.batchId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success(`${batchCodes.length} codes downloaded`);
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, currentPage: page }));
    fetchVerificationAttempts(page);
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(pagination.totalPages);
  const goToPrevPage = () => goToPage(pagination.currentPage - 1);
  const goToNextPage = () => goToPage(pagination.currentPage + 1);

  // Calculate pagination display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(
      1,
      pagination.currentPage - Math.floor(maxPagesToShow / 2)
    );
    let endPage = startPage + maxPagesToShow - 1;

    if (endPage > pagination.totalPages) {
      endPage = pagination.totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  // Load data on component mount
  useEffect(() => {
    if (clientId) {
      fetchClientDetails();
    }
  }, [clientId]);

  // Load verification attempts when tab changes
  useEffect(() => {
    if (activeTab === "activity" && client?.manufacturerId) {
      fetchVerificationAttempts(pagination.currentPage);
    }
  }, [activeTab, client?.manufacturerId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Client Details
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Loading client information...
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon">
                  <Calendar className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2">
                  <img
                    src="https://github.com/shadcn.png"
                    alt="Admin User"
                    className="w-8 h-8 rounded-full grayscale object-cover"
                  />
                  <span className="font-medium text-[14px] text-gray-900">
                    Admin User
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600">Loading client details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Client not found
  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Client Details
                </h1>
                <p className="text-sm text-gray-500 mt-1">Client not found</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon">
                  <Calendar className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2">
                  <img
                    src="https://github.com/shadcn.png"
                    alt="Admin User"
                    className="w-8 h-8 rounded-full grayscale object-cover"
                  />
                  <span className="font-medium text-gray-900">Admin User</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Client Not Found
                </h2>
                <p className="text-gray-600 mb-6">
                  The client with ID {clientId} does not exist.
                </p>
                <Button onClick={() => router.push("/admin/clients")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Clients
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/admin/clients")}
                className="pl-0"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Clients
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {client.companyName}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Client ID: {client.clientId}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <Calendar className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <img
                  src="https://github.com/shadcn.png"
                  alt="Admin User"
                  className="w-8 h-8 grayscale rounded-full object-cover"
                />
                <span className="font-medium text-[14px] text-gray-900">
                  Admin User
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Client Overview</h2>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={refreshData} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={() => setEditDialogOpen(true)} className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Client
              </Button>
              <Button
                onClick={generateQRForClient}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
              >
                <QrCode className="h-4 w-4" />
                Generate QR Codes
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Products</p>
                    <p className="text-3xl font-bold mt-1">
                      {stats?.totalCodes?.toLocaleString() || "0"}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      Active: {stats?.activeCodes?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <Package className="h-10 w-10 text-blue-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Monthly Limit</p>
                    <p className="text-3xl font-bold mt-1">
                      {client?.monthlyLimit?.toLocaleString() || "0"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {client?.monthlyLimit
                        ? Math.round(
                            ((stats?.totalCodes || 0) / client.monthlyLimit) *
                              100
                          )
                        : 0}
                      % used
                    </p>
                  </div>
                  <BarChart3 className="h-10 w-10 text-purple-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Verification Scans</p>
                    <p className="text-3xl font-bold mt-1">
                      {stats?.verificationStats?.totalVerifications?.toLocaleString() ||
                        "0"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Valid:{" "}
                      {stats?.verificationStats?.validVerifications?.toLocaleString() ||
                        "0"}
                    </p>
                  </div>
                  <Activity className="h-10 w-10 text-yellow-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <Eye className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="batches" className="gap-2">
              <Package className="h-4 w-4" />
              Batches
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="h-4 w-4" />
              Verification Logs
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Company Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Company Name
                        </p>
                        <p className="font-medium">{client.companyName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Brand Prefix
                        </p>
                        <Badge variant="outline" className="font-mono">
                          {client.brandPrefix}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Manufacturer ID
                        </p>
                        <p className="font-medium">{client.manufacturerId}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Registration Number
                        </p>
                        <p className="font-medium">
                          {client.registrationNumber}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Company Address
                      </p>
                      <p className="font-medium">{client.address}</p>
                    </div>
                    {client.website && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Website
                        </p>
                        <a
                          href={client.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {client.website}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Contact Person
                          </p>
                          <p className="font-medium flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            {client.contactPerson}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Email Address
                          </p>
                          <p className="font-medium flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {client.email}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Phone Number
                          </p>
                          <p className="font-medium flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {client.phone}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Registration Date
                          </p>
                          <p className="font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {formatDate(client.registrationDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Status & Contract
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        Status
                      </span>
                      <Badge className={getStatusColor(client.status)}>
                        {getStatusText(client.status)}
                      </Badge>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Contract Progress</span>
                        <span>{Math.round(getContractProgress(client))}%</span>
                      </div>
                      <Progress
                        value={getContractProgress(client)}
                        className="h-2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Start Date
                        </p>
                        <p className="font-medium">
                          {formatDate(client.contractStartDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          End Date
                        </p>
                        <p className="font-medium">
                          {formatDate(client.contractEndDate)}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">
                        Quick Actions
                      </p>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-2"
                          onClick={() => copyToClipboard(client.clientId)}
                        >
                          <Copy className="h-4 w-4" />
                          Copy Client ID
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-2"
                          onClick={downloadClientReport}
                        >
                          <Download className="h-4 w-4" />
                          Download Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Verification Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {stats?.verificationStats ? (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Total Scans</span>
                            <span className="font-bold">
                              {stats.verificationStats.totalVerifications.toLocaleString()}
                            </span>
                          </div>
                          <Progress
                            value={Math.min(
                              (stats.verificationStats.totalVerifications /
                                1000) *
                                100,
                              100
                            )}
                            className="h-2"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-xl font-bold text-green-600">
                              {stats.verificationStats.validVerifications.toLocaleString()}
                            </div>
                            <p className="text-sm text-green-700">Valid</p>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-xl font-bold text-red-600">
                              {stats.verificationStats.invalidVerifications.toLocaleString()}
                            </div>
                            <p className="text-sm text-red-700">Invalid</p>
                          </div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-xl font-bold text-blue-600">
                            {stats.verificationStats.conversionRate}%
                          </div>
                          <p className="text-sm text-blue-700">
                            Conversion Rate
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <FileCheck className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">
                          No verification data available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="batches" className="space-y-6">
            {/* Batch Codes Dialog */}
            {showBatchCodes && (
              <Dialog open={showBatchCodes} onOpenChange={setShowBatchCodes}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                      <QrCode className="h-6 w-6" />
                      Batch Codes: {selectedBatch?.batchId}
                    </DialogTitle>
                    <DialogDescription className="text-lg">
                      {selectedBatch?.productName} • {batchCodes.length} codes •
                      Generated:{" "}
                      {selectedBatch?.createdAt
                        ? formatDate(selectedBatch.createdAt)
                        : "Unknown date"}
                    </DialogDescription>
                  </DialogHeader>

                  {loadingBatchCodes ? (
                    <div className="py-12 text-center">
                      <RefreshCw className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
                      <p className="text-gray-600">Loading batch codes...</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <Card className="border-blue-100 bg-blue-50/50">
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                              <h4 className="font-bold text-xl">
                                {selectedBatch?.productName}
                              </h4>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="outline" className="font-mono">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Batch: {selectedBatch?.batchId}
                                </Badge>
                                <Badge variant="outline">
                                  <Package className="h-3 w-3 mr-1" />
                                  Quantity: {batchCodes.length}
                                </Badge>
                                <Badge variant="outline">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {selectedBatch?.createdAt
                                    ? formatDate(selectedBatch.createdAt)
                                    : "Unknown"}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant={
                                  batchViewMode === "grid"
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  setBatchViewMode(
                                    batchViewMode === "grid" ? "list" : "grid"
                                  )
                                }
                                className="gap-2"
                              >
                                {batchViewMode === "grid" ? (
                                  <>
                                    <Grid className="h-4 w-4" />
                                    Grid View
                                  </>
                                ) : (
                                  <>
                                    <List className="h-4 w-4" />
                                    List View
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={downloadBatchCodesCSV}
                                className="gap-2"
                              >
                                <FileText className="h-4 w-4" />
                                Download CSV
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={printBatchCodes}
                                className="gap-2"
                              >
                                <Printer className="h-4 w-4" />
                                Print Labels
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {batchViewMode === "grid" ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {batchCodes.map((code) => (
                              <div className="border rounded-xl p-4 bg-white shadow-sm">
                                <div className="flex flex-col gap-3">
                                  {/* Top row */}
                                  <div className="flex gap-4 items-start">
                                    <div className="border rounded p-2 bg-white">
                                      <img
                                        src={code.qrCodeImage || ""}
                                        className="w-28 h-28 object-contain"
                                      />
                                    </div>

                                    <div className="flex-1">
                                      <div className="text-xl font-extrabold leading-tight text-[#0b1435]">
                                        SCAN THE QR TO
                                        <br />
                                        AUTHENTICATE
                                      </div>
                                      <div className="text-sm text-gray-600 mt-2">
                                        www.emboditrust.com
                                      </div>
                                    </div>
                                  </div>

                                  {/* Scratch bar */}
                                  <div className="bg-[#8b8fa3] text-white text-center py-2 rounded-lg text-sm font-semibold">
                                    Scratch the coating for verification
                                  </div>

                                  {/* Scratch Code */}
                                  <div className="border border-dashed rounded-lg text-center py-2 font-mono tracking-widest text-lg bg-gray-50">
                                    {code.scratchCode.replace(/-/g, "")}
                                  </div>

                                  {/* Footer */}
                                  <div className="flex justify-between items-center pt-2">
                                    <div>
                                      <div className="font-serif font-bold text-lg text-[#0b2b55]">
                                        Embodiment
                                      </div>
                                      <div className="text-sm font-bold">
                                        Healthcare Authentication
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1 font-bold text-[#0b1435]">
                                      <Phone className="h-5 w-5" />
                                      08127910984
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="text-center py-4 border-t">
                            <p className="text-gray-600 font-medium">
                              Total: {batchCodes.length} codes displayed
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="border rounded-lg overflow-hidden">
                            <table className="w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="p-3 text-left text-sm font-medium">
                                    #
                                  </th>
                                  <th className="p-3 text-left text-sm font-medium">
                                    QR Code Image
                                  </th>
                                  <th className="p-3 text-left text-sm font-medium">
                                    QR Code ID
                                  </th>
                                  <th className="p-3 text-left text-sm font-medium">
                                    Scratch Code
                                  </th>
                                  <th className="p-3 text-left text-sm font-medium">
                                    Product
                                  </th>
                                  <th className="p-3 text-left text-sm font-medium">
                                    Status
                                  </th>
                                  <th className="p-3 text-left text-sm font-medium">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {batchCodes.map((code) => (
                                  <tr
                                    key={code.qrCodeId}
                                    className="border-t hover:bg-gray-50"
                                  >
                                    <td className="p-3">{code.index}</td>
                                    <td className="p-3">
                                      {code.qrCodeImage ? (
                                        <img
                                          src={code.qrCodeImage}
                                          alt="QR Code"
                                          className="w-16 h-16 border rounded"
                                        />
                                      ) : (
                                        <div className="w-16 h-16 bg-gray-100 border rounded flex items-center justify-center">
                                          <QrCode className="h-8 w-8 text-gray-400" />
                                        </div>
                                      )}
                                    </td>
                                    <td className="p-3">
                                      <div className="font-mono text-sm">
                                        {code.qrCodeId}
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <div className="font-mono text-sm bg-yellow-50 p-2 rounded border border-yellow-200">
                                        {code.scratchCode.replace(/-/g, "")}
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <div className="text-sm">
                                        {code.productName}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {code.companyName}
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <Badge
                                        className={
                                          code.status === "active"
                                            ? "bg-green-100 text-green-800"
                                            : code.status === "verified"
                                            ? "bg-blue-100 text-blue-800"
                                            : code.status ===
                                              "suspected_counterfeit"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-gray-100 text-gray-800"
                                        }
                                      >
                                        {code.status}
                                      </Badge>
                                    </td>
                                    <td className="p-3">
                                      <div className="flex gap-2">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() =>
                                            copyToClipboard(code.qrCodeId)
                                          }
                                        >
                                          <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() =>
                                            copyToClipboard(
                                              code.scratchCode.replace(/-/g, "")
                                            )
                                          }
                                        >
                                          <Key className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="text-center py-4 border-t">
                            <p className="text-gray-600 font-medium">
                              Total: {batchCodes.length} codes displayed
                            </p>
                          </div>
                        </div>
                      )}

                      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                        <CardContent className="pt-6">
                          <h4 className="font-semibold text-blue-900 mb-4 text-lg flex items-center gap-2">
                            <FileDown className="h-5 w-5" />
                            Export Options
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Button
                              onClick={downloadBatchCodesCSV}
                              className="gap-2 h-auto py-4"
                              variant="outline"
                            >
                              <FileText className="h-5 w-5" />
                              <div className="text-left">
                                <div className="font-semibold">
                                  Download CSV
                                </div>
                                <div className="text-sm text-gray-500">
                                  Spreadsheet data
                                </div>
                              </div>
                            </Button>
                            <Button
                              onClick={printBatchCodes}
                              className="gap-2 h-auto py-4"
                              variant="outline"
                            >
                              <Printer className="h-5 w-5" />
                              <div className="text-left">
                                <div className="font-semibold">
                                  Print Labels
                                </div>
                                <div className="text-sm text-gray-500">
                                  Printable sheet
                                </div>
                              </div>
                            </Button>
                            <Button
                              onClick={() => {
                                toast.info("Export Images feature coming soon");
                              }}
                              className="gap-2 h-auto py-4"
                              variant="outline"
                            >
                              <FileImage className="h-5 w-5" />
                              <div className="text-left">
                                <div className="font-semibold">
                                  Export Images
                                </div>
                                <div className="text-sm text-gray-500">
                                  QR code images
                                </div>
                              </div>
                            </Button>
                            <Button
                              onClick={() => {
                                toast.info("Export All feature coming soon");
                              }}
                              className="gap-2 h-auto py-4"
                              variant="outline"
                            >
                              <FileSpreadsheet className="h-5 w-5" />
                              <div className="text-left">
                                <div className="font-semibold">Export All</div>
                                <div className="text-sm text-gray-500">
                                  Complete data package
                                </div>
                              </div>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  <DialogFooter>
                    <Button variant="outline" onClick={closeBatchCodesView}>
                      Close
                    </Button>
                    <Button
                      onClick={() =>
                        selectedBatch && regenerateBatchCodes(selectedBatch)
                      }
                      disabled={regeneratingBatch}
                      className="bg-blue-600 hover:bg-blue-700 gap-2"
                    >
                      {regeneratingBatch ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Printer className="h-4 w-4" />
                      )}
                      Regenerate & Print
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Batch Details Dialog */}
            {batchDetailsDialogOpen && selectedBatch && (
              <Dialog
                open={batchDetailsDialogOpen}
                onOpenChange={setBatchDetailsDialogOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Batch Details: {selectedBatch.batchId}
                    </DialogTitle>
                    <DialogDescription>
                      Detailed information about this batch
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Product Name
                      </p>
                      <p className="font-medium">{selectedBatch.productName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Quantity
                        </p>
                        <p className="font-medium">{selectedBatch.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Codes Generated
                        </p>
                        <p className="font-medium">
                          {selectedBatch.codesGenerated ||
                            selectedBatch.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Company
                        </p>
                        <p className="font-medium">
                          {selectedBatch.companyName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Manufacturer ID
                        </p>
                        <p className="font-medium">
                          {selectedBatch.manufacturerId}
                        </p>
                      </div>
                    </div>
                    {selectedBatch.verifiedCount !== undefined && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Verified Codes
                          </p>
                          <p className="font-medium">
                            {selectedBatch.verifiedCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Verification Rate
                          </p>
                          <p className="font-medium">
                            {selectedBatch.verificationRate || 0}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setBatchDetailsDialogOpen(false)}
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        setBatchDetailsDialogOpen(false);
                        fetchBatchCodes(selectedBatch.batchId);
                      }}
                    >
                      View Codes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Main Batches Table */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>QR Code Batches</CardTitle>
                    <CardDescription>
                      All batches generated for {client.companyName}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search batches..."
                        className="pl-10 w-60"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {batches.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Batches Yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      This client hasn't generated any QR code batches yet.
                    </p>
                    <Button onClick={generateQRForClient} className="gap-2">
                      <QrCode className="h-4 w-4" />
                      Generate First Batch
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead>Batch ID</TableHead>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Created Date</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredBatches.map((batch) => {
                            return (
                              <TableRow
                                key={batch?.batchId}
                                className="hover:bg-gray-50/50"
                              >
                                <TableCell className="font-mono text-sm">
                                  {batch?.batchId || "N/A"}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {batch?.productName || "N/A"}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className="font-mono"
                                  >
                                    {(
                                      batch?.codesGenerated ||
                                      batch?.quantity ||
                                      0
                                    ).toLocaleString()}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {formatDate(
                                    batch?.createdAt ||
                                      batch?.generationDate ||
                                      new Date().toISOString()
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      className="w-56 p-0"
                                      align="end"
                                    >
                                      <div className="py-1">
                                        <Button
                                          variant="ghost"
                                          className="w-full justify-start px-3 py-2 text-sm font-normal hover:bg-gray-100"
                                          onClick={() =>
                                            batch && viewBatchDetails(batch)
                                          }
                                        >
                                          <Eye className="h-4 w-4 mr-2" />
                                          View Details
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          className="w-full justify-start px-3 py-2 text-sm font-normal hover:bg-gray-100"
                                          onClick={() =>
                                            batch &&
                                            fetchBatchCodes(batch.batchId)
                                          }
                                        >
                                          <QrCode className="h-4 w-4 mr-2" />
                                          View QR/Scratch Codes
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          className="w-full justify-start px-3 py-2 text-sm font-normal hover:bg-gray-100"
                                          onClick={() =>
                                            batch && downloadBatchCSV(batch)
                                          }
                                        >
                                          <Download className="h-4 w-4 mr-2" />
                                          Download Batch Data
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          className="w-full justify-start px-3 py-2 text-sm font-normal hover:bg-gray-100"
                                          onClick={() =>
                                            batch && regenerateBatchCodes(batch)
                                          }
                                          disabled={regeneratingBatch}
                                        >
                                          <RefreshCw className="h-4 w-4 mr-2" />
                                          Regenerate/Print
                                        </Button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {filteredBatches.length > 0 && (
                      <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t">
                        <span className="text-sm text-gray-600">
                          Showing {filteredBatches.length} of {batches.length}{" "}
                          batches
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0"
                          >
                            ←
                          </Button>
                          <Button
                            size="sm"
                            className="w-8 h-8 p-0 bg-teal-500 hover:bg-teal-600 text-white"
                          >
                            1
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0"
                          >
                            2
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0"
                          >
                            3
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0"
                          >
                            →
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Verification Logs
                </CardTitle>
                <CardDescription>
                  Recent verification attempts for {client.companyName}'s
                  products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <Button
                      variant="outline"
                      onClick={() =>
                        fetchVerificationAttempts(pagination.currentPage)
                      }
                      disabled={loadingVerificationAttempts}
                      className="gap-2"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${
                          loadingVerificationAttempts ? "animate-spin" : ""
                        }`}
                      />
                      {loadingVerificationAttempts
                        ? "Loading..."
                        : "Refresh Logs"}
                    </Button>
                  </div>

                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
                    to{" "}
                    {Math.min(
                      pagination.currentPage * pagination.itemsPerPage,
                      pagination.totalItems
                    )}{" "}
                    of {pagination.totalItems} attempts
                  </div>
                </div>

                {loadingVerificationAttempts ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
                    <p className="text-gray-500">
                      Loading verification logs...
                    </p>
                  </div>
                ) : verificationAttempts.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            Total Attempts
                          </p>
                          <p className="text-xl font-bold">
                            {pagination.totalItems.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Valid</p>
                          <p className="text-xl font-bold text-green-600">
                            {
                              verificationAttempts.filter(
                                (a) => a.result === "valid"
                              ).length
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Invalid</p>
                          <p className="text-xl font-bold text-red-600">
                            {
                              verificationAttempts.filter(
                                (a) => a.result === "invalid"
                              ).length
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">With Location</p>
                          <p className="text-xl font-bold text-blue-600">
                            {
                              verificationAttempts.filter((a) => a.location)
                                .length
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead>Date & Time</TableHead>
                              <TableHead>QR Code</TableHead>
                              <TableHead>Result</TableHead>
                              <TableHead>IP Address</TableHead>
                              <TableHead className="min-w-[250px]">
                                Location Details
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {verificationAttempts.map((attempt, index) => (
                              <TableRow
                                key={index}
                                className="border-t hover:bg-gray-50"
                              >
                                <TableCell>
                                  <div className="text-sm">
                                    {formatDateTime(attempt.timestamp)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div
                                    className="font-mono text-xs truncate max-w-[180px]"
                                    title={attempt.scannedCode}
                                  >
                                    {attempt.scannedCode}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={getVerificationResultBadge(
                                      attempt.result
                                    )}
                                  >
                                    {getVerificationResultText(attempt.result)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm font-mono">
                                    {attempt.ipAddress}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {renderLocation(attempt.location)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Pagination Controls */}
                    {pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-gray-600">
                          Page {pagination.currentPage} of{" "}
                          {pagination.totalPages}
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={goToFirstPage}
                            disabled={pagination.currentPage === 1}
                          >
                            <ChevronsLeft className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={goToPrevPage}
                            disabled={pagination.currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>

                          <div className="flex items-center gap-1 mx-2">
                            {getPageNumbers().map((pageNum) => (
                              <Button
                                key={pageNum}
                                variant={
                                  pageNum === pagination.currentPage
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                className="w-8 h-8 p-0"
                                onClick={() => goToPage(pageNum)}
                              >
                                {pageNum}
                              </Button>
                            ))}
                          </div>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={goToNextPage}
                            disabled={
                              pagination.currentPage === pagination.totalPages
                            }
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={goToLastPage}
                            disabled={
                              pagination.currentPage === pagination.totalPages
                            }
                          >
                            <ChevronsRight className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="text-sm text-gray-600">
                          <Select
                            value={pagination.itemsPerPage.toString()}
                            onValueChange={(value) => {
                              setPagination((prev) => ({
                                ...prev,
                                itemsPerPage: parseInt(value),
                                currentPage: 1,
                              }));
                              fetchVerificationAttempts(1);
                            }}
                          >
                            <SelectTrigger className="w-20 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="25">25</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Scan className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Verification Activity
                    </h3>
                    <p className="text-gray-500 mb-6">
                      This client's products haven't been scanned or verified
                      yet.
                    </p>
                    <p className="text-sm text-gray-400">
                      When customers scan QR codes, verification logs will
                      appear here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Client Settings
                </CardTitle>
                <CardDescription>
                  Manage client configuration and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">
                    Client Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Client ID
                      </p>
                      <p className="font-mono text-lg font-bold">
                        {client.clientId}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Brand Prefix
                      </p>
                      <p className="text-2xl font-mono font-bold">
                        {client.brandPrefix}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Export Data</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <DownloadCloud className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h5 className="font-semibold text-blue-800 mb-1">
                          Export Client Data
                        </h5>
                        <p className="text-sm text-blue-700 mb-3">
                          Download all client data including batches, codes, and
                          activity logs.
                        </p>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="gap-2"
                            onClick={downloadClientReport}
                          >
                            <FileText className="h-4 w-4" />
                            Export Report
                          </Button>
                          <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Export All Data
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Danger Zone</h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h5 className="font-semibold text-red-800 mb-1">
                          Delete Client
                        </h5>
                        <p className="text-sm text-red-700 mb-3">
                          This will permanently delete the client and all
                          associated data.
                        </p>
                        <Button
                          variant="destructive"
                          onClick={() => setDeleteDialogOpen(true)}
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Client Permanently
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Client Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Edit className="h-6 w-6" />
              Edit Client: {client?.companyName}
            </DialogTitle>
            <DialogDescription>
              Update client information and settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase">
                Company Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name *</label>
                  <Input
                    value={editFormData.companyName}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        companyName: e.target.value,
                      })
                    }
                    placeholder="Company name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Brand Prefix *</label>
                  <Input
                    value={editFormData.brandPrefix}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        brandPrefix: e.target.value.toUpperCase().slice(0, 3),
                      })
                    }
                    placeholder="EMB"
                    className="uppercase font-mono"
                    maxLength={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Manufacturer ID *
                  </label>
                  <Input
                    value={editFormData.manufacturerId}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        manufacturerId: e.target.value,
                      })
                    }
                    placeholder="Manufacturer ID"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Registration Number *
                  </label>
                  <Input
                    value={editFormData.registrationNumber}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        registrationNumber: e.target.value,
                      })
                    }
                    placeholder="Registration number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Company Address *</label>
                <Textarea
                  value={editFormData.address}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      address: e.target.value,
                    })
                  }
                  placeholder="Full company address"
                  rows={2}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase">
                Contact Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Contact Person *
                  </label>
                  <Input
                    value={editFormData.contactPerson}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        contactPerson: e.target.value,
                      })
                    }
                    placeholder="Contact person"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address *</label>
                  <Input
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
                      })
                    }
                    type="email"
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number *</label>
                  <Input
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        phone: e.target.value,
                      })
                    }
                    placeholder="Phone number"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Website</label>
                  <Input
                    value={editFormData.website}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        website: e.target.value,
                      })
                    }
                    placeholder="Website URL"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase">
                Settings
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status *</label>
                  <Select
                    value={editFormData.status}
                    onValueChange={(
                      value: "active" | "suspended" | "inactive"
                    ) => setEditFormData({ ...editFormData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Monthly Limit *</label>
                  <Input
                    value={editFormData.monthlyLimit}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        monthlyLimit: parseInt(e.target.value) || 0,
                      })
                    }
                    type="number"
                    min={100}
                    max={1000000}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Client Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete Client
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold">{client?.companyName}</span>?
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">
                  Warning: This action cannot be undone
                </p>
                <p>
                  All data associated with this client will be permanently
                  deleted from the system.
                </p>
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
            <Button variant="destructive" onClick={handleDelete}>
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
