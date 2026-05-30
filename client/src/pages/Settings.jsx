import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  LoaderCircle,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const pageFade = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const inputBaseClass =
  'w-full rounded-2xl border border-[#ead9c7] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition duration-300 placeholder:text-[#a69a8f] focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15';

function FormButton({ children, isLoading, onClick, type = 'button', isPrimary = false, icon: Icon, className = '' }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      disabled={isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${
        isPrimary
          ? 'bg-[#ff7a18] text-[#111111] shadow-[0_18px_30px_rgba(255,122,24,0.24)] hover:-translate-y-0.5'
          : 'border border-[#d8cab9] bg-white text-[#111111] hover:bg-[#fff4ea]'
      } ${className}`}
    >
      {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </motion.button>
  );
}

function AlertBanner({ type, message }) {
  if (!message) {
    return null;
  }

  const toneClasses =
    type === 'success'
      ? 'border-[#f2dfb7] bg-[#fff8df] text-[#8d5c24]'
      : 'border-[#f2d0d0] bg-[#fff1f1] text-[#c64545]';

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`mb-6 flex items-start gap-3 rounded-[22px] border px-4 py-4 shadow-[0_12px_30px_rgba(17,17,17,0.04)] ${toneClasses}`}
    >
      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/60">
        {type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      </span>
      <p className="text-sm font-medium leading-6">{message}</p>
    </motion.div>
  );
}

function SettingsCard({ icon: Icon, title, subtitle, children }) {
  return (
    <motion.article
      variants={pageFade}
      whileHover={{ y: -4 }}
      className="rounded-[30px] border border-[#ead9c7] bg-white/85 p-5 shadow-[0_18px_45px_rgba(17,17,17,0.06)] transition-transform duration-300 sm:p-6"
    >
      <div className="flex items-start gap-4 border-b border-[#ead9c7] pb-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1e3] text-[#d45d10]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-[#111111]">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-[#6e6258]">{subtitle}</p>
        </div>
      </div>

      <div className="pt-5">{children}</div>
    </motion.article>
  );
}

function PasswordField({ label, name, value, onChange, visible, onToggleVisible, placeholder, autoComplete }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#4c4038]">{label}</span>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`${inputBaseClass} pr-12`}
        />
        <button
          type="button"
          onClick={onToggleVisible}
          className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full p-2 text-[#8f6a4b] transition hover:bg-[#fff4ea] hover:text-[#111111]"
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ currentPassword: false, newPassword: false, confirmNewPassword: false });

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
    });
  }, [user]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProfileMessage({ type: '', text: '' });
      setPasswordMessage({ type: '', text: '' });
    }, 4500);

    return () => window.clearTimeout(timer);
  }, [profileMessage.text, passwordMessage.text]);

  const profileIsDirty = useMemo(
    () => profileForm.name.trim().length > 0 && profileForm.email.trim().length > 0,
    [profileForm.email, profileForm.name],
  );

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
  };

  const handleSaveProfile = (event) => {
    event.preventDefault();

    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setProfileMessage({ type: 'error', text: 'Name and email are required.' });
      return;
    }

    setIsSavingProfile(true);
    setProfileMessage({ type: '', text: '' });

    window.setTimeout(() => {
      setIsSavingProfile(false);
      setProfileMessage({ type: 'success', text: 'Profile saved successfully.' });
    }, 900);
  };

  const handleChangePassword = (event) => {
    event.preventDefault();

    const { currentPassword, newPassword, confirmNewPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordMessage({ type: 'error', text: 'All password fields are required.' });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setIsChangingPassword(true);
    setPasswordMessage({ type: '', text: '' });

    window.setTimeout(() => {
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
    }, 900);
  };

  return (
    <div className="bg-[#fff8f0]">
      <motion.section
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
      >
        {/* Page header */}
        <motion.div variants={pageFade} className="max-w-3xl">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-[#111111] sm:text-5xl">
            Settings
          </h1>
          <p className="mt-2 text-base leading-7 text-[#6e6258] sm:text-lg">
            Manage your profile and update your account security settings.
          </p>
        </motion.div>

        <motion.div variants={stagger} className="mt-8 space-y-6">
          {profileMessage.text ? <AlertBanner type={profileMessage.type} message={profileMessage.text} /> : null}
          {passwordMessage.text ? <AlertBanner type={passwordMessage.type} message={passwordMessage.text} /> : null}

          {/* Profile card */}
          <SettingsCard
            icon={UserRound}
            title="Profile Settings"
            subtitle="Update the name and email tied to your PantryPal account."
          >
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#4c4038]">Name</span>
                  <input
                    type="text"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    placeholder="Enter your name"
                    className={inputBaseClass}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#4c4038]">Email</span>
                  <input
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    placeholder="Enter your email"
                    className={inputBaseClass}
                  />
                </label>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <FormButton
                  type="submit"
                  isPrimary
                  isLoading={isSavingProfile}
                  icon={CheckCircle2}
                  className="w-full sm:w-auto"
                >
                  Save Profile
                </FormButton>
              </div>
              {!profileIsDirty ? (
                <p className="text-sm text-[#8b7d70]">Make sure both fields are filled before saving.</p>
              ) : null}
            </form>
          </SettingsCard>

          {/* Password card */}
          <SettingsCard
            icon={Lock}
            title="Change Password"
            subtitle="Choose a stronger password to keep your PantryPal account secure."
          >
            <form onSubmit={handleChangePassword} className="space-y-5">
              <PasswordField
                label="Current Password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                visible={showPasswords.currentPassword}
                onToggleVisible={() => setShowPasswords((current) => ({ ...current, currentPassword: !current.currentPassword }))}
                placeholder="Enter current password"
                autoComplete="current-password"
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <PasswordField
                  label="New Password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  visible={showPasswords.newPassword}
                  onToggleVisible={() => setShowPasswords((current) => ({ ...current, newPassword: !current.newPassword }))}
                  placeholder="Create new password"
                  autoComplete="new-password"
                />

                <PasswordField
                  label="Confirm New Password"
                  name="confirmNewPassword"
                  value={passwordForm.confirmNewPassword}
                  onChange={handlePasswordChange}
                  visible={showPasswords.confirmNewPassword}
                  onToggleVisible={() => setShowPasswords((current) => ({ ...current, confirmNewPassword: !current.confirmNewPassword }))}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <FormButton
                  type="submit"
                  isPrimary
                  isLoading={isChangingPassword}
                  icon={Lock}
                  className="w-full sm:w-auto"
                >
                  Change Password
                </FormButton>
              </div>
            </form>
          </SettingsCard>
        </motion.div>
      </motion.section>
    </div>
  );
}