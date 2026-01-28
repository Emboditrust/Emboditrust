'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  X,
  Package,
  Upload,
  Menu,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
    };
  };
  qrCodeId: string;
  scratchCodeParam?: string;
}

export default function VerificationClientPage({
  verificationData,
  qrCodeId,
  scratchCodeParam,
}: VerificationClientPageProps) {
  const router = useRouter();
  const { productCode } = verificationData;

  /* ───────────────── Verification state ───────────────── */
  const [showScratchDialog, setShowScratchDialog] = useState(true);
  const [scratchCodeInput, setScratchCodeInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showNotAuthenticDialog, setShowNotAuthenticDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const [verificationCount, setVerificationCount] = useState(
    productCode.verificationCount || 0
  );
  const [isFirstScan, setIsFirstScan] = useState(false);

  /* ───────────────── Fake report state ───────────────── */
  const [reportForm, setReportForm] = useState({
    email: '',
    phone: '',
    purchaseLocation: '',
    purchaseDate: '',
    additionalInfo: '',
    productPhoto: null as File | null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  /* ───────────────── Auto verify if scratch in URL ───────────────── */
  useEffect(() => {
    if (scratchCodeParam) {
      setScratchCodeInput(scratchCodeParam);
      verifyScratchCode(scratchCodeParam);
    }
  }, [scratchCodeParam]);

  /* ───────────────── Verify scratch code ───────────────── */
  const verifyScratchCode = async (code?: string) => {
    const inputCode = (code || scratchCodeInput).trim();
    if (!inputCode) {
      alert('Please enter the scratch code');
      return;
    }

    setIsVerifying(true);

    try {
      const formattedInput = inputCode.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      const formattedStored = productCode.scratchCode
        .replace(/[^A-Z0-9]/gi, '')
        .toUpperCase();

      // ❌ Invalid scratch
      if (formattedInput !== formattedStored) {
        await fetch('/api/verify/log-attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            qrCodeId: productCode.qrCodeId,
            scratchCode: inputCode,
            result: 'invalid',
          }),
        });

        setShowScratchDialog(false);
        setShowNotAuthenticDialog(true);

        setTimeout(() => {
          router.replace('/');
        }, 2500);

        return;
      }

      // ✅ Valid scratch → server decides
      const res = await fetch('/api/verify/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCodeId: productCode.qrCodeId }),
      });

      const data = await res.json();

      await fetch('/api/verify/log-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCodeId: productCode.qrCodeId,
          scratchCode: formattedStored,
          result: data.status, // valid | already_used
        }),
      });

      setVerificationCount(data.verificationCount);
      setIsFirstScan(data.isFirstVerification);

      setShowScratchDialog(false);
      setShowSuccessDialog(true);

      // 🔁 Redirect home after verification
      setTimeout(() => {
        router.replace('/');
      }, 3000);

    } catch (err) {
      console.error(err);
      alert('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  /* ───────────────── Image upload ───────────────── */
  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Only image files allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setReportForm({ ...reportForm, productPhoto: file });

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  /* ───────────────── Submit fake report ───────────────── */
  const submitFakeReport = async () => {
    if (!reportForm.purchaseLocation.trim()) {
      alert('Purchase location is required');
      return;
    }

    setIsSubmittingReport(true);

    try {
      const formData = new FormData();
      formData.append('email', reportForm.email);
      formData.append('phone', reportForm.phone);
      formData.append('productName', productCode.productName);
      formData.append('purchaseLocation', reportForm.purchaseLocation);
      formData.append('purchaseDate', reportForm.purchaseDate);
      formData.append('additionalInfo', reportForm.additionalInfo);
      formData.append('qrCodeId', productCode.qrCodeId);
      formData.append('scratchCode', productCode.scratchCode);

      if (reportForm.productPhoto) {
        formData.append('productPhoto', reportForm.productPhoto);
      }

      const res = await fetch('/api/reports/fake-product', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Submission failed');

      alert('Report submitted successfully. Thank you.');

      setShowReportDialog(false);

      // 🔁 Redirect home after report
      setTimeout(() => {
        router.replace('/');
      }, 2000);

    } catch (err) {
      console.error(err);
      alert('Failed to submit report');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  /* ───────────────── UI ───────────────── */
  return (
    <div className="min-h-screen bg-white">

      {/* HEADER */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-cyan-400">Emboditrust</div>
          <Menu className="h-6 w-6" />
        </div>
      </header>

      {/* SCRATCH INPUT */}
      <Dialog open={showScratchDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <Package className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
            <DialogTitle className="text-center">Verify Product</DialogTitle>
            <DialogDescription className="text-center">
              Enter the scratch code on the product
            </DialogDescription>
          </DialogHeader>

          <Input
            placeholder="Enter scratch code"
            value={scratchCodeInput}
            onChange={(e) => setScratchCodeInput(e.target.value.toUpperCase())}
            className="text-center"
          />

          <Button
            onClick={() => verifyScratchCode()}
            disabled={isVerifying}
            className="w-full bg-cyan-300 text-black mt-4"
          >
            {isVerifying ? 'Verifying...' : 'Verify'}
          </Button>
        </DialogContent>
      </Dialog>

      {/* NOT AUTHENTIC */}
      <Dialog open={showNotAuthenticDialog}>
        <DialogContent className="text-center">
          <X className="h-8 w-8 text-red-600 mx-auto mb-3" />
          <Badge className="bg-red-100 text-red-800">Not Authentic</Badge>
          <p className="mt-2 text-gray-700">
            This product is not registered in the system.
          </p>
        </DialogContent>
      </Dialog>

      {/* SUCCESS */}
      <Dialog open={showSuccessDialog}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-4">
            <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <Badge className="bg-green-100 text-green-800">Authentic</Badge>
            <p className="text-gray-700 mt-2">This product is genuine.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-red-600">Product</p>
                  <p>{productCode.productName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-red-600">Batch</p>
                  <p>{productCode.batchId}</p>
                </div>
              </div>

              <Separator className="my-4" />

              <p className={verificationCount > 1 ? 'text-red-600' : 'text-green-600'}>
                This code has been scanned {verificationCount} time
                {verificationCount > 1 ? 's' : ''}.
              </p>

              {verificationCount > 1 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-red-700 mb-2">
                    This product has been verified before. You may report it if you suspect it is fake.
                  </p>
                  <Button
                    onClick={() => setShowReportDialog(true)}
                    className="w-full bg-red-500 text-white"
                  >
                    Report Fake Product
                  </Button>
                </div>
              )}

              {isFirstScan && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  🎁 You earned ₦100 airtime for your first verification.
                </div>
              )}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      {/* REPORT FAKE */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Report Fake Product</DialogTitle>
            <DialogDescription>
              Provide details to help our investigation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="Email (optional)"
              value={reportForm.email}
              onChange={(e) => setReportForm({ ...reportForm, email: e.target.value })}
            />
            <Input
              placeholder="Phone (optional)"
              value={reportForm.phone}
              onChange={(e) => setReportForm({ ...reportForm, phone: e.target.value })}
            />
            <Input
              placeholder="Where did you buy this product?"
              value={reportForm.purchaseLocation}
              onChange={(e) =>
                setReportForm({ ...reportForm, purchaseLocation: e.target.value })
              }
            />
            <Input
              type="date"
              value={reportForm.purchaseDate}
              onChange={(e) =>
                setReportForm({ ...reportForm, purchaseDate: e.target.value })
              }
            />
            <Textarea
              placeholder="Additional information"
              value={reportForm.additionalInfo}
              onChange={(e) =>
                setReportForm({ ...reportForm, additionalInfo: e.target.value })
              }
            />

            <Label>Upload product photo</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
            />

            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-32 object-contain rounded"
              />
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button
              onClick={submitFakeReport}
              disabled={isSubmittingReport}
              className="w-full bg-red-500 text-white"
            >
              {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
