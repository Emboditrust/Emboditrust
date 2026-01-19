"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Loader2,
  QrCode,
  Building,
  Users,
  ArrowRight,
  Package,
  CheckCircle,
  AlertCircle,
  FileText,
  Shield,
  Search,
  Plus,
} from "lucide-react";

interface Client {
  id: string;
  clientId: string;
  companyName: string;
  manufacturerId: string;
  brandPrefix: string;
  monthlyLimit: number;
  codesGenerated: number;
  logoUrl?: string;
  status: 'active' | 'suspended' | 'inactive';
  contactPerson: string;
}

export default function GenerateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientIdParam = searchParams.get('clientId');

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  // Set selected client if clientId param exists
  useEffect(() => {
    if (clientIdParam && clients.length > 0) {
      const client = clients.find(c => c.clientId === clientIdParam);
      if (client) {
        setSelectedClient(client);
      } else {
        toast.error('Client not found or inactive');
      }
    }
  }, [clientIdParam, clients]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/clients?status=active&limit=100', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.manufacturerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
  };

  const generateForClient = () => {
    if (selectedClient) {
      router.push(`/admin/generate/${selectedClient.clientId}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "suspended": return "bg-yellow-100 text-yellow-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-3 w-3" />;
      case "suspended": return <AlertCircle className="h-3 w-3" />;
      case "inactive": return <AlertCircle className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generate QR Codes</h1>
          <p className="text-gray-500">
            Select a client to generate QR + Scratch code pairs
          </p>
        </div>
        <Link href="/admin/clients">
          <Button variant="outline" className="gap-2">
            <Users className="h-4 w-4" />
            Manage Clients
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Client Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Select Client
              </CardTitle>
              <CardDescription>
                Choose a pharmaceutical company to generate codes for
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search clients by name, manufacturer ID, or contact person..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Clients List */}
              {filteredClients.length === 0 ? (
                <div className="text-center py-12">
                  <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Active Clients Found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm 
                      ? "No clients match your search criteria"
                      : "No active clients available. Add clients or activate existing ones."
                    }
                  </p>

                  
                  <Link href="/admin/clients/create">
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add New Client
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredClients.map((client) => (
                    <div
                      key={client.clientId}
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedClient?.clientId === client.clientId
                          ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20'
                          : 'hover:border-blue-300'
                      }`}
                      onClick={() => handleClientSelect(client)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {client.logoUrl ? (
                            <img
                              src={client.logoUrl}
                              alt={client.companyName}
                              className="w-12 h-12 rounded object-contain border"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center border">
                              <Building className="h-6 w-6 text-blue-600" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold">{client.companyName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="gap-1">
                                <Shield className="h-3 w-3" />
                                {client.brandPrefix}
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                <FileText className="h-3 w-3" />
                                {client.manufacturerId}
                              </Badge>
                              <Badge className={`${getStatusColor(client.status)} gap-1 capitalize`}>
                                {getStatusIcon(client.status)}
                                {client.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{client.contactPerson}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">
                            {client.codesGenerated.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">Codes Generated</div>
                          <div className="text-xs text-gray-400">
                            Limit: {client.monthlyLimit.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">Monthly Usage</span>
                          <span>{Math.round((client.codesGenerated / client.monthlyLimit) * 100)}%</span>
                        </div>
                        <Progress 
                          value={(client.codesGenerated / client.monthlyLimit) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Selection Summary */}
        <div className="space-y-6">
          {/* Selected Client Summary */}
          {selectedClient ? (
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-blue-600" />
                  Selected Client
                </CardTitle>
                <CardDescription>
                  Ready to generate QR codes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  {selectedClient.logoUrl ? (
                    <img
                      src={selectedClient.logoUrl}
                      alt={selectedClient.companyName}
                      className="w-16 h-16 rounded object-contain border"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-100 rounded flex items-center justify-center border">
                      <Building className="h-8 w-8 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-lg">{selectedClient.companyName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="gap-1">
                        <Shield className="h-3 w-3" />
                        {selectedClient.brandPrefix}
                      </Badge>
                      <Badge className={`${getStatusColor(selectedClient.status)} gap-1 capitalize`}>
                        {getStatusIcon(selectedClient.status)}
                        {selectedClient.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Manufacturer ID</span>
                    <span className="font-mono">{selectedClient.manufacturerId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contact Person</span>
                    <span>{selectedClient.contactPerson}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Limit</span>
                    <span className="font-medium">{selectedClient.monthlyLimit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Codes Generated</span>
                    <span className="font-medium">{selectedClient.codesGenerated.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available</span>
                    <span className="font-bold text-green-600">
                      {(selectedClient.monthlyLimit - selectedClient.codesGenerated).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <Separator />
                
                <Button 
                  onClick={generateForClient}
                  className="w-full py-6 text-lg gap-3"
                  size="lg"
                  disabled={selectedClient.status !== 'active'}
                >
                  <QrCode className="h-5 w-5" />
                  Generate QR Codes
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                
                {selectedClient.status !== 'active' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          Client is {selectedClient.status}
                        </p>
                        <p className="text-xs text-yellow-700">
                          Activate the client to generate QR codes
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  No Client Selected
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="h-10 w-10 text-gray-400" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Select a Client</h4>
                <p className="text-gray-500 mb-6">
                  Choose a client from the list to start generating QR codes
                </p>
                <div className="text-sm text-gray-400">
                  <p>• Click on any client card to select</p>
                  <p>• Only active clients can generate codes</p>
                  <p>• Check monthly limits before generating</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Active Clients</span>
                <span className="font-medium">
                  {clients.filter(c => c.status === 'active').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Codes Generated</span>
                <span className="font-medium">
                  {clients.reduce((sum, client) => sum + client.codesGenerated, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Usage</span>
                <span className="font-medium">
                  {clients.length > 0 
                    ? Math.round(clients.reduce((sum, client) => sum + (client.codesGenerated / client.monthlyLimit), 0) / clients.length * 100)
                    : 0
                  }%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}