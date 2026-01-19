'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Loader2,
  QrCode,
  Key,
  Download,
  Eye,
  EyeOff,
  Printer,
  Image as ImageIcon,
  FileText,
  Package,
  Building,
  Scan,
  Users,
  ArrowLeft,
  Copy,
  CheckCircle,
  AlertCircle,
  Calendar,
  Shield,
  ExternalLink,
  FileDown,
  Grid,
  List,
  Edit,
  RefreshCw,
  AlertTriangle,
  FileImage,
} from "lucide-react";
import { z } from "zod";
import Link from "next/link";

// Validation schema
const generationSchema = z.object({
  quantity: z.coerce.number()
    .int()
    .min(1, 'Minimum 1 product')
    .max(10000, 'Maximum 10,000 products per batch'),
  productName: z.string().min(1, 'Product name required').max(200),
  customBatchNumber: z.string().optional(),
  enableCustomPage: z.boolean().default(false),
  customLogoUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
  additionalInfo: z.string().optional(),
});

type GenerationFormData = z.infer<typeof generationSchema>;

interface Client {
  id: string;
  clientId: string;
  companyName: string;
  manufacturerId: string;
  brandPrefix: string;
  monthlyLimit: number;
  codesGenerated: number;
  logoUrl?: string;
  website?: string;
  contactPerson: string;
  status: 'active' | 'suspended' | 'inactive';
}

interface GeneratedCode {
  qrCodeId: string;
  qrCodeImage: string;
  scratchCode: string;
  verificationUrl: string;
  productName: string;
  companyName: string;
  manufacturerId: string;
  batchId: string;
  index: number;
}

