'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Package, Menu } from 'lucide-react';

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

interface Props {
  verificationData: any;
  qrCodeId: string;
  scratchCodeParam?: string;
}

export default function VerificationClientPage({
  verificationData,
  qrCodeId,
  scratchCodeParam,
}: Props) {
  const router = useRouter();
  const productCode = verificationData.productCode;

  /* ───────── Countdown state ───────── */
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const startCountdown = (seconds: number) => {
    setCountdown(seconds);

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          router.replace('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(null);
  };

  useEffect(() => {
    return () => stopCountdown();
  }, []);

  /* ───────── Verification state ───────── */
  const [showScratchDialog, setShowScratchDialog] = useState(true);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showNotAuthenticDialog, setShowNotAuthenticDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const [scratchCodeInput, setScratchCodeInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [verificationCount, setVerificationCount] = useState(
    productCode.verificationCount || 0
  );

  const [isFirstScan, setIsFirstScan] = useState(false);

  /* ───────── Fake report state ───────── */
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

  useEffect(() => {
    if (scratchCodeParam) {
      setScratchCodeInput(scratchCodeParam);
      verifyScratchCode(scratchCodeParam);
    }
  }, [scratchCodeParam]);

  /* ───────── Verify scratch ───────── */
  const verifyScratchCode = async (code?: string) => {
    const input = (code || scratchCodeInput).trim();
    if (!input) return alert('Enter scratch code');

    setIsVerifying(true);

    try {
      const formattedInput = input.toUpperCase();
      const stored = productCode.scratchCode.toUpperCase();

      if (formattedInput !== stored) {
        setShowScratchDialog(false);
        setShowNotAuthenticDialog(true);
        startCountdown(10);
        return;
      }

      const res = await fetch('/api/verify/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCodeId: productCode.qrCodeId }),
      });

      const data = await res.json();

      setVerificationCount(data.verificationCount);
      setIsFirstScan(data.isFirstVerification);

      setShowScratchDialog(false);
      setShowSuccessDialog(true);

      startCountdown(10);
    } finally {
      setIsVerifying(false);
    }
  };

  /* ───────── Submit fake report ───────── */
  const submitFakeReport = async () => {
    if (!reportForm.purchaseLocation.trim()) {
      alert('Purchase location required');
      return;
    }

    setIsSubmittingReport(true);

    try {
      const formData = new FormData();
      formData.append('productName', productCode.productName);
      formData.append('purchaseLocation', reportForm.purchaseLocation);
      formData.append('additionalInfo', reportForm.additionalInfo);
      formData.append('qrCodeId', productCode.qrCodeId);
      formData.append('scratchCode', productCode.scratchCode);

      await fetch('/api/reports/fake-product', {
        method: 'POST',
        body: formData,
      });

      setShowReportDialog(false);
      alert('Report submitted successfully');

      startCountdown(10);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  /* ───────── UI ───────── */
  return (
    <div className="min-h-screen bg-white">

      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between">
          <div className="text-2xl font-bold text-cyan-400">Emboditrust</div>
          <Menu className="h-6 w-6" />
        </div>
      </header>

      {/* SUCCESS */}
      <Dialog open={showSuccessDialog}>
        <DialogContent className="sm:max-w-3xl">
          <Check className="h-8 w-8 text-green-600 mx-auto" />
          <Badge className="bg-green-100 text-green-800 mx-auto">Authentic</Badge>

          <Card>
            <CardHeader>
              <CardTitle>{productCode.productName}</CardTitle>
            </CardHeader>
            <CardContent>
              Scanned {verificationCount} time{verificationCount > 1 ? 's' : ''}

              {verificationCount > 1 && (
                <Button
                  className="w-full mt-3 bg-red-500"
                  onClick={() => {
                    stopCountdown();
                    setShowReportDialog(true);
                  }}
                >
                  Report Fake
                </Button>
              )}
            </CardContent>
          </Card>

          {/* COUNTDOWN */}
          {countdown !== null && (
            <div className="text-center mt-4">
              Redirecting in {countdown}…
              <Button
                className="ml-3"
                onClick={() => router.replace('/')}
              >
                Return Home
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* REPORT DIALOG */}
      <Dialog open={showReportDialog}>
        <DialogContent>
          <DialogTitle>Report Fake</DialogTitle>

          <Input
            placeholder="Where did you buy?"
            value={reportForm.purchaseLocation}
            onChange={(e) =>
              setReportForm({ ...reportForm, purchaseLocation: e.target.value })
            }
          />

          <Textarea
            placeholder="Additional info"
            value={reportForm.additionalInfo}
            onChange={(e) =>
              setReportForm({ ...reportForm, additionalInfo: e.target.value })
            }
          />

          <Button
            disabled={isSubmittingReport}
            onClick={submitFakeReport}
            className="w-full bg-red-500"
          >
            Submit Report
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
