'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner'; // Add sonner for toasts
import { 
  Check, X, Shield, Package, Upload, Menu, 
  Scan, AlertTriangle, Clock, MapPin, Mail, Phone, 
  Info, Camera, ArrowRight, Home, Key, Image as ImageIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
  verificationData: any;
  qrCodeId: string;
  scratchCodeParam?: string;
}

export default function VerificationClientPage({
  verificationData,
}: Props) {
  const router = useRouter();

  if (!verificationData || !verificationData.productCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading verification...</p>
        </div>
      </div>
    );
  }

  const productCode = verificationData.productCode;

  /* ================= STATE ================= */
  const [showScratchDialog, setShowScratchDialog] = useState(true);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showNotAuthenticDialog, setShowNotAuthenticDialog] = useState(false);
  const [showFakeReportDialog, setShowFakeReportDialog] = useState(false);

  const [scratchCodeInput, setScratchCodeInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCount, setVerificationCount] = useState(0);

  const [reportData, setReportData] = useState({
    email: '', // Changed from reporterEmail to match API
    phone: '', // Changed from reporterPhone to match API
    purchaseLocation: '',
    additionalInfo: '',
    productPhoto: null as File | null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  /* ================= REPORT UNLOCK TIMER ================= */
  const [reportUnlockTimer, setReportUnlockTimer] = useState(0);
  const unlockRef = useRef<NodeJS.Timeout | null>(null);

  /* ================= HANDLE DIALOG CLOSE ================= */
  const handleDialogClose = (open: boolean, setter: (open: boolean) => void) => {
    if (!open) {
      router.push('/');
    }
    setter(open);
  };

  const handleXClick = () => {
    router.push('/');
  };

  /* ================= VERIFY ================= */
  const verifyScratchCode = async () => {
    const sanitizedInput = scratchCodeInput.trim().toUpperCase().replace(/\s/g, '');
    
    if (sanitizedInput.length !== 12) {
      toast.error('Please enter a valid 12-digit scratch code');
      return;
    }

    if (!/^[A-Z0-9]{12}$/.test(sanitizedInput)) {
      toast.error('Scratch code must be exactly 12 characters (letters or numbers)');
      return;
    }

    setIsVerifying(true);

    try {
      if (sanitizedInput !== productCode.scratchCode.toUpperCase()) {
        setShowScratchDialog(false);
        setShowNotAuthenticDialog(true);
        return;
      }

      const res = await fetch('/api/verify/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCodeId: productCode.qrCodeId }),
      });

      const data = await res.json();
      setVerificationCount(data.verificationCount);
      setShowScratchDialog(false);
      setShowSuccessDialog(true);

      if (data.verificationCount > 1) {
        setReportUnlockTimer(5);
        unlockRef.current = setInterval(() => {
          setReportUnlockTimer(prev => {
            if (prev <= 1) {
              clearInterval(unlockRef.current!);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }

    } catch (error) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  /* ================= IMAGE UPLOAD ================= */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setReportData({ ...reportData, productPhoto: file });
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setReportData({ ...reportData, productPhoto: null });
  };

  /* ================= REPORT ================= */
  const submitFakeReport = async () => {
    // Validate at least one contact method
    if (!reportData.email.trim() && !reportData.phone.trim()) {
      toast.error('Please provide either email or phone number');
      return;
    }

    if (!reportData.purchaseLocation.trim()) {
      toast.error('Purchase location is required');
      return;
    }

    setIsSubmittingReport(true);

    try {
      const formData = new FormData();
      formData.append('productName', productCode.productName);
      formData.append('qrCodeId', productCode.qrCodeId);
      formData.append('scratchCode', productCode.scratchCode);
      
      // Use correct field names that match the API
      if (reportData.email.trim()) formData.append('email', reportData.email.trim());
      if (reportData.phone.trim()) formData.append('phone', reportData.phone.trim());
      
      formData.append('purchaseLocation', reportData.purchaseLocation.trim());
      if (reportData.additionalInfo.trim()) {
        formData.append('additionalInfo', reportData.additionalInfo.trim());
      }
      if (reportData.productPhoto) {
        formData.append('productPhoto', reportData.productPhoto);
      }
      // Add current date as purchase date
      formData.append('purchaseDate', new Date().toISOString());

      const res = await fetch('/api/reports/fake-product', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Report submission failed');
      }

      if (data.success) {
        toast.success('Report submitted successfully! Thank you for helping combat counterfeits.', {
          duration: 5000,
        });
        
        // Reset form data
        setReportData({
          email: '',
          phone: '',
          purchaseLocation: '',
          additionalInfo: '',
          productPhoto: null,
        });
        setImagePreview(null);
        
        setShowFakeReportDialog(false);
        router.push('/');
      } else {
        throw new Error(data.message || 'Report submission failed');
      }

    } catch (error) {
      console.error('Report submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  /* ================= FORMAT SCRATCH CODE INPUT ================= */
  const handleScratchCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 12) {
      setScratchCodeInput(value);
    }
  };

  const formatScratchCode = (code: string) => {
    if (code.length <= 4) return code;
    if (code.length <= 8) return `${code.slice(0, 4)}-${code.slice(4)}`;
    return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-cyan-50 rounded-lg">
              <Shield className="h-6 w-6 text-cyan-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">Emboditrust</div>
              <div className="text-xs text-gray-500">Product Verification</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Scan className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">QR Scan</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Only show product info after successful verification */}
        {showSuccessDialog && (
          <Card className="mb-6 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-gray-900">Verified Product</CardTitle>
                <Badge variant="outline" className="font-normal">
                  #{productCode.qrCodeId.slice(-8)}
                </Badge>
              </div>
              <CardDescription className="text-gray-600">
                Product authenticity has been successfully verified
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-500">Product Name</Label>
                    <p className="text-sm font-medium text-gray-900">{productCode.productName}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-500">Manufacturer</Label>
                    <p className="text-sm font-medium text-gray-900">{productCode.companyName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-500">Batch ID</Label>
                    <p className="text-sm font-medium text-gray-900">{productCode.batchId}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-500">Scans</Label>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{verificationCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scratch Code Dialog */}
        <Dialog open={showScratchDialog} onOpenChange={(open) => handleDialogClose(open, setShowScratchDialog)}>
          <DialogContent className="sm:max-w-md border-0 shadow-xl" onPointerDownOutside={(e) => e.preventDefault()}>
            <button
              onClick={handleXClick}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
            <DialogHeader className="space-y-4">
              <div className="mx-auto p-3 bg-cyan-50 rounded-full w-16 h-16 flex items-center justify-center">
                <Key className="h-8 w-8 text-cyan-600" />
              </div>
              <div>
                <DialogTitle className="text-center text-xl text-gray-900">
                  Enter Scratch Code
                </DialogTitle>
                <DialogDescription className="text-center text-gray-600 mt-2">
                  Enter the 12-digit code from the scratch panel to verify authenticity
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="scratch-code" className="text-sm font-medium text-gray-700">
                  12-Digit Scratch Code
                </Label>
                <div className="relative">
                  <Input
                    id="scratch-code"
                    value={formatScratchCode(scratchCodeInput)}
                    onChange={handleScratchCodeChange}
                    className="text-center text-lg font-mono tracking-widest h-12 border-2 border-gray-200 focus:border-cyan-500 pl-12 pr-12"
                    placeholder="XXXX-XXXX-XXXX"
                    maxLength={14}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                    {scratchCodeInput.length}/12
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Enter the 12-character code exactly as shown on the product
                </p>
              </div>

              <Button
                onClick={verifyScratchCode}
                disabled={isVerifying || scratchCodeInput.length !== 12}
                className="w-full h-12 bg-cyan-600 hover:bg-cyan-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Authenticity
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={(open) => handleDialogClose(open, setShowSuccessDialog)}>
          <DialogContent className="sm:max-w-xl border-0 shadow-xl" onPointerDownOutside={(e) => e.preventDefault()}>
            <button
              onClick={handleXClick}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
            <div className="space-y-6">
              {/* Success Header */}
              <div className="text-center space-y-4">
                <div className="mx-auto p-3 bg-green-50 rounded-full w-16 h-16 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 px-4 py-1.5 text-sm font-medium mb-4">
                    ✅ Verified Authentic
                  </Badge>
                  <DialogTitle className="text-xl text-gray-900 mt-4">
                    Genuine Product Verified
                  </DialogTitle>
                  <DialogDescription className="text-gray-600">
                    This product has been successfully verified as authentic
                  </DialogDescription>
                </div>
              </div>

              {/* Verification Details */}
              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-900">
                    Verification Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Total Scans</div>
                      <div className="text-2xl font-bold text-gray-900">{verificationCount}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Status</div>
                      <div className="text-lg font-bold text-green-600">Authentic</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Your Scan</div>
                      <div className="text-sm font-medium text-gray-900">Now</div>
                    </div>
                  </div>

                  {verificationCount > 1 && (
                    <div className="space-y-3">
                      <Separator />
                      <div className="flex items-start space-x-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-amber-800">
                            Previously Scanned {verificationCount - 1} Time(s)
                          </p>
                          <p className="text-amber-700 mt-1">
                            This product has been verified before. If you suspect this might be a counterfeit, you can report it.
                          </p>
                        </div>
                      </div>

                      {reportUnlockTimer > 0 ? (
                        <div className="text-center space-y-2">
                          <Progress value={(5 - reportUnlockTimer) * 20} className="h-2" />
                          <p className="text-sm text-gray-600">
                            Report option available in <span className="font-bold">{reportUnlockTimer}s</span>
                          </p>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
                          onClick={() => setShowFakeReportDialog(true)}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Report Suspected Counterfeit
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Back to Home Button */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleBackToHome}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Not Authentic Dialog */}
        <Dialog open={showNotAuthenticDialog} onOpenChange={(open) => handleDialogClose(open, setShowNotAuthenticDialog)}>
          <DialogContent className="sm:max-w-md border-0 shadow-xl" onPointerDownOutside={(e) => e.preventDefault()}>
            <button
              onClick={handleXClick}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
            <div className="text-center space-y-6">
              <div className="mx-auto p-3 bg-red-50 rounded-full w-16 h-16 flex items-center justify-center">
                <X className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <Badge className="bg-red-100 text-red-800 hover:bg-red-100 px-4 py-1.5 text-sm font-medium mb-4">
                  ❌ Not Authentic
                </Badge>
                <DialogTitle className="text-xl text-gray-900">
                  Verification Failed
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-2">
                  The scratch code entered does not match our records. This product may be counterfeit.
                </DialogDescription>
              </div>
              
              <Button
                onClick={handleBackToHome}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              >
                Back to Home
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Report Dialog with Scroll Area */}
        <Dialog open={showFakeReportDialog} onOpenChange={(open) => handleDialogClose(open, setShowFakeReportDialog)}>
          <DialogContent className="sm:max-w-lg border-0 shadow-xl max-h-[85vh] p-0 overflow-hidden" onPointerDownOutside={(e) => e.preventDefault()}>
            <button
              onClick={handleXClick}
              className="absolute right-4 top-4 z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
            <ScrollArea className="h-[400px] w-full">
              <DialogHeader className="px-6 pt-6 pb-4 border-b">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl text-gray-900">Report Suspected Counterfeit</DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Help us fight counterfeits by providing details
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-6">
                  {/* Product Summary */}
                  <Card className="bg-gray-50 border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-900">
                        Product Being Reported
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-500">Product</Label>
                          <p className="text-sm font-medium">{productCode.productName}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Manufacturer</Label>
                          <p className="text-sm font-medium">{productCode.companyName}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-500">Batch ID</Label>
                          <p className="text-sm font-medium">{productCode.batchId}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Code Entered</Label>
                          <p className="text-sm font-mono bg-white px-2 py-1 rounded border">
                            {formatScratchCode(scratchCodeInput)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                          <Mail className="inline h-4 w-4 mr-1 text-gray-500" />
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={reportData.email}
                          onChange={(e) =>
                            setReportData({ ...reportData, email: e.target.value })
                          }
                          className="border-gray-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                          <Phone className="inline h-4 w-4 mr-1 text-gray-500" />
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={reportData.phone}
                          onChange={(e) =>
                            setReportData({ ...reportData, phone: e.target.value })
                          }
                          className="border-gray-300"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                        <MapPin className="inline h-4 w-4 mr-1 text-gray-500" />
                        Purchase Location *
                      </Label>
                      <Input
                        id="location"
                        placeholder="Store name, address, or online retailer"
                        value={reportData.purchaseLocation}
                        onChange={(e) =>
                          setReportData({ ...reportData, purchaseLocation: e.target.value })
                        }
                        className="border-amber-300 focus:border-amber-500 focus:ring-amber-200"
                        required
                      />
                      <p className="text-xs text-gray-500">
                        Required to help track counterfeit sources
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="additional-info" className="text-sm font-medium text-gray-700">
                        <Info className="inline h-4 w-4 mr-1 text-gray-500" />
                        Additional Information
                      </Label>
                      <Textarea
                        id="additional-info"
                        placeholder="Please provide details about why you suspect this is counterfeit. For example:
• Where and when did you purchase it?
• What seems unusual or different from genuine products?
• Any other concerns or observations?"
                        value={reportData.additionalInfo}
                        onChange={(e) =>
                          setReportData({ ...reportData, additionalInfo: e.target.value })
                        }
                        rows={4}
                        className="border-gray-300 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="px-6 py-4 border-t bg-gray-50">
                <div className="flex flex-col w-full space-y-3 sm:space-y-0 sm:flex-row sm:justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowFakeReportDialog(false);
                      // Reset form
                      setReportData({
                        email: '',
                        phone: '',
                        purchaseLocation: '',
                        additionalInfo: '',
                        productPhoto: null,
                      });
                      setImagePreview(null);
                    }}
                    className="w-full sm:w-auto"
                    disabled={isSubmittingReport}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submitFakeReport}
                    disabled={isSubmittingReport || (!reportData.email.trim() && !reportData.phone.trim()) || !reportData.purchaseLocation.trim()}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingReport ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      'Submit Report'
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}