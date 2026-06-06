'use client';

import { useState, useEffect, useCallback } from 'react';

interface WidgetProps {
  widgetData: {
    qrCodeId: string;
    scratchCode: string;
    productName: string;
    companyName: string;
    logoUrl: string;
    productImageUrl: string;
    description: string;
    status: string;
    verificationCount: number;
    firstVerifiedAt: string | undefined;
    lastVerifiedAt: string | undefined;
    productMetadata: Record<string, string> | null;
    hasReward: boolean;
    rewardAmount: number;
    manufacturerId: string;
    brandPrefix: string;
    branding: {
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
      supportEmail: string;
      supportPhone: string;
      verificationHeadline: string;
      verificationDescription: string;
    };
  };
}

export default function WidgetClientPage({ widgetData }: WidgetProps) {
  const d = widgetData;

  const [step, setStep] = useState<'input' | 'verifying' | 'success' | 'fail'>('input');
  const [scratchInput, setScratchInput] = useState('');
  const [verifiedCount, setVerifiedCount] = useState(d.verificationCount);
  const [errorMsg, setErrorMsg] = useState('');

  const primary = d.branding.primaryColor;
  const secondary = d.branding.secondaryColor;
  const accent = d.branding.accentColor;

  const handleScratchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (val.length <= 12) setScratchInput(val);
  };

  const formatCode = (code: string) => {
    if (code.length <= 4) return code;
    if (code.length <= 8) return `${code.slice(0, 4)}-${code.slice(4)}`;
    return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
  };

  const verify = useCallback(async () => {
    const sanitized = scratchInput.trim().toUpperCase().replace(/\s/g, '');
    if (sanitized.length !== 12) {
      setErrorMsg('Enter a valid 12-character code');
      return;
    }

    setStep('verifying');
    setErrorMsg('');

    if (sanitized !== d.scratchCode.toUpperCase()) {
      setStep('fail');
      return;
    }

    try {
      const res = await fetch('/api/verify/widget-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCodeId: d.qrCodeId, scratchCode: sanitized }),
      });
      const data = await res.json();
      if (data.verified) {
        setVerifiedCount(data.verificationCount);
        setStep('success');
      } else {
        setStep('fail');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStep('input');
    }
  }, [scratchInput, d.scratchCode, d.qrCodeId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && step === 'input' && scratchInput.length === 12) {
        verify();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, scratchInput, verify]);

  const metaEntries = d.productMetadata
    ? Object.entries(d.productMetadata)
    : [];

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#1a1a2e',
      background: '#f8fafc',
      minHeight: '100%',
      borderRadius: '16px',
      overflow: 'hidden',
    }}>
      <style>{`
        .et-widget * { box-sizing: border-box; }
        .et-input { border: 2px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; font-size: 18px; font-family: monospace; text-align: center; letter-spacing: 3px; width: 100%; outline: none; transition: border-color 0.2s; }
        .et-input:focus { border-color: ${primary}; box-shadow: 0 0 0 3px ${primary}22; }
        .et-btn { width: 100%; padding: 14px 24px; border-radius: 12px; border: none; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .et-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .et-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 16px; border-radius: 100px; font-size: 14px; font-weight: 600; }
        .et-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .et-meta-item { background: white; border-radius: 10px; padding: 12px; border: 1px solid #eef2f6; }
        .et-meta-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 4px; }
        .et-meta-value { font-size: 14px; color: #0f172a; font-weight: 500; }
        .et-spinner { width: 20px; height: 20px; border: 3px solid transparent; border-top-color: white; border-radius: 50%; animation: et-spin 0.6s linear infinite; }
        @keyframes et-spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ padding: '24px' }}>
        {step === 'input' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              {d.logoUrl ? (
                <img src={d.logoUrl} alt={d.companyName}
                  style={{ height: '48px', maxWidth: '180px', objectFit: 'contain', marginBottom: '16px' }} />
              ) : (
                <div style={{ fontSize: '20px', fontWeight: 700, color: secondary, marginBottom: '16px' }}>
                  {d.companyName}
                </div>
              )}
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px',
                background: `${primary}15`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 12px'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>
                {d.branding.verificationHeadline}
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                {d.branding.verificationDescription}
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                Enter Scratch Code
              </label>
              <input
                className="et-input"
                value={formatCode(scratchInput)}
                onChange={handleScratchChange}
                placeholder="XXXX-XXXX-XXXX"
                maxLength={14}
                autoFocus
              />
              <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', marginTop: '6px' }}>
                {scratchInput.length}/12 characters
              </p>
            </div>

            {errorMsg && (
              <p style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center', margin: '0 0 12px' }}>
                {errorMsg}
              </p>
            )}

            <button
              className="et-btn"
              style={{
                background: primary,
                color: 'white',
              }}
              disabled={scratchInput.length !== 12}
              onClick={verify}
            >
              Verify Authenticity
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            {d.branding.supportEmail || d.branding.supportPhone ? (
              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#94a3b8' }}>
                Need help? {d.branding.supportEmail && <span>Email <a href={`mailto:${d.branding.supportEmail}`} style={{ color: primary, textDecoration: 'none', fontWeight: 500 }}>{d.branding.supportEmail}</a></span>}
                {d.branding.supportEmail && d.branding.supportPhone && ' | '}
                {d.branding.supportPhone && <span>Call <a href={`tel:${d.branding.supportPhone}`} style={{ color: primary, textDecoration: 'none', fontWeight: 500 }}>{d.branding.supportPhone}</a></span>}
              </div>
            ) : null}
          </div>
        )}

        {step === 'verifying' && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              border: '4px solid transparent',
              borderTopColor: primary,
              animation: 'et-spin 0.6s linear infinite',
              margin: '0 auto 20px',
            }} />
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
              Verifying...
            </p>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
              Please wait while we check the authenticity
            </p>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center' }}>
            {d.logoUrl ? (
              <img src={d.logoUrl} alt={d.companyName}
                style={{ height: '48px', maxWidth: '180px', objectFit: 'contain', marginBottom: '20px' }} />
            ) : (
              <div style={{ fontSize: '20px', fontWeight: 700, color: secondary, marginBottom: '20px' }}>
                {d.companyName}
              </div>
            )}

            <div className="et-badge" style={{ background: `${accent}18`, color: accent, marginBottom: '20px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Verified Authentic
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>
              {d.productName} Verified
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px', lineHeight: 1.6 }}>
              {d.description || `This ${d.productName} has been verified as authentic.`}
            </p>

            {d.productImageUrl && (
              <img
                src={d.productImageUrl}
                alt={d.productName}
                style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain', borderRadius: '12px', marginBottom: '20px' }}
              />
            )}

            <div style={{
              background: '#f1f5f9', borderRadius: '14px', padding: '16px',
              marginBottom: '16px', border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Scans</div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{verifiedCount}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Status</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: accent, marginTop: '4px' }}>Authentic</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Scan</div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', marginTop: '4px' }}>Now</div>
                </div>
              </div>
            </div>

            {metaEntries.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '10px', textAlign: 'left' }}>
                  Product Information
                </h3>
                <div className="et-meta-grid">
                  {metaEntries.map(([label, value]) => (
                    <div key={label} className="et-meta-item">
                      <div className="et-meta-label">{label}</div>
                      <div className="et-meta-value">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {d.branding.supportEmail || d.branding.supportPhone ? (
              <div style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                Questions? {d.branding.supportEmail && <a href={`mailto:${d.branding.supportEmail}`} style={{ color: primary, textDecoration: 'none', fontWeight: 500 }}>{d.branding.supportEmail}</a>}
              </div>
            ) : null}
          </div>
        )}

        {step === 'fail' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: '#fef2f2', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 16px'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <div className="et-badge" style={{ background: '#fef2f2', color: '#ef4444', marginBottom: '12px' }}>
              Not Authentic
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 6px', color: '#0f172a' }}>
              Verification Failed
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px', lineHeight: 1.6 }}>
              The scratch code entered does not match our records. This product may be counterfeit.
            </p>
            <button
              className="et-btn"
              style={{ background: secondary, color: 'white' }}
              onClick={() => { setStep('input'); setScratchInput(''); setErrorMsg(''); }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
