import React, { useState, useCallback } from 'react';
import { ArrowLeft, Camera, Mic, MapPin, Bell, Download, Upload, Trash2 } from 'lucide-react';
import { UserData } from '../types';

type AppPermissionName = 'camera' | 'microphone' | 'geolocation' | 'notifications';
type PermissionState = 'granted' | 'denied' | 'prompt' | 'unknown' | 'not-supported';

interface PrivacyScreenProps {
  onBack: () => void;
  onClearData: () => void;
  onExportData: () => void;
  onExportPdf: () => void;
  onImportData: (file: File) => void;
  userData: UserData;
  onUpdateUser: (user: UserData) => void;
}

const PrivacyScreen: React.FC<PrivacyScreenProps> = ({
  onBack,
  onClearData,
  onExportData,
  onExportPdf,
  onImportData,
  userData,
  onUpdateUser
}) => {
  // Permission State
  const [permissions, setPermissions] = useState<Record<AppPermissionName, PermissionState>>({
    camera: 'unknown',
    microphone: 'unknown',
    geolocation: 'unknown',
    notifications: 'unknown',
  });

  // Security State
  const [pin, setPin] = useState(userData?.pin || '');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [pinError, setPinError] = useState('');
  
  // --- PERMISSION LOGIC ---

  const checkPermission = useCallback(async (name: AppPermissionName): Promise<PermissionState> => {
    try {
        if (name === 'notifications') {
            if (typeof Notification === 'undefined') return 'not-supported';
            return Notification.permission as PermissionState;
        }
        return 'granted';
    } catch (e) {
        return 'unknown';
    }
  }, []);

  const requestPermission = async (name: AppPermissionName) => {
    if (name === 'notifications' && typeof Notification !== 'undefined') {
        const res = await Notification.requestPermission();
        setPermissions(prev => ({ ...prev, notifications: res as PermissionState }));
    }
  };

  const handleSavePin = () => {
    if (pin.length !== 4) {
        setPinError('PIN must be 4 digits');
        return;
    }
    if (pin !== confirmPin) {
        setPinError('PINs do not match');
        return;
    }
    onUpdateUser({ ...userData, pin });
    setIsSettingPin(false);
    setPinError('');
    alert('PIN set successfully');
  };

  return (
    <div className="flex flex-col h-full bg-jet text-isabelline">
        <div className="p-4 flex items-center gap-4 border-b border-white/5">
            <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full">
                <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Privacy & Security</h1>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-8">
            <section>
                <h2 className="text-sm font-bold text-accent uppercase tracking-wider mb-4">App Permissions</h2>
                <div className="space-y-4">
                    {(['camera', 'microphone', 'geolocation', 'notifications'] as AppPermissionName[]).map(name => (
                        <div key={name} className="flex items-center justify-between p-4 bg-card rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-accent/10 text-accent rounded-xl">
                                    {name === 'camera' && <Camera size={20} />}
                                    {name === 'microphone' && <Mic size={20} />}
                                    {name === 'geolocation' && <MapPin size={20} />}
                                    {name === 'notifications' && <Bell size={20} />}
                                </div>
                                <div>
                                    <p className="font-medium capitalize">{name}</p>
                                    <p className="text-xs text-dun">Status: {permissions[name]}</p>
                                </div>
                            </div>
                            {permissions[name] !== 'granted' && (
                                <button 
                                    onClick={() => requestPermission(name)}
                                    className="px-4 py-1.5 bg-accent text-black text-xs font-bold rounded-full"
                                >
                                    Grant
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-sm font-bold text-accent uppercase tracking-wider mb-4">App Lock</h2>
                <div className="p-4 bg-card rounded-2xl border border-white/5">
                    {isSettingPin ? (
                        <div className="space-y-4">
                            <input 
                                type="password" 
                                placeholder="Enter 4-digit PIN" 
                                value={pin}
                                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                className="w-full bg-jet border border-white/10 p-3 rounded-xl text-center text-2xl tracking-widest"
                            />
                            <input 
                                type="password" 
                                placeholder="Confirm PIN" 
                                value={confirmPin}
                                onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                className="w-full bg-jet border border-white/10 p-3 rounded-xl text-center text-2xl tracking-widest"
                            />
                            {pinError && <p className="text-red-400 text-xs text-center">{pinError}</p>}
                            <div className="flex gap-2">
                                <button onClick={() => setIsSettingPin(false)} className="flex-1 py-3 bg-white/5 rounded-xl font-bold">Cancel</button>
                                <button onClick={handleSavePin} className="flex-1 py-3 bg-accent text-black rounded-xl font-bold">Save PIN</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">PIN Protection</p>
                                <p className="text-xs text-dun">{userData?.pin ? 'App is protected by PIN' : 'Add a PIN to secure your data'}</p>
                            </div>
                            <button 
                                onClick={() => setIsSettingPin(true)}
                                className="px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold"
                            >
                                {userData?.pin ? 'Change PIN' : 'Set PIN'}
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <section>
                <h2 className="text-sm font-bold text-accent uppercase tracking-wider mb-4">Data Management</h2>
                <div className="space-y-3">
                    <button onClick={onExportData} className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl border border-white/5 hover:bg-white/5 transition-colors">
                        <Download size={20} className="text-accent" />
                        <span className="font-medium">Export All Data (JSON)</span>
                    </button>
                    <button onClick={onExportPdf} className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl border border-white/5 hover:bg-white/5 transition-colors">
                        <Download size={20} className="text-accent" />
                        <span className="font-medium">Export All Notes (PDF)</span>
                    </button>
                    <label className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl border border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                        <Upload size={20} className="text-accent" />
                        <span className="font-medium">Import Backup</span>
                        <input type="file" accept=".json" onChange={e => e.target.files?.[0] && onImportData(e.target.files[0])} className="hidden" />
                    </label>
                    <button onClick={onClearData} className="w-full flex items-center gap-3 p-4 bg-red-500/10 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-colors text-red-400">
                        <Trash2 size={20} />
                        <span className="font-medium">Delete All Data</span>
                    </button>
                </div>
            </section>
        </div>
    </div>
  );
};

export default PrivacyScreen;
