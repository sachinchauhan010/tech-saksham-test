'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Settings, Eye, EyeOff, Download, FileText } from 'lucide-react';
import apiClient from '@/lib/api-client';

interface CertificateSettings {
  enabled: boolean;
  allowDownload: boolean;
  message: string;
}

export default function ManageCertificate() {
  const [settings, setSettings] = useState<CertificateSettings>({
    enabled: true,
    allowDownload: true,
    message: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const {data} = await apiClient.post('/api/admin/certificate-settings');
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Failed to load certificate settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const {data} = await apiClient.post('/api/admin/certificate-settings', settings);
      if (data.success) {
        toast.success('Settings saved successfully');
      } else {
        throw new Error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      enabled: true,
      allowDownload: true,
      message: ''
    });
    toast.info('Settings reset to defaults');
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="flex items-center gap-3">
            <div className="w-[26px] h-[26px] rounded-full border-[3px] border-blue-200 border-t-blue-700 animate-spin" />
            <span className="text-gray-600">Loading configuration...</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="lg:gap-6 lg:space-y-0 space-y-6 mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 lg:w-full mb-6">
        {/* <Settings className="h-6 w-6 text-blue-600" /> */}
        <div>
          <h1 className="text-2xl font-bold text-[#0f5fc3]">Certificate Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Configure certificate visibility and download permissions for users
          </p>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="lg:flex lg:gap-6 lg:space-y-0 space-y-6">
        <div className="lg:w-full">
          <Card className="p-6">
            <div className="space-y-8">
              {/* Enable Certificates */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      {settings.enabled ? (
                        <Eye className="h-5 w-5 text-blue-600" />
                      ) : (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <label className="text-base font-semibold text-gray-900">Enable Certificates</label>
                      <p className="text-sm text-gray-500">
                        Allow users to view and access their certificates
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.enabled}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, enabled: checked }))
                    }
                  />
                </div>
              </div>

              {/* Allow Downloads */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Download className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <label className="text-base font-semibold text-gray-900">Allow Downloads</label>
                      <p className="text-sm text-gray-500">
                        Permit users to download certificate PDF files
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.allowDownload}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, allowDownload: checked }))
                    }
                    disabled={!settings.enabled}
                  />
                </div>
              </div>

              {/* Custom Message */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <label className="text-base font-semibold text-gray-900">Custom Message</label>
                    <p className="text-sm text-gray-500">
                      Message displayed when certificates are disabled
                    </p>
                  </div>
                </div>
                <Input
                  placeholder="Enter custom message to display when certificates are disabled..."
                  value={settings.message}
                  onChange={(e) =>
                    setSettings(prev => ({ ...prev, message: e.target.value }))
                  }
                  disabled={!settings.enabled}
                  className="mt-2"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={saveSettings}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-[#2454d7] to-[#2c3fa8] text-white hover:text-white cursor-pointer"
                >
                  <>
                    <Settings className="h-4 w-4" />
                    Save Settings
                  </>
                </Button>

                <Button
                  onClick={resetToDefaults}
                  variant="outline"
                  className="bg-gradient-to-r from-[#2454d7] to-[#2c3fa8] text-white hover:text-white cursor-pointer"
                >
                  Reset to Defaults
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Status Preview Card */}
        <div className="lg:w-80">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Configuration</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Certificate Access</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${settings.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className={`text-sm font-medium ${settings.enabled ? 'text-green-600' : 'text-red-600'}`}>
                    {settings.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Download Permission</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${settings.allowDownload ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className={`text-sm font-medium ${settings.allowDownload ? 'text-green-600' : 'text-red-600'}`}>
                    {settings.allowDownload ? 'Allowed' : 'Not Allowed'}
                  </span>
                </div>
              </div>

              {settings.message && (
                <div className="p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Custom Message</span>
                  <p className="text-sm text-orange-600 mt-1 italic">"{settings.message}"</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
