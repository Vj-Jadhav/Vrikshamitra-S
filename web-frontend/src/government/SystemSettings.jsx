// src/government/SystemSettings.jsx
import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Shield, Bell, Mail, Globe, Database, Cpu } from 'lucide-react';
import { API } from "../utils/api";

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'EcoLearn Portal',
    siteDescription: 'Environmental Education Platform',
    supportEmail: 'support@ecolearn.gov',
    maintenanceMode: false,
    
    // Registration Settings
    autoApproveInstitutes: false,
    requireEmailVerification: true,
    maxUsersPerInstitute: 1000,
    
    // Notification Settings
    emailNotifications: true,
    approvalNotifications: true,
    reportNotifications: true,
    
    // Security Settings
    passwordMinLength: 8,
    sessionTimeout: 60,
    twoFactorAuth: false,
    
    // Performance Settings
    cacheEnabled: true,
    backupFrequency: 'daily',
    logRetention: 30
  });

  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

//   const fetchSettings = async () => {
//     try {
//       const res = await API.get('/government/settings');
//       setSettings(res.data);
//     } catch (error) {
//       console.error('Error fetching settings:', error);
//     }
//   };
const fetchSettings = async () => {
  // Simulated mock settings (no backend)
  const sample = {
    siteName: 'EcoLearn Portal',
    siteDescription: 'Environmental Education Platform',
    supportEmail: 'support@ecolearn.gov',
    maintenanceMode: false,

    autoApproveInstitutes: false,
    requireEmailVerification: true,
    maxUsersPerInstitute: 1000,

    emailNotifications: true,
    approvalNotifications: true,
    reportNotifications: true,

    passwordMinLength: 8,
    sessionTimeout: 60,
    twoFactorAuth: false,

    cacheEnabled: true,
    backupFrequency: 'daily',
    logRetention: 30
  };

  setSettings(sample);
};



//   const handleSave = async () => {
//     setLoading(true);
//     setSaveStatus('saving');
    
//     try {
//       await API.put('/government/settings', settings);
//       setSaveStatus('saved');
//       setTimeout(() => setSaveStatus(''), 3000);
//     } catch (error) {
//       setSaveStatus('error');
//       console.error('Error saving settings:', error);
//     } finally {
//       setLoading(false);
//     }
//   };


//for dummy
const handleSave = async () => {
  setLoading(true);
  setSaveStatus('saving');

  // fake delay to simulate API
  setTimeout(() => {
    console.log("Mock saved settings:", settings);
    setSaveStatus('saved');
    setLoading(false);

    setTimeout(() => setSaveStatus(''), 3000);
  }, 1000);
};



  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      fetchSettings();
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const SettingSection = ({ title, icon: Icon, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-100">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
        <Icon className="text-blue-500" size={24} />
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
        <div className="flex gap-4">
          <button
            onClick={handleReset}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <RefreshCw size={20} />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={20} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {saveStatus === 'saved' && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Settings saved successfully!
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error saving settings. Please try again.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <SettingSection title="General Settings" icon={Globe}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => updateSetting('siteName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => updateSetting('supportEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maintenance Mode
                </label>
                <p className="text-sm text-gray-600">Take the site offline for maintenance</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </SettingSection>

        {/* Registration Settings */}
        <SettingSection title="Registration Settings" icon={Mail}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Auto-approve Institutes
                </label>
                <p className="text-sm text-gray-600">Automatically approve new institute registrations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoApproveInstitutes}
                  onChange={(e) => updateSetting('autoApproveInstitutes', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Require Email Verification
                </label>
                <p className="text-sm text-gray-600">Users must verify their email address</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requireEmailVerification}
                  onChange={(e) => updateSetting('requireEmailVerification', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Users per Institute
              </label>
              <input
                type="number"
                value={settings.maxUsersPerInstitute}
                onChange={(e) => updateSetting('maxUsersPerInstitute', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="10000"
              />
            </div>
          </div>
        </SettingSection>

        {/* Security Settings */}
        <SettingSection title="Security Settings" icon={Shield}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Password Length
              </label>
              <input
                type="number"
                value={settings.passwordMinLength}
                onChange={(e) => updateSetting('passwordMinLength', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="6"
                max="20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="5"
                max="480"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Two-Factor Authentication
                </label>
                <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={(e) => updateSetting('twoFactorAuth', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </SettingSection>

        {/* Performance Settings */}
        <SettingSection title="Performance Settings" icon={Cpu}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enable Caching
                </label>
                <p className="text-sm text-gray-600">Improve performance with caching</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.cacheEnabled}
                  onChange={(e) => updateSetting('cacheEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Backup Frequency
              </label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => updateSetting('backupFrequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Log Retention (days)
              </label>
              <input
                type="number"
                value={settings.logRetention}
                onChange={(e) => updateSetting('logRetention', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="365"
              />
            </div>
          </div>
        </SettingSection>
      </div>

      {/* Notification Settings */}
      <SettingSection title="Notification Settings" icon={Bell}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Notifications
              </label>
              <p className="text-sm text-gray-600">Receive email alerts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Approval Notifications
              </label>
              <p className="text-sm text-gray-600">Notify on new registrations</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.approvalNotifications}
                onChange={(e) => updateSetting('approvalNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </SettingSection>
    </div>
  );
};

export default SystemSettings;