export default function GenerateForClientPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  
  const [client, setClient] = useState<Client | null>(null);
  const [generatedCodes, setGeneratedCodes] = useState<GeneratedCode[]>([]);
  const [showCodes, setShowCodes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingClient, setLoadingClient] = useState(true);
  const [batchId, setBatchId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [generationStats, setGenerationStats] = useState({
    total: 0,
    timeTaken: 0,
    qrSize: '500x500',
  });

  // Fetch client data on mount
  useEffect(() => {
    if (clientId) {
      fetchClient();
    } else {
      router.push('/admin/generate');
    }
  }, [clientId, router]);

  const fetchClient = async () => {
    setLoadingClient(true);
    try {
      const response = await fetch(`/api/admin/clients/${clientId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setClient(data.client);
      } else {
        toast.error('Failed to load client');
        router.push('/admin/generate');
      }
    } catch (error) {
      console.error('Error fetching client:', error);
      toast.error('Network error loading client');
      router.push('/admin/generate');
    } finally {
      setLoadingClient(false);
    }
  };
  
  const form = useForm<GenerationFormData>({
    resolver: zodResolver(generationSchema) as any,
    defaultValues: {
      quantity: 100,
      productName: '',
      customBatchNumber: '',
      enableCustomPage: false,
      customLogoUrl: '',
      additionalInfo: '',
    },
  });

  // Helper function to generate HTML for printable labels
 const generatePrintableLabelsHTML = (codes: GeneratedCode[]) => {
  let html = `<div class="sheet">`;

  codes.forEach(code => {
    html += `
      <div class="card">
        <div class="top">
          <img src="${code.qrCodeImage}" class="qr "/>

          <div class="right">
            <div class="headline font-headerAlt">SCAN THE QR TO<br/>AUTHENTICATE</div>
            <div class="site">www.emboditrust.com</div>
          </div>
        </div>

        <div class="scratch">Scratch the coating for verification</div>

        <div class="scratch-code">
          ${code.scratchCode.replace(/-/g, "")}
        </div>

        <div class="bottom">
          <div class="brand-block">
            <div class="brand">Embodiment</div>
            <div class="sub">Healthcare Authentication</div>
          </div>

          <div class="phone">
            <span class="phone-icon">📞</span>
            08127910984
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  return html;
};


  const generateCodes = async (data: GenerationFormData) => {
    if (!client) {
      toast.error('Client not found');
      return;
    }

    setLoading(true);
    const startTime = Date.now();
    
    try {
      // Check if client is active
      if (client.status !== 'active') {
        toast.error(`Client is ${client.status}. Please activate the client first.`);
        return;
      }

      // Check monthly limit
      if (client.codesGenerated + data.quantity > client.monthlyLimit) {
        toast.error(`Monthly limit exceeded. Available: ${client.monthlyLimit - client.codesGenerated} codes`);
        return;
      }

      const response = await fetch('/api/admin/generate/qr-scratch', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          clientId: client.clientId,
          companyName: client.companyName,
          manufacturerId: client.manufacturerId,
          brandPrefix: client.brandPrefix,
          clientLogoUrl: client.logoUrl,
          includeImages: true,
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setGeneratedCodes(result.codes || []);
        setBatchId(result.batchId);
        setGenerationStats({
          total: result.totalGenerated || 0,
          timeTaken: Math.round((Date.now() - startTime) / 1000),
          qrSize: '500x500',
        });
        
        toast.success(`${result.totalGenerated} QR codes generated for ${client.companyName}`, {
          description: `Batch ID: ${result.batchId}`
        });
        
        // Auto-download CSV
        if (result.csvContent) {
          const blob = new Blob([result.csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `qr-codes-${result.batchId}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          toast.info('CSV file downloaded automatically');
        }
      } else {
        toast.error(result.message || result.error || 'Generation failed');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error('Network error or server unavailable');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (generatedCodes.length === 0) {
      toast.error('No codes to download');
      return;
    }

    const csvRows = [
      ['Index', 'QR Code ID', 'Scratch Code', 'Product Name', 'Company', 'Manufacturer ID', 'Batch ID', 'Verification URL'],
      ...generatedCodes.map((code) => [
        code.index,
        code.qrCodeId,
        code.scratchCode,
        code.productName,
        code.companyName,
        code.manufacturerId,
        code.batchId,
        code.verificationUrl
      ])
    ];

    const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-codes-${batchId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('CSV file downloaded');
  };

  const downloadQRCodeImages = async () => {
    if (generatedCodes.length === 0) {
      toast.error('No QR code images to download');
      return;
    }

    toast.info('Preparing QR code images for download...');
    
    // Simple download for first image (for demo)
    // In production, you'd want to use a zip library
    const code = generatedCodes[0];
    if (code?.qrCodeImage) {
      const link = document.createElement('a');
      link.href = code.qrCodeImage;
      link.download = `qr-${code.qrCodeId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR code image downloaded');
    }
  };

  const printQRCodeSheet = () => {
    if (generatedCodes.length === 0) {
      toast.error('No codes to print');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print');
      return;
    }

    const labelsHtml = generatePrintableLabelsHTML(generatedCodes);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Labels - ${batchId}</title>
        <meta charset="UTF-8">
        <style>
         @page {
  size: A4;
  margin: 10mm;
}

body {
  margin: 0;
  font-family: Outfit, Helvetica, sans-serif;
}

/* Grid of horizontal cards */
.sheet {
  display: grid;
  grid-template-columns: repeat(2, 95mm);
  grid-auto-rows: 50mm;
  gap: 10mm;
  justify-content: center;
}

/* Card */
.card {
  border-radius: 14px;
  border: 2px solid #e3e3e3;
  padding: 12px 14px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: white;
}

/* Top */
.top {
  display: flex;
  gap: 12px;
  align-items: center;
}

.qr {
  width: 68px;
  height: 68px;
}

/* Right block */
.headline {
  font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  font-weight: 900;
  font-size: 18px;
  line-height: 1.05;
  letter-spacing: 0.5px;
  color: #0b1435;
}

.site {
  margin-top: 6px;
  font-size: 13px;
  color: #5f6275;
}

/* Scratch bar */
.scratch {
  background: #8b8fa3;
  color: white;
  text-align: center;
  padding: 8px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
}

/* Scratch code */
.scratch-code {
  font-family: "Courier New", monospace;
  font-size: 14px;
  letter-spacing: 3px;
  text-align: center;
  padding: 6px 0;
  border: 1px dashed #aaa;
  border-radius: 8px;
}

/* Bottom */
.bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  font-family: Georgia, "Times New Roman", serif;
  font-weight: 700;
  font-size: 18px;
  color: #0b2b55;
}

.sub {
  font-family: "Segoe UI", Arial, sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #000;
}

.phone {
  font-family: "Segoe UI", Arial, sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #0b1435;
  display: flex;
  align-items: center;
  gap: 6px;
}

.phone-icon {
  font-size: 18px;
}


        </style>
      </head>
      <body>
        <div class="header">
          <h1>Authentication Labels - ${client?.companyName || 'Client'}</h1>
          <p>Product: ${form.getValues('productName')} | Batch: ${batchId} | Generated: ${new Date().toLocaleDateString()}</p>
          <p>Total Labels: ${generatedCodes.length} | Print Date: ${new Date().toLocaleString()}</p>
        </div>
        
        ${labelsHtml}
        
        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
              setTimeout(() => {
                window.close();
              }, 500);
            }, 500);
          };
          
          window.addEventListener('afterprint', function() {
            setTimeout(() => {
              window.close();
            }, 1000);
          });
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  const exportAsPDF = () => {
    if (generatedCodes.length === 0) {
      toast.error('No codes to export');
      return;
    }

    toast.info('Opening PDF preview window...');
    
    const pdfWindow = window.open('', '_blank');
    if (!pdfWindow) {
      toast.error('Please allow popups to export PDF');
      return;
    }

    const labelsHtml = generatePrintableLabelsHTML(generatedCodes);

    pdfWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>PDF Export - ${batchId}</title>
        <meta charset="UTF-8">
        <style>
         @page {
  size: A4;
  margin: 10mm;
}

body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
}

/* Grid of horizontal cards */
.sheet {
  display: grid;
  grid-template-columns: repeat(2, 95mm);
  grid-auto-rows: 50mm;
  gap: 10mm;
  justify-content: center;
}

/* Card */
.card {
  border-radius: 14px;
  border: 2px solid #e3e3e3;
  padding: 12px 14px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: white;
}

/* Top */
.top {
  display: flex;
  gap: 12px;
  align-items: center;
}

.qr {
  width: 68px;
  height: 68px;
}

/* Right block */
.headline {
  font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  font-weight: 900;
  font-size: 18px;
  line-height: 1.05;
  letter-spacing: 0.5px;
  color: #0b1435;
}

.site {
  margin-top: 6px;
  font-size: 13px;
  color: #5f6275;
}

/* Scratch bar */
.scratch {
  background: #8b8fa3;
  color: white;
  text-align: center;
  padding: 8px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
}

/* Scratch code */
.scratch-code {
  font-family: "Courier New", monospace;
  font-size: 14px;
  letter-spacing: 3px;
  text-align: center;
  padding: 6px 0;
  border: 1px dashed #aaa;
  border-radius: 8px;
}

/* Bottom */
.bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  font-family: Georgia, "Times New Roman", serif;
  font-weight: 700;
  font-size: 18px;
  color: #0b2b55;
}

.sub {
  font-family: "Segoe UI", Arial, sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #000;
}

.phone {
  font-family: "Segoe UI", Arial, sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #0b1435;
  display: flex;
  align-items: center;
  gap: 6px;
}

.phone-icon {
  font-size: 18px;
}

        </style>
      </head>
      <body>
        <div class="controls">
          <h3>Export Options</h3>
          <button onclick="window.print()">💾 Save as PDF</button>
          <button onclick="window.print()" class="secondary">🖨️ Print</button>
          <button onclick="window.close()" class="secondary">✕ Close</button>
          <p style="font-size: 11px; margin-top: 10px; color: #666;">
            Click "Save as PDF" and choose "Save as PDF" in the print dialog.
          </p>
        </div>
        
        <div class="header">
          <h1>Authentication Labels - ${client?.companyName || 'Client'}</h1>
          <p>Product: ${form.getValues('productName')} | Batch: ${batchId}</p>
          <p>Total Labels: ${generatedCodes.length} | Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        ${labelsHtml}
      </body>
      </html>
    `);

    pdfWindow.document.close();
    toast.success('PDF preview opened. Use "Save as PDF" in the print dialog.');
  };

  const exportAsImageLabels = () => {
    if (generatedCodes.length === 0) {
      toast.error('No codes to export');
      return;
    }

    toast.info('Generating printable label sheet...');
    
    const labelWindow = window.open('', '_blank');
    if (!labelWindow) {
      toast.error('Please allow popups to export labels');
      return;
    }

    const labelsHtml = generatePrintableLabelsHTML(generatedCodes);

    labelWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Labels - ${batchId}</title>
        <meta charset="UTF-8">
        <style>
       @page {
  size: A4;
  margin: 10mm;
}

body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
}

/* Grid of horizontal cards */
.sheet {
  display: grid;
  grid-template-columns: repeat(2, 95mm);
  grid-auto-rows: 50mm;
  gap: 10mm;
  justify-content: center;
}

/* Card */
.card {
  border-radius: 14px;
  border: 2px solid #e3e3e3;
  padding: 12px 14px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: white;
}

/* Top */
.top {
  display: flex;
  gap: 12px;
  align-items: center;
}

.qr {
  width: 68px;
  height: 68px;
}

/* Right block */
.headline {
  font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  font-weight: 900;
  font-size: 18px;
  line-height: 1.05;
  letter-spacing: 0.5px;
  color: #0b1435;
}

.site {
  margin-top: 6px;
  font-size: 13px;
  color: #5f6275;
}

/* Scratch bar */
.scratch {
  background: #8b8fa3;
  color: white;
  text-align: center;
  padding: 8px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
}

/* Scratch code */
.scratch-code {
  font-family: "Courier New", monospace;
  font-size: 14px;
  letter-spacing: 3px;
  text-align: center;
  padding: 6px 0;
  border: 1px dashed #aaa;
  border-radius: 8px;
}

/* Bottom */
.bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  font-family: Georgia, "Times New Roman", serif;
  font-weight: 700;
  font-size: 18px;
  color: #0b2b55;
}

.sub {
  font-family: "Segoe UI", Arial, sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #000;
}

.phone {
  font-family: "Segoe UI", Arial, sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #0b1435;
  display: flex;
  align-items: center;
  gap: 6px;
}

.phone-icon {
  font-size: 18px;
}


        </style>
      </head>
      <body>
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
          <h2 style="margin: 0 0 10px 0;">Authentication Labels - ${client?.companyName || 'Client'}</h2>
          <p style="margin: 5px 0; color: #666;">
            Product: ${form.getValues('productName')} | Batch: ${batchId}
          </p>
          <p style="margin: 5px 0; color: #666;">
            Generated: ${new Date().toLocaleDateString()} | Total: ${generatedCodes.length} labels
          </p>
        </div>
        
        ${labelsHtml}
        
        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
          <p>Print this page on A4 paper. Labels are formatted for 39.4mm x 45.7mm stickers.</p>
          <p>For best results, use 300 DPI printing and high-quality label paper.</p>
        </div>
        
        <script>
          // Instructions for user
          alert('Labels are ready. You can now:\\n1. Print this page (Ctrl+P)\\n2. Save as PDF\\n3. Take screenshots of individual labels');
          
          // Auto-open print dialog
          setTimeout(() => {
            if (confirm('Do you want to print the labels now?')) {
              window.print();
            }
          }, 1000);
        </script>
      </body>
      </html>
    `);

    labelWindow.document.close();
    toast.success('Label sheet generated. You can print or save as PDF.');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const refreshClientData = () => {
    fetchClient();
    toast.success('Client data refreshed');
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

  if (loadingClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading client information...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Client Not Found</h2>
          <p className="text-gray-600 mb-6">The client with ID {clientId} does not exist.</p>
          <Button onClick={() => router.push('/admin/generate')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Client Selection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => router.push('/admin/generate')}
            className="mb-4 pl-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Client Selection
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Generate QR Codes for {client.companyName}</h1>
          <p className="text-gray-500">
            Create QR + Scratch code pairs for {client.companyName}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshClientData}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Badge variant="outline" className="gap-2 px-4 py-2">
            <Building className="h-4 w-4" />
            {client.companyName}
            <Separator orientation="vertical" className="h-4 mx-2" />
            <Shield className="h-4 w-4" />
            {client.brandPrefix}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Generation Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Details Card */}
          <Card className="border-blue-100 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Client Information
              </CardTitle>
              <CardDescription>
                QR code generation for {client.companyName}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
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
                      <h4 className="font-bold text-lg">{client.companyName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="gap-1">
                          <Shield className="h-3 w-3" />
                          {client.brandPrefix}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <FileText className="h-3 w-3" />
                          {client.manufacturerId}
                        </Badge>
                        <Badge className={`${
                          client.status === 'active' ? 'bg-green-100 text-green-800' :
                          client.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        } gap-1 capitalize`}>
                          {client.status === 'active' ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : client.status === 'suspended' ? (
                            <AlertCircle className="h-3 w-3" />
                          ) : (
                            <Calendar className="h-3 w-3" />
                          )}
                          {client.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Monthly Limit</p>
                      <p className="font-medium">{client.monthlyLimit.toLocaleString()} codes</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Codes Generated</p>
                      <p className="font-medium">{client.codesGenerated.toLocaleString()} codes</p>
                    </div>
                  </div>
                  
                  <div>
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
                
                <div className="text-right">
                  <div className="text-sm text-gray-500">Available</div>
                  <div className="text-2xl font-bold text-green-600">
                    {(client.monthlyLimit - client.codesGenerated).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">codes remaining</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generation Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code Generation
              </CardTitle>
              <CardDescription>
                Configure and generate QR codes for {client.companyName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(generateCodes)} className="space-y-6">
                  {/* Generation Parameters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Number of Products
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={client.monthlyLimit - client.codesGenerated}
                              step={1}
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                              className="text-center text-lg"
                              disabled={loading}
                            />
                          </FormControl>
                          <FormDescription>
                            Each product gets 1 QR code + 1 scratch code
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customBatchNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Batch Number</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="e.g., BATCH-2024-Q4-001" 
                              disabled={loading}
                            />
                          </FormControl>
                          <FormDescription>
                            Optional custom identifier for this batch
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="productName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g., Paracetamol 500mg Tablets (100 count)" 
                            disabled={loading}
                          />
                        </FormControl>
                        <FormDescription>
                          Name of the pharmaceutical product
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Custom Success Page */}
                  <FormField
                    control={form.control}
                    name="enableCustomPage"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={loading}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-semibold">Enable Custom Verification Page</FormLabel>
                          <FormDescription>
                            Customize the verification success page with client branding
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch('enableCustomPage') && (
                    <div className="space-y-4 border rounded-xl p-6 bg-blue-50/50">
                      <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                        <Scan className="h-5 w-5" />
                        Custom Verification Page Settings
                      </h4>
                      <FormField
                        control={form.control}
                        name="customLogoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Logo URL</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input 
                                  {...field} 
                                  placeholder="https://client.com/logo.png" 
                                  disabled={loading}
                                />
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => toast.info('Upload to Cloudinary')}
                                  disabled={loading}
                                >
                                  Upload
                                </Button>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Custom logo for verification success page
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="additionalInfo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Information (JSON)</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder={`{
  "manufacturingDate": "2024-12-01",
  "expiryDate": "2026-12-01",
  "storageConditions": "Store below 25°C",
  "manufacturingSite": "Lagos Plant"
}`}
                                rows={4}
                                className="font-mono text-sm"
                                disabled={loading}
                              />
                            </FormControl>
                            <FormDescription>
                              Optional JSON data for verification page
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Generation Button */}
                  <Button 
                    type="submit" 
                    className="w-full py-6 text-lg" 
                    disabled={loading || client.status !== 'active' || form.getValues('quantity') <= 0}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                        <span className="flex flex-col items-start">
                          <span>Generating QR Codes...</span>
                          <span className="text-sm font-normal">
                            {form.getValues('quantity')} codes for {client.companyName}
                          </span>
                        </span>
                      </>
                    ) : (
                      <>
                        <QrCode className="h-5 w-5 mr-3" />
                        <span className="flex flex-col items-start">
                          <span>Generate QR + Scratch Codes</span>
                          <span className="text-sm font-normal">
                            {form.getValues('quantity')} products • {client.companyName}
                          </span>
                        </span>
                      </>
                    )}
                  </Button>

                  {client.status !== 'active' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-yellow-800">Client is {client.status}</p>
                          <p className="text-sm text-yellow-700">
                            You cannot generate QR codes for a {client.status} client. 
                            Please activate the client first.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Generated Codes Display */}
          {generatedCodes.length > 0 && (
            <Card className="border-2 border-green-100">
              <CardHeader className="bg-green-50/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <ImageIcon className="h-6 w-6" />
                      Generated QR Codes • Batch: <code className="font-mono bg-green-100 px-2 py-1 rounded">{batchId}</code>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <QrCode className="h-4 w-4" />
                        {generatedCodes.length} QR codes generated
                      </span>
                      <span className="flex items-center gap-1">
                        <Key className="h-4 w-4" />
                        {generatedCodes.length} matching scratch codes
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {generationStats.timeTaken}s generation time
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={showCodes ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowCodes(!showCodes)}
                      className="gap-2"
                    >
                      {showCodes ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          Hide Codes
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          Show Codes
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                      className="gap-2"
                    >
                      {viewMode === 'grid' ? (
                        <>
                          <List className="h-4 w-4" />
                          List View
                        </>
                      ) : (
                        <>
                          <Grid className="h-4 w-4" />
                          Grid View
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {showCodes ? (
                  <div className="space-y-6">
                    {/* QR Code Grid/List */}
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {generatedCodes.slice(0, 12).map((code) => (
                          <div key={code.qrCodeId} className="border rounded-xl p-4 bg-white shadow-sm">
                            <div className="text-center mb-3">
                              <img 
                                src={code.qrCodeImage} 
                                alt={`QR Code ${code.qrCodeId}`}
                                className="w-40 h-40 mx-auto border rounded-lg"
                              />
                              <p className="text-xs text-gray-500 mt-2">
                                Scan to verify authenticity
                              </p>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm font-medium text-gray-700">QR Code:</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => copyToClipboard(code.qrCodeId)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="font-mono text-sm bg-gray-50 p-2 rounded truncate">
                                  {code.qrCodeId}
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm font-medium text-gray-700">Scratch Code:</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => copyToClipboard(code.scratchCode)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="font-mono text-sm bg-yellow-50 p-2 rounded border border-yellow-200">
                                  {code.scratchCode}
                                </div>
                              </div>
                              <div className="text-xs text-gray-600 space-y-1">
                                <p><span className="font-medium">Product:</span> {code.productName}</p>
                                <p><span className="font-medium">Company:</span> {code.companyName}</p>
                                <p><span className="font-medium">Batch:</span> {code.batchId}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="p-3 text-left text-sm font-medium">#</th>
                              <th className="p-3 text-left text-sm font-medium">QR Code Image</th>
                              <th className="p-3 text-left text-sm font-medium">QR Code ID</th>
                              <th className="p-3 text-left text-sm font-medium">Scratch Code</th>
                              <th className="p-3 text-left text-sm font-medium">Product</th>
                              <th className="p-3 text-left text-sm font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {generatedCodes.slice(0, 10).map((code) => (
                              <tr key={code.qrCodeId} className="border-t hover:bg-gray-50">
                                <td className="p-3">{code.index}</td>
                                <td className="p-3">
                                  <img 
                                    src={code.qrCodeImage} 
                                    alt="QR Code"
                                    className="w-16 h-16 border rounded"
                                  />
                                </td>
                                <td className="p-3">
                                  <div className="font-mono text-sm">{code.qrCodeId}</div>
                                </td>
                                <td className="p-3">
                                  <div className="font-mono text-sm bg-yellow-50 p-2 rounded border border-yellow-200">
                                    {code.scratchCode}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="text-sm">{code.productName}</div>
                                  <div className="text-xs text-gray-500">{code.companyName}</div>
                                </td>
                                <td className="p-3">
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => copyToClipboard(code.qrCodeId)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => copyToClipboard(code.scratchCode)}
                                    >
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    {generatedCodes.length > 12 && (
                      <div className="text-center py-4 border-t">
                        <p className="text-gray-600">
                          Showing {viewMode === 'grid' ? '12' : '10'} of {generatedCodes.length} codes. 
                          <Button 
                            variant="link" 
                            className="ml-2"
                            onClick={() => toast.info(`Full list available in CSV download`)}
                          >
                            View all in CSV
                          </Button>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl">
                    <div className="relative inline-block mb-6">
                      <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <QrCode className="h-20 w-20 text-green-600" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center border-4 border-white">
                        <Key className="h-10 w-10 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {generatedCodes.length} Codes Generated Successfully!
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                      Your QR codes and scratch codes are ready for printing and packaging.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                      <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                        <div className="text-2xl font-bold text-green-600">{generatedCodes.length}</div>
                        <div className="text-sm text-gray-600">QR Codes</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">{generatedCodes.length}</div>
                        <div className="text-sm text-gray-600">Scratch Codes</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                        <div className="text-2xl font-bold text-purple-600">{generationStats.timeTaken}s</div>
                        <div className="text-sm text-gray-600">Generation Time</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setShowCodes(true)}
                      className="gap-2"
                    >
                      <Eye className="h-5 w-5" />
                      Preview Generated Codes
                    </Button>
                  </div>
                )}
                
                {/* Export Actions */}
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-4 text-lg flex items-center gap-2">
                    <FileDown className="h-5 w-5" />
                    Export Options
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Button onClick={downloadCSV} className="gap-2 h-auto py-4" variant="outline">
                      <FileText className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-semibold">Download CSV</div>
                        <div className="text-sm text-gray-500">Spreadsheet data</div>
                      </div>
                    </Button>
                    <Button onClick={printQRCodeSheet} className="gap-2 h-auto py-4" variant="outline">
                      <Printer className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-semibold">Print Labels</div>
                        <div className="text-sm text-gray-500">Printable sheet</div>
                      </div>
                    </Button>
                    <Button onClick={exportAsPDF} className="gap-2 h-auto py-4" variant="outline">
                      <FileDown className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-semibold">Export PDF</div>
                        <div className="text-sm text-gray-500">Printable labels PDF</div>
                      </div>
                    </Button>
                    <Button onClick={exportAsImageLabels} className="gap-2 h-auto py-4" variant="outline">
                      <FileImage className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-semibold">Export Labels</div>
                        <div className="text-sm text-gray-500">Image labels sheet</div>
                      </div>
                    </Button>
                    <Button onClick={downloadQRCodeImages} className="gap-2 h-auto py-4" variant="outline">
                      <ImageIcon className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-semibold">Download Images</div>
                        <div className="text-sm text-gray-500">QR code images</div>
                      </div>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Instructions */}
        <div className="space-y-6">
          {/* Generation Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generation Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h5 className="font-medium text-gray-700">QR Code Specifications</h5>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                    Size: 500x500 pixels (2x2 cm when printed)
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                    Format: High-resolution PNG
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                    Error correction: Level H (30% recovery)
                  </li>
                </ul>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h5 className="font-medium text-gray-700">Scratch Code Format</h5>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></div>
                    12 characters: XXX-XXX-XXX-XXX
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></div>
                    Alphanumeric, uppercase only
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></div>
                    No ambiguous characters (0/O, 1/I/L)
                  </li>
                </ul>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h5 className="font-medium text-gray-700">Printing Requirements</h5>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></div>
                    Minimum 300 DPI for QR codes
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></div>
                    Use scratch-off labels for codes
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></div>
                    Tamper-evident packaging recommended
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Quick Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/admin/clients/${clientId}`}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Building className="h-4 w-4" />
                  Back to Client Details
                </Button>
              </Link>
              <Link href={`/admin/clients/${clientId}/edit`}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Client Information
                </Button>
              </Link>
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
                onClick={() => copyToClipboard(client.brandPrefix)}
              >
                <Shield className="h-4 w-4" />
                Copy Brand Prefix
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}