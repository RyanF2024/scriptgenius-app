'use client';

import { useState, useEffect } from 'react';
import { useMFA } from '@/contexts/MFAContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Copy, Loader2, Smartphone, ShieldCheck, ShieldOff } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Step = 'intro' | 'scan' | 'verify' | 'backup' | 'complete';
type SetupMethod = 'app' | 'sms' | 'email';

interface MFASetupProps {
  onSetupComplete?: () => void;
}

export function MFASetup({ onSetupComplete }: MFASetupProps) {
  const {
    mfaStatus,
    isLoading,
    error,
    isSetupInProgress,
    backupCodes,
    start2FASetup,
    verify2FASetup,
    confirm2FASetup,
    disable2FA,
    generateNewBackupCodes,
    clearError
  } = useMFA();
  
  const [step, setStep] = useState<Step>('intro');
  const [setupMethod, setSetupMethod] = useState<SetupMethod>('app');
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [copiedCodes, setCopiedCodes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset error when component unmounts or step changes
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Handle initial state based on MFA status and call onSetupComplete when MFA is enabled
  useEffect(() => {
    if (mfaStatus?.isMfaEnabled) {
      setStep('complete');
      if (onSetupComplete) {
        onSetupComplete();
      }
    } else if (isSetupInProgress) {
      setStep('scan');
    }
  }, [mfaStatus, isSetupInProgress, onSetupComplete]);
  
  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        type: 'error',
      });
    }
  }, [error]);

  const handleStartSetup = async () => {
    try {
      setIsSubmitting(true);
      const { secret, qrCodeUrl } = await start2FASetup();
      setSecret(secret);
      setQrCodeUrl(qrCodeUrl);
      setStep('scan');
    } catch (err) {
      console.error('Failed to start 2FA setup:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter a valid 6-digit code.',
        type: 'error',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const success = await verify2FASetup(verificationCode);
      
      if (success) {
        // Confirm the 2FA setup and refresh the status
        await confirm2FASetup();
        // Move to backup codes step
        setStep('backup');
      }
    } catch (err) {
      console.error('Verification failed:', err);
      // Error is handled by the error effect
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadBackupCodes = () => {
    const element = document.createElement('a');
    const file = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'scriptgenius-backup-codes.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const renderStep = () => {
    switch (step) {
      case 'intro':
        return (
          <div className="space-y-4">
            <Alert>
              <ShieldCheck className="h-4 w-4" />
              <AlertTitle>Two-Factor Authentication</AlertTitle>
              <AlertDescription>
                Add an extra layer of security to your account by enabling two-factor authentication.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <h3 className="font-medium">How it works:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li>Scan the QR code with an authenticator app</li>
                <li>Enter the 6-digit code to verify</li>
                <li>Save your backup codes in a secure place</li>
              </ul>
            </div>
            <Button onClick={handleStartSetup} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                'Set Up 2FA'
              )}
            </Button>
          </div>
        );

      case 'scan':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">Scan the QR Code</h3>
              <p className="text-sm text-muted-foreground">
                Use an authenticator app like Google Authenticator or Authy to scan this QR code.
              </p>
            </div>
            
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg border">
                <QRCodeSVG value={qrCodeUrl} size={200} />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Or enter this code manually:
              </p>
              <div className="bg-muted p-3 rounded-md text-center font-mono text-sm select-all">
                {secret.match(/.{1,4}/g)?.join(' ')}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Enter the 6-digit code from your authenticator app:
              </p>
              <div className="flex justify-center">
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-xl font-mono w-48"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep('intro')} disabled={isLoading}>
                Back
              </Button>
              <Button onClick={handleVerify} disabled={isLoading || verificationCode.length !== 6}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify and Continue'
                )}
              </Button>
            </div>
          </div>
        );

      case 'backup':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Save Your Backup Codes</h3>
              <p className="text-sm text-muted-foreground">
                These codes can be used to access your account if you lose access to your authenticator app.
                Each code can only be used once.
              </p>
            </div>

            <div className="bg-muted p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-sm">
                {backupCodes.map((code) => (
                  <div key={code} className="p-2 bg-background rounded">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={handleDownloadBackupCodes} className="w-full" variant="outline">
                Download Backup Codes
              </Button>
              <Button 
                onClick={() => setStep('complete')} 
                className="w-full"
              >
                I've Saved My Backup Codes
              </Button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Two-Factor Authentication Enabled</h3>
              <p className="text-sm text-muted-foreground">
                Your account is now protected with an extra layer of security.
              </p>
            </div>
            <div className="pt-2">
              <Button onClick={() => setStep('intro')} variant="outline">
                Back to Security Settings
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderStep()}
      </CardContent>
    </Card>
  );
}
