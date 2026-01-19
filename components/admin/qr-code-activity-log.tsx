"use client";

import { useState } from "react";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCodes } from "@/hooks/use-codes";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Search,
  Filter,
  Download,
  MapPin,
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  QrCode,
  Key,
  Shield,
} from "lucide-react";

export default function QRCodeActivityLog() {
  const { activity, isLoadingActivity } = useCodes();
  const [searchTerm, setSearchTerm] = useState("");
  const [resultFilter, setResultFilter] = useState("all");
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredActivity = activity.filter((activityItem: any) => {
    const matchesSearch = 
      activityItem.qrCodeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activityItem.scratchCodeAttempt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activityItem.location?.country?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesResult = resultFilter === "all" || activityItem.result === resultFilter;
    
    return matchesSearch && matchesResult;
  });

  const getResultIcon = (result: string) => {
    switch (result) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "scratch_invalid":
      case "qr_not_found":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "already_verified":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "suspected_fake":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getResultText = (result: string) => {
    switch (result) {
      case "success":
        return "Verified";
      case "scratch_invalid":
        return "Invalid Scratch";
      case "qr_not_found":
        return "Invalid QR";
      case "already_verified":
        return "Already Verified";
      case "suspected_fake":
        return "Suspected Fake";
      default:
        return result;
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case "success":
        return "bg-green-100 text-green-800";
      case "scratch_invalid":
      case "qr_not_found":
        return "bg-red-100 text-red-800";
      case "already_verified":
        return "bg-yellow-100 text-yellow-800";
      case "suspected_fake":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const viewActivityDetails = (activityItem: any) => {
    setSelectedActivity(activityItem);
    setDialogOpen(true);
  };

  const exportActivityLog = () => {
    toast.info("Activity log export would be triggered");
  };

  if (isLoadingActivity) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verification Activity</CardTitle>
          <CardDescription>Loading activity...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                QR Code Verification Activity
              </CardTitle>
              <CardDescription>
                Real-time verification attempts for QR + Scratch codes
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search activity..."
                  className="pl-9 w-full sm:w-[200px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={resultFilter} onValueChange={setResultFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="success">Verified</SelectItem>
                  <SelectItem value="scratch_invalid">Invalid Scratch</SelectItem>
                  <SelectItem value="qr_not_found">Invalid QR</SelectItem>
                  <SelectItem value="already_verified">Already Verified</SelectItem>
                  <SelectItem value="suspected_fake">Suspected Fake</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={exportActivityLog}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Today</p>
                    <p className="text-2xl font-bold">
                      {filteredActivity.length}
                    </p>
                  </div>
                  <RefreshCw className="h-8 w-8 text-blue-100" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Successful</p>
                    <p className="text-2xl font-bold text-green-600">
                      {filteredActivity.filter((a: any) => a.result === "success").length}
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
                      {filteredActivity.filter((a: any) => a.result === "suspected_fake").length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-100" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Locations</p>
                    <p className="text-2xl font-bold">
                      {new Set(filteredActivity.map((a: any) => a.location?.country)).size}
                    </p>
                  </div>
                  <Globe className="h-8 w-8 text-purple-100" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Table */}
          {filteredActivity.length === 0 ? (
            <div className="text-center py-12">
              <QrCode className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No activity found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {activity.length === 0
                  ? "No verification activity recorded yet."
                  : "No activity matches your search criteria."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>QR Code</TableHead>
                    <TableHead>Scratch Code</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivity.map((activityItem: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(activityItem.timestamp), "HH:mm:ss")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(activityItem.timestamp), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <QrCode className="h-4 w-4 text-blue-500" />
                          <div className="font-mono text-sm truncate max-w-[120px]">
                            {activityItem.qrCodeId || "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-green-500" />
                          <div className="font-mono text-sm">
                            {activityItem.scratchCodeAttempt 
                              ? activityItem.scratchCodeAttempt.substring(0, 8) + "..."
                              : "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${getResultColor(activityItem.result)} capitalize`}
                        >
                          {getResultIcon(activityItem.result)}
                          <span className="ml-1">
                            {getResultText(activityItem.result)}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <div className="text-sm">
                            {activityItem.location?.country || "Unknown"}
                            {activityItem.location?.city && (
                              <div className="text-xs text-gray-500">
                                {activityItem.location.city}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewActivityDetails(activityItem)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {filteredActivity.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {filteredActivity.length} of {activity.length} activities
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
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

      {/* Activity Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Verification Details</DialogTitle>
            <DialogDescription>
              Detailed information about this verification attempt
            </DialogDescription>
          </DialogHeader>
          {selectedActivity && (
            <div className="space-y-6">
              {/* Code Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-medium text-gray-500">QR Code ID</p>
                  </div>
                  <p className="font-mono bg-gray-50 p-2 rounded text-sm">
                    {selectedActivity.qrCodeId || "Not available"}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-medium text-gray-500">Scratch Code</p>
                  </div>
                  <p className="font-mono bg-gray-50 p-2 rounded text-sm">
                    {selectedActivity.scratchCodeAttempt || "Not available"}
                  </p>
                </div>
              </div>

              {/* Result */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Verification Result</p>
                <div className="flex items-center gap-3">
                  {getResultIcon(selectedActivity.result)}
                  <Badge
                    variant="outline"
                    className={`${getResultColor(selectedActivity.result)} text-base`}
                  >
                    {getResultText(selectedActivity.result)}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {format(new Date(selectedActivity.timestamp), "PPpp")}
                  </span>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location Information
                </p>
                {selectedActivity.location ? (
                  <div className="bg-gray-50 p-3 rounded space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Country:</span>
                      <span>{selectedActivity.location.country || "Unknown"}</span>
                    </div>
                    {selectedActivity.location.region && (
                      <div className="flex justify-between">
                        <span className="font-medium">Region:</span>
                        <span>{selectedActivity.location.region}</span>
                      </div>
                    )}
                    {selectedActivity.location.city && (
                      <div className="flex justify-between">
                        <span className="font-medium">City:</span>
                        <span>{selectedActivity.location.city}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No location data available</p>
                )}
              </div>

              {/* Technical Details */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Technical Details</p>
                <div className="bg-gray-50 p-3 rounded space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">IP Address:</span>
                    <span className="font-mono text-sm">
                      {selectedActivity.ipAddress?.substring(0, 8)}...
                    </span>
                  </div>
                  {selectedActivity.userAgent && (
                    <div>
                      <span className="font-medium">User Agent:</span>
                      <p className="text-sm text-gray-600 truncate">
                        {selectedActivity.userAgent}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Warning for suspicious activity */}
              {selectedActivity.result === "suspected_fake" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-800 mb-1">
                        Suspicious Activity Detected
                      </p>
                      <p className="text-sm text-yellow-700">
                        This verification attempt has been flagged as potentially
                        fraudulent. Consider investigating this product further.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}