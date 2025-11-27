import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button, Input, Modal, SignaturePad, Switch } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type TitleType = Database['public']['Enums']['title_type'];

export function AccountPage() {
  const { user, signOut, changePassword } = useAuth();
  const { toast } = useToast();

  // Profile state
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [title, setTitle] = useState<TitleType>('OPD');
  const [branch, setBranch] = useState('');
  const [signature, setSignature] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Branches list
  const [branches, setBranches] = useState<Array<{ code: string; name: string }>>([]);

  // Preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoLogout, setAutoLogout] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Signature modal state
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [isSavingSignature, setIsSavingSignature] = useState(false);

  // Logout confirmation state
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Load profile data
  useEffect(() => {
    if (!user?.id) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        setFirstname(data.firstname || '');
        setLastname(data.lastname || '');
        setTitle(data.title as TitleType);
        setBranch(data.branch || '');
        setSignature(data.signature_link || '');
      }
    };

    const fetchBranches = async () => {
      const { data } = await supabase
        .from('branches')
        .select('code, name')
        .eq('is_active', true)
        .order('name');

      if (data) {
        setBranches(data);
      }
    };

    fetchProfile();
    fetchBranches();
  }, [user, toast]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          firstname,
          lastname,
          title,
          branch,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      setIsEditingProfile(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveSignature = async (dataUrl: string) => {
    if (!user?.id) return;

    setIsSavingSignature(true);
    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Upload to storage
      const fileName = `${user.id}-${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from('patient-documents')
        .upload(`signatures/${fileName}`, blob, {
          contentType: 'image/png',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('patient-documents')
        .getPublicUrl(`signatures/${fileName}`);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          signature_link: urlData.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSignature(urlData.publicUrl);
      toast({
        title: 'Success',
        description: 'Signature updated successfully',
      });
      setShowSignatureModal(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save signature',
        variant: 'destructive',
      });
    } finally {
      setIsSavingSignature(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsSavingPreferences(true);
    try {
      // Store preferences in localStorage for now
      localStorage.setItem('userPreferences', JSON.stringify({
        emailNotifications,
        soundAlerts,
        autoLogout,
      }));

      toast({
        title: 'Success',
        description: 'Preferences saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save preferences',
        variant: 'destructive',
      });
    } finally {
      setIsSavingPreferences(false);
    }
  };

  // Load preferences
  useEffect(() => {
    const savedPrefs = localStorage.getItem('userPreferences');
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs);
      setEmailNotifications(prefs.emailNotifications ?? true);
      setSoundAlerts(prefs.soundAlerts ?? true);
      setAutoLogout(prefs.autoLogout ?? false);
    }
  }, []);

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(newPassword);
      setPasswordSuccess(true);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-secondary px-6 md:px-10 py-6">
        <h1 className="text-3xl md:text-4xl font-medium text-gray-900">
          Account
        </h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 overflow-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Card */}
          <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
              {!isEditingProfile ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingProfile(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsEditingProfile(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveProfile}
                    loading={isSavingProfile}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Last Name"
                  value={lastname}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setLastname(e.target.value)}
                  disabled={!isEditingProfile}
                  fullWidth
                />
                
                <Input
                  label="First Name"
                  value={firstname}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFirstname(e.target.value)}
                  disabled={!isEditingProfile}
                  fullWidth
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Title</label>
                <select
                  value={title}
                  onChange={(e) => setTitle(e.target.value as TitleType)}
                  disabled={!isEditingProfile}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="OPD">OPD Staff</option>
                  <option value="Doctor">Ophthalmologist</option>
                  <option value="Nurse">OR Staff</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Director">Medical Director</option>
                  <option value="PhilHealth">PhilHealth Officer</option>
                  <option value="Manager">Operations Manager</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Branch</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  disabled={!isEditingProfile}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {branches.map((b) => (
                    <option key={b.code} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Signature Card */}
          <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Signature</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSignatureModal(true)}
              >
                Update Signature
              </Button>
            </div>
            
            {signature ? (
              <div className="border border-border rounded-lg p-4 bg-muted">
                <img
                  src={signature}
                  alt="User Signature"
                  className="max-h-[100px] object-contain mx-auto"
                />
              </div>
            ) : (
              <div className="border border-border rounded-lg p-8 bg-muted text-center">
                <p className="text-muted-foreground">No signature uploaded</p>
              </div>
            )}
          </div>

          {/* Preferences Card */}
          <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Preferences</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSavePreferences}
                loading={isSavingPreferences}
              >
                Save Preferences
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">Sound Alerts</p>
                  <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
                </div>
                <Switch
                  checked={soundAlerts}
                  onChange={setSoundAlerts}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-foreground">Auto Logout</p>
                  <p className="text-sm text-muted-foreground">Logout after 30 minutes of inactivity</p>
                </div>
                <Switch
                  checked={autoLogout}
                  onChange={setAutoLogout}
                />
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Security</h2>
            
            <Button
              variant="outline"
              onClick={() => setShowPasswordModal(true)}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              }
            >
              Change Password
            </Button>
          </div>

          {/* Logout Button */}
          <Button
            variant="danger"
            fullWidth
            onClick={() => setShowLogoutModal(true)}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            }
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={closePasswordModal}
        title="Change Password"
        size="sm"
      >
        {passwordSuccess ? (
          <div className="text-center py-4">
            <div className="mb-4" style={{ color: 'hsl(var(--success))' }}>
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <p className="text-foreground mb-4">Password changed successfully!</p>
            <Button onClick={closePasswordModal} fullWidth>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passwordError && (
              <div className="bg-red-50 text-sm p-3 rounded-lg" style={{ color: 'hsl(var(--error))' }}>
                {passwordError}
              </div>
            )}

            <Input
              type="password"
              label="Current Password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
              required
              fullWidth
              showPasswordToggle
            />

            <Input
              type="password"
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
              required
              fullWidth
              showPasswordToggle
            />

            <Input
              type="password"
              label="Confirm New Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              showPasswordToggle
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={closePasswordModal}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isChangingPassword}
                fullWidth
              >
                Change Password
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Signature Modal */}
      <Modal
        isOpen={showSignatureModal}
        onClose={() => !isSavingSignature && setShowSignatureModal(false)}
        title="Update Signature"
        size="md"
      >
        {isSavingSignature ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-muted-foreground">Saving signature...</p>
          </div>
        ) : (
          <SignaturePad
            onSave={handleSaveSignature}
            initialSignature={signature}
          />
        )}
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Logout"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Are you sure you want to sign out?
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowLogoutModal(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={isLoggingOut}
              onClick={handleLogout}
              fullWidth
            >
              Sign Out
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AccountPage;
