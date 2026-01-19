'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, AlertTriangle, Shield, Package, Building, Calendar, Users, Flag, Camera, Upload, ExternalLink, Copy, Heart, Menu } from 'lucide-react';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface VerificationClientPageProps {
  verificationData: {
    productCode: {
      qrCodeId: string;
      scratchCode: string;
      productName: string;
      companyName: string;
      manufacturerId: string;
      batchId: string;
      status: string;
      verificationCount: number;
      firstVerifiedAt: Date | null;
      lastVerifiedAt: Date;
      isFirstVerification: boolean;
    };
    batch: {
      batchId: string;
      productName: string;
      generationDate: Date;
      quantity: number;
    } | null;
    client: {
      companyName: string;
      registrationNumber: string;
      website: string;
    } | null;
  };
  qrCodeId: string;
  scratchCodeParam?: string;
}

export default function VerificationClientPage({ 
  verificationData, 
  qrCodeId,
  scratchCodeParam 
}: VerificationClientPageProps) {
  const router = useRouter();
  const [showScratchDialog, setShowScratchDialog] = useState(true);
  const [scratchCodeInput, setScratchCodeInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showFakeReportDialog, setShowFakeReportDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showNotAuthenticDialog, setShowNotAuthenticDialog] = useState(false);
  const [showThankYouDialog, setShowThankYouDialog] = useState(false);
  const [reportData, setReportData] = useState({
    productName: verificationData.productCode.productName,
    purchaseLocation: '',
    purchaseDate: '',
    productPhoto: null as File | null,
    additionalInfo: '',
  });
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScratchCodeValid, setIsScratchCodeValid] = useState<boolean | null>(null);
  const [verificationResult, setVerificationResult] = useState<'authentic' | 'not-authentic' | null>(null);

  const { productCode, batch, client } = verificationData;

  useEffect(() => {
    if (scratchCodeParam) {
      setScratchCodeInput(scratchCodeParam);
      verifyScratchCode(scratchCodeParam);
    }
  }, [scratchCodeParam]);

  const verifyScratchCode = async (code?: string) => {
    const inputCode = code || scratchCodeInput;
    
    if (!inputCode.trim()) {
      alert('Please enter the scratch code');
      return;
    }

    setIsVerifying(true);
    try {
      const formattedInput = inputCode.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      const formattedStored = productCode.scratchCode.replace(/[^A-Z0-9]/gi, '').toUpperCase();

      if (formattedInput === formattedStored) {
        setIsScratchCodeValid(true);
        setVerificationResult('authentic');
        
        const isFirstVerification = !productCode.firstVerifiedAt;
        const verificationResult = isFirstVerification ? 'valid' : 'already_used';
        
        let verificationCount = (productCode.verificationCount || 0) + 1;
        
        await fetch('/api/verify/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            qrCodeId: productCode.qrCodeId,
            status: isFirstVerification ? 'verified' : productCode.status,
            verificationCount: verificationCount,
            isFirstVerification: isFirstVerification
          }),
        });

        await fetch('/api/verify/log-attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            qrCodeId: productCode.qrCodeId,
            scratchCode: productCode.scratchCode,
            result: verificationResult,
            ipAddress: 'from-client',
            userAgent: navigator.userAgent
          }),
        });
        
        setShowScratchDialog(false);
        setShowSuccessDialog(true);

      } else {
        setIsScratchCodeValid(false);
        setVerificationResult('not-authentic');
        
        await fetch('/api/verify/log-attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            qrCodeId: productCode.qrCodeId,
            scratchCode: inputCode,
            result: 'invalid',
            ipAddress: 'from-client',
            userAgent: navigator.userAgent
          }),
        });
        
        setShowScratchDialog(false);
        setShowNotAuthenticDialog(true);
      }

    } catch (error) {
      console.error('Error verifying scratch code:', error);
      alert('System error verifying scratch code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportData.productName.trim() || !reportData.purchaseLocation.trim()) {
      alert('Please fill in the required fields');
      return;
    }

    setIsSubmittingReport(true);
    try {
      const formData = new FormData();
      formData.append('qrCodeId', productCode.qrCodeId);
      formData.append('scratchCode', scratchCodeInput);
      formData.append('productName', reportData.productName);
      formData.append('purchaseLocation', reportData.purchaseLocation);
      formData.append('purchaseDate', reportData.purchaseDate);
      formData.append('additionalInfo', reportData.additionalInfo);
      
      if (reportData.productPhoto) {
        formData.append('productPhoto', reportData.productPhoto);
      }

      const response = await fetch('/api/reports/fake-product', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setShowFakeReportDialog(false);
        setShowThankYouDialog(true);
        setReportData({
          productName: verificationData.productCode.productName,
          purchaseLocation: '',
          purchaseDate: '',
          productPhoto: null,
          additionalInfo: '',
        });
        setImagePreview(null);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      setReportData({ ...reportData, productPhoto: file });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
              Emboditrust
            </div>
            <div className="hidden md:flex items-center gap-8">
              <button className="text-gray-600 hover:text-gray-900">About</button>
              <button className="text-gray-600 hover:text-gray-900">How it works</button>
              <button className="text-gray-600 hover:text-gray-900">Report Fake</button>
              <Button className="bg-cyan-300 hover:bg-cyan-400 text-gray-900">Contact</Button>
            </div>
            <button className="md:hidden">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Scratch Code Verification Dialog */}
      <Dialog open={showScratchDialog} onOpenChange={setShowScratchDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-cyan-100 flex items-center justify-center">
                <Package className="h-8 w-8 text-cyan-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              Welcome to<br />
              <span className="text-cyan-400">Emboditrust Healthcare</span>
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Please enter the scratch pin on the product to validate the QR-Code
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Input
              placeholder="Enter the 12 digit code here"
              value={scratchCodeInput}
              onChange={(e) => {
                let value = e.target.value.toUpperCase();
                if (value.length <= 15) {
                  setScratchCodeInput(value);
                }
              }}
              className="text-center"
              maxLength={15}
              disabled={isVerifying}
            />
          </div>

          <Button
            onClick={() => verifyScratchCode()}
            disabled={isVerifying}
            className="w-full bg-cyan-300 hover:bg-cyan-400 text-gray-900"
          >
            {isVerifying ? 'Verifying...' : 'Verify Product'}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Not Authentic Dialog */}
      <Dialog open={showNotAuthenticDialog} onOpenChange={setShowNotAuthenticDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <X className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <div className="text-center space-y-4">
            <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
              Not Authentic
            </Badge>
            
            <p className="text-gray-700">
              This code does not exist in any manufacturer's database. The product you scanned may be counterfeit.
            </p>

            <Button 
              onClick={() => {
                setShowNotAuthenticDialog(false);
                setShowFakeReportDialog(true);
              }}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              Report Product
            </Button>
          </div>

          <div className="bg-pink-50 border border-pink-100 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-center gap-2 text-red-600">
              <Heart className="h-4 w-4 fill-current" />
              <span className="text-sm">Thank you for choosing Emboditrust Healthcare. Your safety matters.</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Authentic Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="text-center mb-6">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 mb-4">
              Authentic
            </Badge>
            <p className="text-gray-700">This product is verified as genuine.</p>
          </div>

          {/* Product Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-pink-100 to-pink-50 rounded-lg p-8 mb-6">
                <div className="flex items-center justify-center">
                  {/* <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-2">ESSENCE</div>
                    <div className="text-lg text-gray-700">SUN SPF45 PA+++</div>
                  </div> */}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-red-600 font-semibold">Product Name</p>
                  <p className="text-gray-900">{productCode.productName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-red-600 font-semibold">Batch Number</p>
                  <p className="text-gray-900">{productCode.batchId}</p>
                </div>
              </div>

              <Separator className="my-4" />

              {/* <div>
                <p className="text-sm text-red-600 font-semibold mb-2">Description</p>
                <p className="text-gray-700">
                  UltraGlow Serum is formulated with active botanicals to restore skin brightness and elasticity.
                </p>
              </div> */}

              <Separator className="my-4" />

              {/* <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-red-600 font-semibold">Ingredients</p>
                  <p className="text-gray-700">Aqua, Vitamin C, Hyaluronic Acid, Niacinamide</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-red-600 font-semibold">Storage</p>
                  <p className="text-gray-700">Store in a cool dry place.</p>
                </div>
              </div> */}
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent>
              {/* <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-red-600 font-semibold">Manufacturing Date</p>
                  <p className="text-gray-900">MFD: 14 Feb 2025</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-red-600 font-semibold">Expiry Date</p>
                  <p className="text-gray-900">EXP: 14 Feb 2028</p>
                </div>
              </div> */}

              <Separator className="my-4" />

              <div>
                <p className="text-sm text-red-600 font-semibold">Scan Count</p>
                <p className="text-green-600">This code has been scanned 1 time.</p>
              </div>

              <div className="bg-red-50 border border-red-100 rounded-lg p-4 mt-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800">You've earned a reward for verifying your purchase!</p>
                    <p className="text-sm text-gray-700 mt-1">Reward: ₦100 Airtime</p>
                    <Button className="w-full mt-3 bg-red-500 hover:bg-red-600 text-white">
                      Redeem Reward
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Section */}
          <Card>
            <CardHeader>
              <CardTitle>Tell the brand about your experience</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Help the brand improve product quality"
                rows={3}
                className="resize-none"
              />
            </CardContent>
          </Card>

          <DialogFooter className="mt-6">
            <Button 
              onClick={() => setShowSuccessDialog(false)}
              className="w-full bg-cyan-300 hover:bg-cyan-400 text-gray-900"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Fake Product Dialog */}
      <Dialog open={showFakeReportDialog} onOpenChange={setShowFakeReportDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Report a Fake Product</DialogTitle>
            <DialogDescription className="text-center">
              Help us protect others by reporting counterfeit products
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Report Details</Label>
              <p className="text-sm text-gray-500">Please provide as much information as possible</p>
            </div>

            <Input
              placeholder="Enter product name"
              value={reportData.productName}
              onChange={(e) => setReportData({...reportData, productName: e.target.value})}
            />

            <Input
              placeholder="Where did you buy this product?"
              value={reportData.purchaseLocation}
              onChange={(e) => setReportData({...reportData, purchaseLocation: e.target.value})}
            />

            <div className="space-y-2">
              <Label>Upload picture of product</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="file-upload"
                  onChange={handleImageUpload}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-blue-600">Click to upload</p>
                  <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                  <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                </label>
              </div>
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="w-full h-32 object-contain rounded" />
              )}
            </div>

            <Textarea
              placeholder="Additional note (optional)"
              value={reportData.additionalInfo}
              onChange={(e) => setReportData({...reportData, additionalInfo: e.target.value})}
              rows={3}
            />
          </div>

          <DialogFooter className="flex-col gap-2">
            <Button
              onClick={handleSubmitReport}
              disabled={isSubmittingReport}
              className="w-full bg-cyan-300 hover:bg-cyan-400 text-gray-900"
            >
              {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFakeReportDialog(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Thank You Dialog */}
      <Dialog open={showThankYouDialog} onOpenChange={setShowThankYouDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="bg-red-50 border border-red-100 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800 mb-2">Thank you for your feedback</p>
                <p className="text-sm text-gray-700">
                  Your report has been taken and we appreciate you for helping us eradicate fake products in circulation, thank you for your trust
                </p>
              </div>
            </div>
          </div>

          <div className="bg-pink-50 border border-pink-100 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-center gap-2 text-red-600">
              <Heart className="h-4 w-4 fill-current" />
              <span className="text-sm">Thank you for choosing Emboditrust Healthcare. Your safety matters.</span>
            </div>
          </div>

          <Button 
            onClick={() => setShowThankYouDialog(false)}
            className="w-full bg-cyan-300 hover:bg-cyan-400 text-gray-900 mt-4"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>Powered by Emboditrusthealthcare Copyright ©2025</p>
            <div className="flex gap-4">
              <button className="text-blue-600 hover:underline">Privacy policy</button>
              <button className="text-blue-600 hover:underline">Terms</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}