import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '@/hooks/use-toast';

interface UserPreferences {
  notifications: {
    task_assigned: boolean;
    surgery_scheduled: boolean;
    clearance_pending: boolean;
    followup_due: boolean;
    patient_assigned: boolean;
    system: boolean;
  };
  display: {
    viewMode: 'comfortable' | 'compact';
    itemsPerPage: number;
  };
  general: {
    autoRefresh: boolean;
    soundAlerts: boolean;
  };
}

const defaultPreferences: UserPreferences = {
  notifications: {
    task_assigned: true,
    surgery_scheduled: true,
    clearance_pending: true,
    followup_due: true,
    patient_assigned: true,
    system: true,
  },
  display: {
    viewMode: 'comfortable',
    itemsPerPage: 20,
  },
  general: {
    autoRefresh: false,
    soundAlerts: true,
  },
};

export function SettingsPage() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('user_preferences')
      .eq('id', user.id)
      .single();

    if (data?.user_preferences) {
      setPreferences(data.user_preferences as any as UserPreferences);
    }
    setLoading(false);
  };

  const savePreferences = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ user_preferences: preferences as any })
      .eq('id', user.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
      });
    } else {
      toast({
        title: 'Settings saved',
        description: 'Your preferences have been updated',
      });
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <header className="bg-secondary px-6 md:px-8 py-6 border-b border-border">
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-3xl space-y-6">
          {/* General Settings */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">General Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Auto Refresh</p>
                  <p className="text-sm text-muted-foreground">Automatically refresh data every 30 seconds</p>
                </div>
                <Switch
                  checked={preferences.general.autoRefresh}
                  onChange={(checked: boolean) =>
                    setPreferences({
                      ...preferences,
                      general: { ...preferences.general, autoRefresh: checked },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Sound Alerts</p>
                  <p className="text-sm text-muted-foreground">Play sound for notifications</p>
                </div>
                <Switch
                  checked={preferences.general.soundAlerts}
                  onChange={(checked: boolean) =>
                    setPreferences({
                      ...preferences,
                      general: { ...preferences.general, soundAlerts: checked },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Notification Preferences</h2>
            <div className="space-y-4">
              {Object.entries(preferences.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground capitalize">
                      {key.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onChange={(checked: boolean) =>
                      setPreferences({
                        ...preferences,
                        notifications: { ...preferences.notifications, [key]: checked },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Display Settings */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Display Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-foreground mb-2">
                  View Mode
                </label>
                <select
                  value={preferences.display.viewMode}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      display: { ...preferences.display, viewMode: e.target.value as 'comfortable' | 'compact' },
                    })
                  }
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="comfortable">Comfortable</option>
                  <option value="compact">Compact</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-foreground mb-2">
                  Items Per Page
                </label>
                <select
                  value={preferences.display.itemsPerPage.toString()}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      display: { ...preferences.display, itemsPerPage: parseInt(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={savePreferences} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
