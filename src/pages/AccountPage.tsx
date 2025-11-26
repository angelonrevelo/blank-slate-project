import { useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAppState } from '@/context/AppContext';
import { Button, Input, Modal } from '@/components/ui';

export function AccountPage() {
  const { signOut, changePassword } = useAuth();
  const {
    userLastname,
    userFirstname,
    userTitle,
    userBranch,
    userSignature,
  } = useAppState();

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

  // Logout confirmation state
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName = `${userLastname}${userFirstname ? `, ${userFirstname}` : ''}` || 'Loading...';
  
  const getDisplayTitle = () => {
    if (!userTitle) return 'Loading...';
    const titleMap: Record<string, string> = {
      'OPD': 'OPD Staff',
      'Doctor': 'Ophthalmologist',
      'Nurse': 'OR Staff',
      'Administrator': 'Administrator',
      'Director': 'Medical Director',
      'PhilHealth': 'PhilHealth Officer',
      'Manager': 'Operations Manager',
    };
    return titleMap[userTitle] || userTitle;
  };

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
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
            
            <div className="space-y-4">
              <Input
                label="Full Name"
                value={displayName}
                disabled
                fullWidth
              />
              
              <Input
                label="Title"
                value={getDisplayTitle()}
                disabled
                fullWidth
              />
              
              <Input
                label="Branch"
                value={userBranch || 'Loading...'}
                disabled
                fullWidth
              />
            </div>
          </div>

          {/* Signature Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Signature</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSignatureModal(true)}
              >
                Update Signature
              </Button>
            </div>
            
            {userSignature ? (
              <div className="border rounded-lg p-4 bg-gray-50">
                <img
                  src={userSignature}
                  alt="User Signature"
                  className="max-h-[100px] object-contain mx-auto"
                />
              </div>
            ) : (
              <div className="border rounded-lg p-8 bg-gray-50 text-center">
                <p className="text-gray-500">No signature uploaded</p>
              </div>
            )}
          </div>

          {/* Security Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Security</h2>
            
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
            <div className="mb-4 text-success">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <p className="text-gray-700 mb-4">Password changed successfully!</p>
            <Button onClick={closePasswordModal} fullWidth>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passwordError && (
              <div className="bg-red-50 text-error text-sm p-3 rounded-lg">
                {passwordError}
              </div>
            )}

            <Input
              type="password"
              label="Current Password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              fullWidth
              showPasswordToggle
            />

            <Input
              type="password"
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              fullWidth
              showPasswordToggle
            />

            <Input
              type="password"
              label="Confirm New Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
        onClose={() => setShowSignatureModal(false)}
        title="Update Signature"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Signature upload functionality will be implemented with Supabase storage integration.
          </p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-500">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowSignatureModal(false)}
            fullWidth
          >
            Close
          </Button>
        </div>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Logout"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
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
