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
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ActivityLog() {
  const { stats } = useCodes();
  const [searchTerm, setSearchTerm] = useState("");
  const [resultFilter, setResultFilter] = useState("all");
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const recentActivity = stats.recentActivity || [];

  const filteredActivity = recentActivity.filter((activity: any) => {
    const matchesSearch = 
      activity.scannedCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.location?.country?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesResult = resultFilter === "all" || activity.result === resultFilter;
    
    return matchesSearch && matchesResult;
  });

  const getResultIcon = (result: string) => {
    switch (result) {
      case "valid":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "invalid":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "already_used":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "suspected_counterfeit":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case "valid":
        return "bg-green-100 text-green-800";
      case "invalid":
        return "bg-red-100 text-red-800";
      case "already_used":
        return "bg-yellow-100 text-yellow-800";
      case "suspected_counterfeit":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const viewActivityDetails = (activity: any) => {
    setSelectedActivity(activity);
    setDialogOpen(true);
  };

  const exportActivityLog = () => {
    // In a real implementation, this would trigger a CSV download
    toast.info("Activity log export would be triggered");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>
                Real-time verification attempts and suspicious activities
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
                <SelectTrigger className="w-[120px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="valid">Valid</SelectItem>
                  <SelectItem value="invalid">Invalid</SelectItem>
                  <SelectItem value="already_used">Already Used</SelectItem>
                  <SelectItem value="suspected_counterfeit">Suspicious</SelectItem>
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
                      {stats.verificationAttemptsToday || 0}
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
                      {stats.verifiedToday || 0}
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
                      {stats.suspiciousActivity || 0}
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
                    <p className="text-sm font-medium text-gray-500">Unique Locations</p>
                    <p className="text-2xl font-bold">
                      {new Set(recentActivity.map((a: any) => a.location?.country)).size}
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
              <RefreshCw className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No activity found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {recentActivity.length === 0
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
                    <TableHead>Code</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivity.map((activity: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(activity.timestamp), "HH:mm:ss")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(activity.timestamp), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {activity.scannedCode || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${getResultColor(activity.result)} capitalize`}
                        >
                          {getResultIcon(activity.result)}
                          <span className="ml-1">
                            {activity.result.replace("_", " ")}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <div className="text-sm">
                            {activity.location?.country || "Unknown"}
                            {activity.location?.city && (
                              <div className="text-xs text-gray-500">
                                {activity.location.city}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewActivityDetails(activity)}
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
        </CardContent>
      </Card>

      {/* Activity Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activity Details</DialogTitle>
            <DialogDescription>
              Detailed information about this verification attempt
            </DialogDescription>
          </DialogHeader>
          {selectedActivity && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Code</p>
                  <p className="font-mono bg-gray-50 p-2 rounded">
                    {selectedActivity.scannedCode}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Result</p>
                  <Badge
                    variant="outline"
                    className={`${getResultColor(selectedActivity.result)} capitalize text-base`}
                  >
                    {getResultIcon(selectedActivity.result)}
                    <span className="ml-2">
                      {selectedActivity.result.replace("_", " ")}
                    </span>
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Timestamp</p>
                <p>
                  {format(new Date(selectedActivity.timestamp), "PPpp")}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location Information
                </p>
                {selectedActivity.location ? (
                  <div className="bg-gray-50 p-3 rounded space-y-1">
                    <p>
                      <span className="font-medium">Country:</span>{" "}
                      {selectedActivity.location.country || "Unknown"}
                    </p>
                    {selectedActivity.location.region && (
                      <p>
                        <span className="font-medium">Region:</span>{" "}
                        {selectedActivity.location.region}
                      </p>
                    )}
                    {selectedActivity.location.city && (
                      <p>
                        <span className="font-medium">City:</span>{" "}
                        {selectedActivity.location.city}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No location data available</p>
                )}
              </div>

              {selectedActivity.userAgent && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">User Agent</p>
                  <p className="text-sm bg-gray-50 p-2 rounded truncate">
                    {selectedActivity.userAgent}
                  </p>
                </div>
              )}

              {selectedActivity.result === "suspected_counterfeit" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-800 mb-1">
                        Suspicious Activity Detected
                      </p>
                      <p className="text-sm text-yellow-700">
                        This verification attempt has been flagged as suspicious.
                        Consider investigating this activity further.
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