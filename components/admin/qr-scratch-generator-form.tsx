"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, QrCode, Key, Download, Eye, EyeOff, Printer, Image as ImageIcon, FileText, Package, Building, Scan } from "lucide-react";
import { z } from "zod";

const productSchema = z.object({
  quantity: z.number()
    .min(1, 'Minimum 1 product')
    .max(10000, 'Maximum 10,000 products per batch'),
  productName: z.string().min(1, 'Product name required').max(200),
  companyName: z.string().min(1, 'Company name required').max(200),
  manufacturerId: z.string().min(1, 'Manufacturer ID required').max(50),
  brandPrefix: z.string().length(3, '3-character brand prefix required').regex(/^[A-Z]+$/, 'Must be uppercase letters'),
  enableCustomPage: z.boolean(),
  customLogoUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
  customBatchNumber: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function QRScratchGeneratorForm() {
  const [generatedCodes, setGeneratedCodes] = useState<any[]>([]);
  const [printableHtml, setPrintableHtml] = useState<string>('');
  const [showCodes, setShowCodes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [batchId, setBatchId] = useState<string>('');
  const [generationStats, setGenerationStats] = useState({
    total: 0,
    timeTaken: 0,
    qrSize: '500x500',
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      quantity: 100,
      productName: '',
      companyName: '',
      manufacturerId: '',
      brandPrefix: 'EMB',
      enableCustomPage: false,
      customLogoUrl: '',
      customBatchNumber: '',
      additionalInfo: '',
    },
  });

  const generateCodes = async (data: ProductFormData) => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/admin/generate/qr-scratch', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          qrCodeSize: 500,
          includeImages: true,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setGeneratedCodes(result.codes || []);
        setPrintableHtml(result.printableHtml || '');
        setBatchId(result.batchId);
        setGenerationStats({
          total: result.totalGenerated || 0,
          timeTaken: Math.round((Date.now() - startTime) / 1000),
          qrSize: '500x500',
        });
        
        toast.success(`${result.totalGenerated || result.codes?.length || 0} QR + Scratch codes generated successfully!`, {
          description: `Batch ID: ${result.batchId}`
        });
        
        // Auto-download CSV if requested
        if (result.csvContent) {
          const blob = new Blob([result.csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `qr-scratch-codes-${result.batchId}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          toast.info('CSV file downloaded automatically');
        }
      } else {
        toast.error(result.message || 'Generation failed', {
          description: result.error || 'Please try again'
        });
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error('Network error or server unavailable', {
        description: error.message || 'Check your connection and try again'
      });
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
      ['Index', 'QR Code ID', 'Scratch Code', 'Product Name', 'Company', 'Manufacturer ID', 'Batch ID', 'Verification URL', 'Generation Date'],
      ...generatedCodes.map((code, index) => [
        index + 1,
        code.qrCodeId,
        code.scratchCode,
        form.getValues('productName'),
        form.getValues('companyName'),
        form.getValues('manufacturerId'),
        batchId,
        `${window.location.origin}/verify/${code.qrCodeId}`,
        new Date().toISOString()
      ])
    ];

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emboditrust-codes-${batchId}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('CSV file downloaded', {
      description: `File: emboditrust-codes-${batchId}.csv`
    });
  };

  const printQRCodeSheet = () => {
    if (!printableHtml) {
      toast.error('No printable content available');
      return;
    }
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print');
      return;
    }
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code Labels - Batch ${batchId}</title>
        <meta charset="UTF-8">
        <style>
          ${printableHtml.includes('<style>') ? '' : `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            .page { page-break-after: always; padding: 0.5in; }
            .label-grid { display: grid; grid-template-columns: repeat(3, 2.5in); gap: 0.2in; }
            .label { 
              width: 2.5in; 
              height: 1.5in; 
              border: 1px dashed #ccc; 
              padding: 12px; 
              text-align: center; 
              position: relative;
              background: white;
            }
            .qr-container { margin: 0 auto 8px; width: 80px; height: 80px; }
            .qr-container img { width: 100%; height: 100%; }
            .code-info { font-family: 'Courier New', monospace; font-size: 9px; line-height: 1.3; }
            .product-info { font-size: 8px; color: #666; margin-top: 4px; }
            .batch-info { 
              position: absolute; 
              bottom: 4px; 
              left: 0; 
              right: 0; 
              font-size: 7px; 
              color: #999; 
            }
            .cut-line { border-top: 1px dashed #999; margin-top: 4px; }
            @media print {
              .page { padding: 0; }
              .label { border: 1px solid #ccc; }
              .cut-line { display: none; }
            }
          `}
        </style>
      </head>
      <body>
        ${printableHtml}
        <script>
          window.onload = function() {
            window.focus();
            window.print();
            setTimeout(function() {
              window.close();
            }, 1000);
          };
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const downloadQRCodeImages = async () => {
    if (generatedCodes.length === 0) {
      toast.error('No QR code images to download');
      return;
    }

    toast.info('Preparing QR code images for download...', {
      description: 'This may take a moment for large batches'
    });

    try {
      // Create zip of all QR code images
      const response = await fetch('/api/admin/download/qr-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batchId,
          codes: generatedCodes.slice(0, 100), // Limit to first 100 for performance
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr-codes-${batchId}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast.success('QR code images downloaded', {
          description: 'Check your downloads folder'
        });
      } else {
        toast.error('Failed to download images');
      }
    } catch (error) {
      toast.error('Error downloading images');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.info('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-blue-600" />
            Generate Printable QR + Scratch Codes
          </CardTitle>
          <CardDescription>
            Create actual QR code images paired with scratch codes for printing and packaging
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(generateCodes)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Quantity */}
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Quantity
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={10000}
                          step={1}
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                          className="text-center"
                        />
                      </FormControl>
                      <FormDescription>
                        Number of product units
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Brand Prefix */}
                <FormField
                  control={form.control}
                  name="brandPrefix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Prefix</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EMB">EMB - EmbodiTrust</SelectItem>
                          <SelectItem value="GSK">GSK - GlaxoSmithKline</SelectItem>
                          <SelectItem value="PZ">PZ - PZ Cussons</SelectItem>
                          <SelectItem value="FID">FID - Fidson</SelectItem>
                          <SelectItem value="MAY">MAY - May & Baker</SelectItem>
                          <SelectItem value="BIO">BIO - Biogaran</SelectItem>
                          <SelectItem value="SAN">SAN - Sanofi</SelectItem>
                          <SelectItem value="NOV">NOV - Novartis</SelectItem>
                          <SelectItem value="ROC">ROC - Roche</SelectItem>
                          <SelectItem value="AST">AST - AstraZeneca</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        3-character identifier
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Product Name */}
                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g., Paracetamol 500mg Tablets (100 count)" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Name */}
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Company Name
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g., EmbodiTrust Pharmaceuticals Ltd." 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Manufacturer ID */}
                <FormField
                  control={form.control}
                  name="manufacturerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacturer ID</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g., MFG-NG-2024-001" 
                        />
                      </FormControl>
                      <FormDescription>
                        Unique manufacturer identifier
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-semibold">Enable Custom Verification Page</FormLabel>
                      <FormDescription>
                        Customize the verification success page with company branding
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customLogoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Logo URL</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input 
                                {...field} 
                                placeholder="https://yourcompany.com/logo.png" 
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => toast.info('Cloudinary uploader would open here')}
                              >
                                Upload
                              </Button>
                            </div>
                          </FormControl>
                          <FormDescription>
                            URL to company logo (PNG/JPEG, max 2MB)
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
                            />
                          </FormControl>
                          <FormDescription>
                            Optional custom batch identifier
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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
  "manufacturingSite": "Lagos Plant",
  "nafdacNumber": "NAFDAC-REG-12345"
}`}
                            rows={4}
                            className="font-mono text-sm"
                          />
                        </FormControl>
                        <FormDescription>
                          Optional JSON data displayed on verification page
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Generation Button */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full py-6 text-lg" 
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                      <span className="flex flex-col items-start">
                        <span>Generating QR Codes & Scratch Codes...</span>
                        <span className="text-sm font-normal">This may take a moment</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <QrCode className="h-5 w-5 mr-3" />
                      <span className="flex flex-col items-start">
                        <span>Generate Printable Product Codes</span>
                        <span className="text-sm font-normal">{form.watch('quantity')} units • QR + Scratch pairs</span>
                      </span>
                    </>
                  )}
                </Button>
              </div>
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
                <Button variant="outline" size="sm" onClick={downloadCSV} className="gap-2">
                  <Download className="h-4 w-4" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={printQRCodeSheet} className="gap-2">
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline" size="sm" onClick={downloadQRCodeImages} className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Images
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {showCodes ? (
              <div className="space-y-6">
                {/* QR Code Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {generatedCodes.slice(0, 12).map((code, index) => (
                    <div key={code.qrCodeId} className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-center mb-3">
                        <div className="relative inline-block">
                          <img 
                            src={code.qrCodeImage || '/placeholder-qr.png'} 
                            alt={`QR Code ${code.qrCodeId}`}
                            className="w-40 h-40 mx-auto border rounded-lg"
                          />
                          <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            #{index + 1}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Scan to verify authenticity
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">QR Code ID:</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(code.qrCodeId)}
                            >
                              <FileText className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="font-mono text-sm bg-gray-50 p-2 rounded">
                            {code.qrCodeId}
                          </p>
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
                              <FileText className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="font-mono text-sm bg-yellow-50 p-2 rounded border border-yellow-200">
                            {code.scratchCode}
                          </p>
                        </div>
                        <div className="text-xs text-gray-600">
                          <p><span className="font-medium">Product:</span> {form.getValues('productName')}</p>
                          <p><span className="font-medium">URL:</span> {window.location.origin}/verify/{code.qrCodeId}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {generatedCodes.length > 12 && (
                  <div className="text-center py-4 border-t">
                    <p className="text-gray-600">
                      Showing 12 of {generatedCodes.length} codes. 
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
            
            {/* Production Instructions */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-4 text-lg flex items-center gap-2">
                <Printer className="h-5 w-5" />
                Production & Packaging Instructions
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border">
                    <h5 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-sm">1</span>
                      Printing Requirements
                    </h5>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                        Use 300 DPI minimum for QR code printing
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                        Print on durable, tamper-resistant labels
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                        QR code size: Minimum 1x1 inch (2.5x2.5 cm)
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                        Use scratch-off labels for scratch codes
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border">
                    <h5 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-sm">2</span>
                      Packaging Application
                    </h5>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                        Apply QR code to visible location on packaging
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                        Place scratch code under scratch panel
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                        Ensure no damage to QR code during application
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                        Use tamper-evident seal over scratch panel
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border">
                    <h5 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-sm">3</span>
                      Quality Control Checks
                    </h5>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5"></div>
                        Scan each QR code before packaging
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5"></div>
                        Verify scratch code is readable after scratching
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5"></div>
                        Check for printing defects or smudging
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5"></div>
                        Test verification process end-to-end
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border">
                    <h5 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-sm">4</span>
                      Security Protocols
                    </h5>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
                        Store printed labels in secure location
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
                        Destroy misprinted or defective labels
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
                        Maintain batch reconciliation records
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
                        Limit access to code generation system
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Download Actions */}
              <div className="mt-6 pt-6 border-t border-blue-200">
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button onClick={downloadCSV} className="gap-2" variant="default">
                    <Download className="h-4 w-4" />
                    Download Complete CSV
                  </Button>
                  <Button onClick={printQRCodeSheet} className="gap-2" variant="outline">
                    <Printer className="h-4 w-4" />
                    Print Label Sheets
                  </Button>
                  <Button onClick={downloadQRCodeImages} className="gap-2" variant="outline">
                    <ImageIcon className="h-4 w-4" />
                    Download QR Code Images
                  </Button>
                  <Button 
                    onClick={() => copyToClipboard(batchId)} 
                    className="gap-2" 
                    variant="secondary"
                  >
                    <FileText className="h-4 w-4" />
                    Copy Batch ID
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}