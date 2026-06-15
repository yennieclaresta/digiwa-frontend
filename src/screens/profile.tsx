import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Text } from 'react-native';

import { AppHeader, PrimaryButton, Screen, TextInputField } from '@/components/digiwa';
import { colors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  rt: string;
  rw: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const requiredMessage = 'Data belum lengkap.';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EditProfileScreen() {
  const router = useRouter();
  const { currentUser, updateProfile } = useApp();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    defaultValues: {
      name: currentUser?.name ?? '',
      email: currentUser?.email ?? '',
      phone: currentUser?.phone ?? '',
      address: currentUser?.address ?? '',
      rt: currentUser?.rt ?? '',
      rw: currentUser?.rw ?? '',
    },
  });

  async function onSubmit(values: ProfileForm) {
    setError('');
    setLoading(true);
    try {
      await updateProfile(values);
      router.back();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Gagal menyimpan data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <AppHeader title="Edit Profil" subtitle="Perbarui data akun yang digunakan di DIGIWA." showBack />
      <Controller
        control={control}
        name="name"
        rules={{ required: requiredMessage }}
        render={({ field: { onChange, value } }) => (
          <TextInputField label="Nama Lengkap" value={value} onChangeText={onChange} error={errors.name?.message} />
        )}
      />
      <Controller
        control={control}
        name="email"
        rules={{
          required: requiredMessage,
          validate: (value) => emailPattern.test(value) || 'Format email tidak valid.',
        }}
        render={({ field: { onChange, value } }) => (
          <TextInputField
            label="Email"
            value={value}
            onChangeText={onChange}
            autoCapitalize="none"
            keyboardType="email-address"
            error={errors.email?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="phone"
        rules={{ required: 'Nomor HP wajib diisi.' }}
        render={({ field: { onChange, value } }) => (
          <TextInputField label="Nomor HP" value={value} onChangeText={onChange} keyboardType="phone-pad" error={errors.phone?.message} />
        )}
      />
      {currentUser?.role === 'warga' ? (
        <>
          <Controller
            control={control}
            name="address"
            rules={{ required: requiredMessage }}
            render={({ field: { onChange, value } }) => (
              <TextInputField label="Alamat" value={value} onChangeText={onChange} multiline error={errors.address?.message} />
            )}
          />
          <Controller
            control={control}
            name="rt"
            render={({ field: { onChange, value } }) => (
              <TextInputField label="RT" value={value} onChangeText={onChange} keyboardType="number-pad" error={errors.rt?.message} />
            )}
          />
          <Controller
            control={control}
            name="rw"
            render={({ field: { onChange, value } }) => (
              <TextInputField label="RW" value={value} onChangeText={onChange} keyboardType="number-pad" error={errors.rw?.message} />
            )}
          />
        </>
      ) : null}
      {error ? <Text style={{ color: colors.danger, fontWeight: '700' }}>{error}</Text> : null}
      <PrimaryButton title="Simpan Profil" onPress={handleSubmit(onSubmit)} loading={loading} />
    </Screen>
  );
}

export function ChangePasswordScreen() {
  const router = useRouter();
  const { changePassword } = useApp();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordForm>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  const newPassword = useWatch({ control, name: 'newPassword' });

  async function onSubmit(values: PasswordForm) {
    setError('');
    setLoading(true);
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      router.back();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Gagal menyimpan data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <AppHeader title="Ubah Password" subtitle="Gunakan password baru minimal 6 karakter." showBack />
      <Controller
        control={control}
        name="currentPassword"
        rules={{ required: requiredMessage }}
        render={({ field: { onChange, value } }) => (
          <TextInputField label="Password Saat Ini" value={value} onChangeText={onChange} secureTextEntry error={errors.currentPassword?.message} />
        )}
      />
      <Controller
        control={control}
        name="newPassword"
        rules={{ required: requiredMessage, minLength: { value: 6, message: 'Password minimal 6 karakter.' } }}
        render={({ field: { onChange, value } }) => (
          <TextInputField label="Password Baru" value={value} onChangeText={onChange} secureTextEntry error={errors.newPassword?.message} />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        rules={{
          required: requiredMessage,
          validate: (value) => value === newPassword || 'Konfirmasi password tidak sesuai.',
        }}
        render={({ field: { onChange, value } }) => (
          <TextInputField label="Konfirmasi Password Baru" value={value} onChangeText={onChange} secureTextEntry error={errors.confirmPassword?.message} />
        )}
      />
      {error ? <Text style={{ color: colors.danger, fontWeight: '700' }}>{error}</Text> : null}
      <PrimaryButton title="Simpan Password" onPress={handleSubmit(onSubmit)} loading={loading} />
    </Screen>
  );
}
