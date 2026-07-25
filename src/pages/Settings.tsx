import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, User, Bell, Lock, Headphones, Laptop, Globe, HelpCircle, ExternalLink } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const Settings = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState({
    explicitContent: true,
    autoplay: true,
    privateSession: false,
    showFriendActivity: true,
    normalizeVolume: true,
    crossfade: false,
    showLocalFiles: false,
    streamingQuality: 'automatic',
    downloadQuality: 'high',
    language: 'English',
  });

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile', action: () => navigate('/profile') },
        { icon: Lock, label: 'Change password', action: () => {} },
        { icon: Bell, label: 'Notification settings', action: () => {} },
      ],
    },
    {
      title: 'Playback',
      items: [
        {
          icon: Headphones,
          label: 'Allow explicit content',
          toggle: true,
          value: settings.explicitContent,
          onChange: () => setSettings(s => ({ ...s, explicitContent: !s.explicitContent })),
        },
        {
          icon: Headphones,
          label: 'Autoplay',
          description: 'Play similar songs when your music ends',
          toggle: true,
          value: settings.autoplay,
          onChange: () => setSettings(s => ({ ...s, autoplay: !s.autoplay })),
        },
        {
          icon: Headphones,
          label: 'Crossfade',
          toggle: true,
          value: settings.crossfade,
          onChange: () => setSettings(s => ({ ...s, crossfade: !s.crossfade })),
        },
        {
          icon: Headphones,
          label: 'Normalize volume',
          toggle: true,
          value: settings.normalizeVolume,
          onChange: () => setSettings(s => ({ ...s, normalizeVolume: !s.normalizeVolume })),
        },
      ],
    },
    {
      title: 'Privacy',
      items: [
        {
          icon: Lock,
          label: 'Private session',
          description: "Your listening activity won't appear on your profile",
          toggle: true,
          value: settings.privateSession,
          onChange: () => setSettings(s => ({ ...s, privateSession: !s.privateSession })),
        },
        {
          icon: User,
          label: 'Show friend activity',
          toggle: true,
          value: settings.showFriendActivity,
          onChange: () => setSettings(s => ({ ...s, showFriendActivity: !s.showFriendActivity })),
        },
      ],
    },
    {
      title: 'Display',
      items: [
        { icon: Globe, label: 'Language', value: settings.language, action: () => {} },
      ],
    },
    {
      title: 'About',
      items: [
        { icon: HelpCircle, label: 'Help', action: () => {} },
        { icon: ExternalLink, label: 'Terms and Conditions', action: () => {} },
        { icon: ExternalLink, label: 'Privacy Policy', action: () => {} },
      ],
    },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-6 py-6 pb-32 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {/* Account Info */}
        <div className="bg-card rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <h2 className="font-bold text-lg">{user?.name}</h2>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingsSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <div className="bg-card rounded-lg overflow-hidden">
                {section.items.map((item, index) => (
                  <div
                    key={item.label}
                    className={cn(
                      "flex items-center justify-between p-4 hover:bg-accent transition-colors cursor-pointer",
                      index !== section.items.length - 1 && "border-b border-border"
                    )}
                    onClick={item.action}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{item.label}</p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                    </div>
                    
                    {item.toggle ? (
                      <Switch
                        checked={item.value}
                        onCheckedChange={item.onChange}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : item.value ? (
                      <span className="text-muted-foreground">{item.value}</span>
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full bg-card hover:bg-accent rounded-lg p-4 text-left font-medium transition-colors"
          >
            Log out
          </button>

          {/* Version Info */}
          <p className="text-center text-muted-foreground text-sm">
            Spotify Clone v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
