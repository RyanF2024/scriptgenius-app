'use client';

import { useState } from 'react';
import { useMFA } from '@/contexts/MFAContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Loader2, ShieldCheck, ShieldOff } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { MFASetup } from './MFASetup';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function MFAManagement() {
  const { mfaStatus, disable2FA, refreshMFAStatus } = useMFA();
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDisable2FA = async () => {
    if (!password) {
      setError('Please enter your password');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const success = await disable2FA(password);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Two-factor authentication has been disabled.',
        });
        setShowDisableDialog(false);
        setPassword('');
      }
    } catch (err) {
      console.error('Error disabling 2FA:', err);
      setError(err instanceof Error ? err.message : 'Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  if (showSetup) {
    return (
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            setShowSetup(false);
            refreshMFAStatus();
          }}
          className="-ml-2"
        >
          ← Back to security settings
        </Button>
        <MFASetup />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mfaStatus?.isMfaEnabled ? (
            <div className="space-y-6">
              <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Two-factor authentication is currently <span className="font-semibold">enabled</span> on your account.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h4 className="font-medium">Recovery Options</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="space-y-0.5">
                      <p className="font-medium">Backup Codes</p>
                      <p className="text-sm text-muted-foreground">
                        {mfaStatus.hasBackupCodes 
                          ? `${mfaStatus.factors.find(f => f.type === 'totp')?.lastUsedAt ? 'Regenerated' : 'Generated'} on ${new Date().toLocaleDateString()}`
                          : 'Not set up'}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        setShowSetup(true);
                      }}
                    >
                      {mfaStatus.hasBackupCodes ? 'Regenerate' : 'Generate'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button 
                  variant="destructive" 
                  onClick={() => setShowDisableDialog(true)}
                >
                  <ShieldOff className="mr-2 h-4 w-4" />
                  Disable Two-Factor Authentication
                </Button>
                <p className="mt-2 text-sm text-muted-foreground">
                  You'll need to enter your password to disable two-factor authentication.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Two-factor authentication is currently <span className="font-semibold">disabled</span> on your account.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-foreground">
                        Add an extra layer of security
                      </h4>
                      <div className="mt-1 text-sm text-muted-foreground">
                        <p>Protect your account with two-factor authentication.</p>
                      </div>
                    </div>
                    <div className="ml-auto">
                      <Button 
                        onClick={() => setShowSetup(true)}
                        size="sm"
                      >
                        Set Up
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Are you sure you want to disable two-factor authentication? Your account will be less secure.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Confirm your password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDisableDialog(false);
                  setError(null);
                  setPassword('');
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDisable2FA}
                disabled={!password || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Disabling...
                  </>
                ) : (
                  'Disable 2FA'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
