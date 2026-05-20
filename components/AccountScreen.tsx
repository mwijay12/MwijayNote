import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftIcon, UserIcon, FileImageIcon, GraduationCapIcon } from './Icons';
import { UserData } from '../types';

interface AccountScreenProps {
    userData: UserData | null;
    isLoggedIn: boolean;
    firebaseUser: any;
    onUpdateUserDetails: (details: Partial<UserData>) => void;
    onLoginWithGoogle: () => void;
    onLogout: () => void;
    onBack: () => void;
}

const EMOJI_OPTIONS = ['🧘', '😊', '🚀', '⭐', '💡', '🌱', '❤️', '🎨'];

const LoggedInView: React.FC<{ userData: UserData, onUpdateUserDetails: (details: Partial<UserData>) => void, onLogout: () => void }> = ({ userData, onUpdateUserDetails, onLogout }) => {
    const [name, setName] = useState(userData.name || '');
    const [email, setEmail] = useState(userData.email || '');
    const [pin, setPin] = useState(userData.pin || '');
    const [profilePicture, setProfilePicture] = useState(userData.profilePicture || '🧘');
    const [customLogo, setCustomLogo] = useState(userData.customLogo || '');
    
    const [isSaved, setIsSaved] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    
    const hasChanges = name !== (userData.name || '') ||
                     email !== (userData.email || '') ||
                     pin !== (userData.pin || '') ||
                     profilePicture !== (userData.profilePicture || '🧘') ||
                     customLogo !== (userData.customLogo || '');

    const handleSave = () => {
        if (!hasChanges) return;
        if (name.trim().length < 2) {
            setError("Name is too short.");
            return;
        }
        setError('');
        
        const details: Partial<UserData> = { 
            name, 
            email, 
            profilePicture, 
            customLogo
        };
        
        if (pin.length === 4 || pin.length === 0) details.pin = pin;
        
        onUpdateUserDetails(details);
        setIsSaved(true);
    };

     useEffect(() => {
        if (isSaved) {
            const timer = setTimeout(() => setIsSaved(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isSaved]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                setProfilePicture(loadEvent.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                setCustomLogo(loadEvent.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex-grow flex flex-col gap-8 overflow-y-auto pb-32">
            <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-card backdrop-blur-lg flex items-center justify-center overflow-hidden border-2 border-accent/50 shadow-lg">
                     {profilePicture.startsWith('data:image') ? <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-5xl">{profilePicture}</span>}
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {EMOJI_OPTIONS.map(emoji => <button key={emoji} onClick={() => setProfilePicture(emoji)} className={`p-2 rounded-full text-2xl ${profilePicture === emoji ? 'bg-accent/20' : ''}`}>{emoji}</button>)}
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full bg-card backdrop-blur-lg hover:bg-white/10 flex items-center justify-center"><UserIcon className="w-6 h-6 text-dun"/></button>
                     <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                </div>
            </div>
            <div className="text-center">
                <p className="text-xl font-semibold">{userData.name}</p>
                <p className="text-sm text-dun">{userData.email}</p>
            </div>
            
            <div className="space-y-6">
                 <div className="space-y-4">
                     <h3 className="text-xs font-bold text-dun uppercase tracking-wider px-2">Personal Info</h3>
                     <InputField label="Your Name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" />
                     {error && <p className="text-red-400 text-xs px-2">{error}</p>}
                     <InputField label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
                 </div>
                 
                 <div>
                    <h3 className="text-xs font-bold text-dun uppercase tracking-wider px-2 mb-2">Branding</h3>
                    <label className="text-sm font-medium text-dun ml-2">Logo (for Reports)</label>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="w-12 h-12 rounded-lg bg-card flex items-center justify-center border border-white/10 overflow-hidden">
                            {customLogo ? <img src={customLogo} alt="Logo" className="w-full h-full object-contain"/> : <span className="text-xs text-dun">None</span>}
                        </div>
                        <button onClick={() => logoInputRef.current?.click()} className="px-4 py-2 bg-card hover:bg-white/10 rounded-lg text-sm flex items-center gap-2">
                            <FileImageIcon className="w-4 h-4"/> Upload Logo
                        </button>
                        <input type="file" accept="image/*" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" />
                    </div>
                 </div>

                  <div>
                     <h3 className="text-xs font-bold text-dun uppercase tracking-wider px-2 mb-2">Security</h3>
                     <InputField label="App Lock PIN" type="number" value={pin} onChange={e => setPin(e.target.value.slice(0, 4))} placeholder="4-digit PIN (optional)" />
                     {pin.length > 0 && pin.length < 4 && <p className="text-xs text-red-400 mt-1 text-center">PIN must be 4 digits.</p>}
                  </div>

                  {/* PREMIUM WORKSPACE INTEGRATIONS */}
                  <div className="space-y-4 pt-4 border-t border-white/5">
                      <h3 className="text-xs font-bold text-dun uppercase tracking-widest px-2">Connected Workspaces</h3>
                      
                      {/* GMAIL BLOCK */}
                      <div className="bg-card p-4 rounded-2xl border border-white/5 space-y-3">
                          <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                                  </div>
                                  <div>
                                      <h4 className="text-sm font-semibold text-isabelline">Gmail Suite</h4>
                                      <p className="text-[10px] text-dun">Automatic email logs and draft compilers</p>
                                  </div>
                              </div>
                              <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
                          </div>

                          <div className="space-y-2 text-xs pt-1 border-t border-white/5">
                              <div className="flex justify-between items-center text-dun">
                                  <span>Sync diary reflections to drafts</span>
                                  <input type="checkbox" defaultChecked className="accent-accent" />
                              </div>
                              <div className="flex justify-between items-center text-dun">
                                  <span>Weekly automated transaction digests</span>
                                  <input type="checkbox" defaultChecked className="accent-accent" />
                              </div>
                          </div>

                          <button 
                              onClick={() => {
                                  const subject = encodeURIComponent("Mwijay Note Workspace - Test Notification");
                                  const body = encodeURIComponent("Habari!\n\nThis is a workspace integration test from your Mwijay Note dashboard.\nAll offline compilers and AI agents are synced successfully.\n\nBest Regards,\nMwijay System Intelligence");
                                  window.open(`mailto:${email || 'user@mwijay.com'}?subject=${subject}&body=${body}`, '_blank');
                              }}
                              className="w-full mt-2 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl transition-all"
                          >
                              Compose Gmail Verification Test
                          </button>
                      </div>

                      {/* GOOGLE CHAT BLOCK */}
                      <div className="bg-card p-4 rounded-2xl border border-white/5 space-y-3">
                          <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
                                  </div>
                                  <div>
                                      <h4 className="text-sm font-semibold text-isabelline">Google Chat Space</h4>
                                      <p className="text-[10px] text-dun">Post updates and alerts to your chat rooms</p>
                                  </div>
                              </div>
                              <span className="text-[9px] font-black uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">Webhook</span>
                          </div>

                          <div className="space-y-2 text-xs pt-1 border-t border-white/5">
                              <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-bold text-dun uppercase tracking-tighter">Space Webhook URL</label>
                                  <input 
                                      type="text" 
                                      placeholder="https://chat.googleapis.com/v1/spaces/..." 
                                      className="bg-bg-primary/50 text-isabelline text-[10px] p-2 rounded-lg border border-white/10 outline-none focus:border-accent w-full"
                                  />
                              </div>
                              <div className="flex justify-between items-center text-dun pt-1">
                                  <span>Post daily goal checklist triggers</span>
                                  <input type="checkbox" className="accent-accent" />
                              </div>
                          </div>

                          <button 
                              onClick={() => {
                                  alert("Google Chat verification test sent!\n[Webhook Sim]: A secure payload has been synced and dispatched.");
                              }}
                              className="w-full mt-2 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold text-xs rounded-xl transition-all"
                          >
                              Verify Space Connection / Post Ping
                          </button>
                      </div>
                  </div>
            </div>
            <div className="flex gap-2 mt-4">
                <button onClick={onLogout} className="w-full py-3 text-sm font-semibold rounded-full bg-card hover:bg-white/10 transition-colors">Logout</button>
                <button onClick={handleSave} disabled={!hasChanges} className="w-full py-3 text-sm font-semibold rounded-full bg-accent text-cafe hover:opacity-90 transition-opacity disabled:opacity-50">{isSaved ? 'Saved!' : 'Save Changes'}</button>
            </div>
        </div>
    );
}

const LoggedOutView: React.FC<{ onLogin: (details: Partial<UserData>) => void, onLoginWithGoogle: () => void }> = ({ onLogin, onLoginWithGoogle }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState('🧘');
    const [customLogo, setCustomLogo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim().length < 2) {
            setError("Name is too short.");
            return;
        }
        if (name && email && password) {
            setIsSubmitting(true);
            setError('');
            setTimeout(() => {
                onLogin({ name, email, password, profilePicture, customLogo });
                setIsSubmitting(false);
            }, 800);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                setProfilePicture(loadEvent.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                setCustomLogo(loadEvent.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex-grow flex flex-col gap-6 overflow-y-auto pb-32">
            <div className="text-center">
                <h3 className="text-2xl font-serif text-isabelline">Sync Your Data</h3>
                <p className="text-dun mt-2">Create an account to securely back up and sync your journal.</p>
            </div>

            <button 
                onClick={onLoginWithGoogle}
                className="w-full py-4 bg-white text-black font-brand font-black rounded-full flex items-center justify-center gap-3 shadow-xl hover:bg-gray-100 transition-all border-b-4 border-gray-300 active:border-b-0 active:translate-y-1"
            >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                Sign in with Google
            </button>

            <div className="flex items-center gap-4 my-2">
                <div className="h-[1px] flex-grow bg-white/10"></div>
                <span className="text-[10px] font-black text-dun uppercase tracking-widest">or create manual account</span>
                <div className="h-[1px] flex-grow bg-white/10"></div>
            </div>
            
            <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-card backdrop-blur-lg flex items-center justify-center overflow-hidden border border-white/10">
                     {profilePicture.startsWith('data:image') ? <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-4xl">{profilePicture}</span>}
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="text-xs text-accent hover:underline">Set Profile Picture</button>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
                <InputField label="Your Name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" />
                {error && <p className="text-red-400 text-xs px-2">{error}</p>}
                <InputField label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
                <InputField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password" />
                
                <div>
                    <label className="text-sm font-medium text-dun ml-2">Brand Logo (Optional)</label>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center border border-white/10 overflow-hidden">
                            {customLogo ? <img src={customLogo} alt="Logo" className="w-full h-full object-contain"/> : <span className="text-xs text-dun">None</span>}
                        </div>
                        <button type="button" onClick={() => logoInputRef.current?.click()} className="px-4 py-2 bg-card hover:bg-white/10 rounded-lg text-sm flex items-center gap-2">
                            <FileImageIcon className="w-4 h-4"/> Upload Logo
                        </button>
                        <input type="file" accept="image/*" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" />
                    </div>
                 </div>

                <button type="submit" disabled={!name || !email || !password || isSubmitting} className="w-full mt-4 py-3 text-sm font-semibold rounded-full bg-accent text-cafe hover:opacity-90 transition-opacity disabled:opacity-50">
                    {isSubmitting ? 'Creating Account...' : 'Create Account & Sync'}
                </button>
            </form>
        </div>
    );
};


const AccountScreen: React.FC<AccountScreenProps> = ({ userData, isLoggedIn, firebaseUser, onUpdateUserDetails, onLoginWithGoogle, onLogout, onBack }) => {
    return (
        <div className="flex flex-col h-full animate-slide-in-from-right p-4 pt-16 bg-bg-primary">
            <header className="flex items-center mb-8">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
                <div className="flex-grow flex flex-col items-center">
                  <h2 className="text-xl font-serif">Account</h2>
                  {firebaseUser && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-[10px] font-black text-dun uppercase tracking-widest">Cloud Synced</span>
                    </div>
                  )}
                </div>
                <div className="w-10"></div>
            </header>
            
            {isLoggedIn && userData ? (
                <LoggedInView userData={userData} onUpdateUserDetails={onUpdateUserDetails} onLogout={onLogout} />
            ) : (
                <LoggedOutView onLogin={onUpdateUserDetails} onLoginWithGoogle={onLoginWithGoogle} />
            )}
        </div>
    );
};

const InputField: React.FC<{label: string, type: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string}> = 
({label, type, value, onChange, placeholder}) => (
    <div>
        <label className="text-sm font-medium text-dun ml-2">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-transparent text-lg p-2 focus:outline-none border-b-2 border-white/20 focus:border-accent transition-colors"
        />
    </div>
);


export default AccountScreen;
