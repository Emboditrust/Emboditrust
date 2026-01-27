'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check, X, Shield, Package, Upload, Heart, Menu
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
  DialogDescription
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
  scratchCodeParam
}: VerificationClientPageProps) {

  const router = useRouter();
  const { productCode } = verificationData;

  const [showScratchDialog, setShowScratchDialog] = useState(true);
  const [scratchCodeInput, setScratchCodeInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showNotAuthenticDialog, setShowNotAuthenticDialog] = useState(false);
  const [showAlreadyUsedWarning, setShowAlreadyUsedWarning] = useState(false);

  const [verificationCount, setVerificationCount] = useState<number>(productCode.verificationCount || 0);
  const [isFirstScan, setIsFirstScan] = useState<boolean>(false);

  useEffect(() => {
    if (scratchCodeParam) {
      setScratchCodeInput(scratchCodeParam);
      verifyScratchCode(scratchCodeParam);
    }
  }, [scratchCodeParam]);

  // =========================
  // VERIFY SCRATCH CODE
  // =========================
  const verifyScratchCode = async (code?: string) => {
    const inputCode = (code || scratchCodeInput).trim();

    if (!inputCode) {
      alert('Please enter the scratch code');
      return;
    }

    setIsVerifying(true);

    try {
      const formattedInput = inputCode.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      const formattedStored = productCode.scratchCode.replace(/[^A-Z0-9]/gi, '').toUpperCase();

      // ❌ Scratch code mismatch
      if (formattedInput !== formattedStored) {

        await fetch('/api/verify/log-attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            qrCodeId: productCode.qrCodeId,
            scratchCode: inputCode,
            result: 'invalid'
          }),
        });

        setShowScratchDialog(false);
        setShowNotAuthenticDialog(true);
        return;
      }

      // ✅ Scratch code correct → server decides truth
      const res = await fetch('/api/verify/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCodeId: productCode.qrCodeId
        }),
      });

      const data = await res.json();

      // log attempt (server truth result)
      await fetch('/api/verify/log-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCodeId: productCode.qrCodeId,
          scratchCode: formattedStored,
          result: data.status   // 'valid' | 'already_used'
        }),
      });

      setVerificationCount(data.verificationCount);
      setIsFirstScan(data.isFirstVerification);

      setShowScratchDialog(false);

      if (data.isFirstVerification) {
        setShowSuccessDialog(true);
      } else {
        setShowSuccessDialog(true);
        setShowAlreadyUsedWarning(true);
      }

    } catch (error) {
      console.error('Verification error:', error);
      alert('Verification system error. Try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // =========================
  // UI
  // =========================
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
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-cyan-100 flex items-center justify-center">
                <Package className="h-8 w-8 text-cyan-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">Verify Product</DialogTitle>
            <DialogDescription className="text-center pt-2">
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
            className="w-full bg-cyan-300 hover:bg-cyan-400 text-black mt-4"
          >
            {isVerifying ? 'Verifying...' : 'Verify'}
          </Button>
        </DialogContent>
      </Dialog>

      {/* NOT AUTHENTIC */}
      <Dialog open={showNotAuthenticDialog} onOpenChange={setShowNotAuthenticDialog}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <X className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <Badge className="bg-red-100 text-red-800">Not Authentic</Badge>
          <p className="mt-3 text-gray-700">This product is not registered in the system.</p>
        </DialogContent>
      </Dialog>

      {/* SUCCESS */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">

          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="text-center mb-4">
            <Badge className="bg-green-100 text-green-800">Authentic</Badge>
            <p className="text-gray-700 mt-2">This product is genuine.</p>
          </div>

          {showAlreadyUsedWarning && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg text-center mb-4">
              ⚠️ This product has been verified before. Possible resale or reuse detected.
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-red-600 font-semibold">Product</p>
                  <p>{productCode.productName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-red-600 font-semibold">Batch</p>
                  <p>{productCode.batchId}</p>
                </div>
              </div>

              <Separator className="my-4" />

              <p className={verificationCount > 1 ? 'text-red-600' : 'text-green-600'}>
                This code has been scanned {verificationCount} time{verificationCount > 1 ? 's' : ''}.
              </p>

              {isFirstScan && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 mt-4">
                  <p className="font-semibold text-red-800">🎁 Reward Unlocked</p>
                  <p className="text-sm text-gray-700">₦100 Airtime</p>
                  <Button className="w-full mt-3 bg-red-500 hover:bg-red-600 text-white">
                    Redeem Reward
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <DialogFooter className="mt-4">
            <Button onClick={() => setShowSuccessDialog(false)} className="w-full bg-cyan-300 text-black">
              Close
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>
    </div>
  );
}
