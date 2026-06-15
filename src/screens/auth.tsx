import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { FiLogIn, FiUserPlus } from 'react-icons/fi';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  AppHeader,
  CheckRow,
  PrimaryButton,
  Screen,
  TextInputField,
} from '@/components/digiwa';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

type LoginForm = {
  identifier: string;
  password: string;
};

type RegisterForm = {
  name: string;
  hasNoNik: boolean;
  nik: string;
  kkNumber: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
};

const requiredMessage = 'Data belum lengkap.';
const nikPattern = /^\d{16}$/;
const phonePattern = /^[0-9+]{9,15}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SplashScreen() {
  const router = useRouter();
  const { currentUser, sessionLoading } = useApp();

  useEffect(() => {
    if (sessionLoading) {
      return;
    }

    const timer = setTimeout(() => {
      if (!currentUser) {
        router.replace('/login');
        return;
      }
      router.replace((currentUser.role === 'admin' ? '/(admin)' : '/(warga)') as never);
    }, 900);

    return () => clearTimeout(timer);
  }, [currentUser, router, sessionLoading]);

  return (
    <Screen scroll={false}>
      <View style={styles.splash}>
        <Image source={require('../../assets/digiwa.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.appName}>DIGIWA</Text>
        <Text style={styles.subtitle}>Digitalisasi Data Warga</Text>
        <View style={styles.splashLoading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.splashLoadingText}>Menyiapkan layanan...</Text>
        </View>
      </View>
    </Screen>
  );
}

export function LoginScreen() {
  const router = useRouter();
  const { login } = useApp();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  async function onSubmit(values: LoginForm) {
    setError('');
    setLoading(true);
    try {
      const user = await login({
        identifier: values.identifier,
        password: values.password,
      });
      router.replace((user.role === 'admin' ? '/(admin)' : '/(warga)') as never);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Gagal masuk. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.authBrand}>
        <Image source={require('../../assets/digiwa.png')} style={styles.brandLogo} resizeMode="contain" />
        <View>
          <Text style={styles.appNameSmall}>DIGIWA</Text>
          <Text style={styles.subtitleSmall}>Digitalisasi Data Warga</Text>
        </View>
      </View>

      <AppHeader title="Masuk" subtitle="Email dengan domain @digiwa.id akan diarahkan sebagai admin." />

      <View style={styles.formCard}>
        <Controller
          control={control}
          name="identifier"
          rules={{ required: requiredMessage }}
          render={({ field: { onChange, value } }) => (
            <TextInputField
              label="Email / NIK"
              value={value}
              onChangeText={onChange}
              autoCapitalize="none"
              keyboardType="email-address"
              error={errors.identifier?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          rules={{ required: requiredMessage }}
          render={({ field: { onChange, value } }) => (
            <TextInputField
              label="Password"
              value={value}
              onChangeText={onChange}
              secureTextEntry
              error={errors.password?.message}
            />
          )}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton title="Masuk" icon={FiLogIn} onPress={handleSubmit(onSubmit)} loading={loading} />
      </View>

      <Pressable onPress={() => router.push('/register')} style={styles.authLink}>
        <Text style={styles.authLinkText}>Belum punya akun? Daftar</Text>
      </Pressable>
    </Screen>
  );
}

export function RegisterScreen() {
  const router = useRouter();
  const { register } = useApp();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: {
      name: '',
      hasNoNik: false,
      nik: '',
      kkNumber: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      confirmPassword: '',
    },
  });
  const hasNoNik = useWatch({ control, name: 'hasNoNik' });
  const nik = useWatch({ control, name: 'nik' });
  const password = useWatch({ control, name: 'password' });
  const registerDisabled = !hasNoNik && !nikPattern.test(nik ?? '');

  async function onSubmit(values: RegisterForm) {
    setError('');
    setLoading(true);
    try {
      await register({
        name: values.name,
        nik: values.hasNoNik ? '' : values.nik,
        kkNumber: values.kkNumber,
        email: values.email,
        phone: values.phone,
        address: values.address,
        rt: '',
        rw: '',
        password: values.password,
      });
      router.replace('/(warga)' as never);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Gagal menyimpan data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <AppHeader title="Daftar Warga" subtitle="Lengkapi data diri untuk membuat akun DIGIWA." showBack />
      <View style={styles.formCard}>
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
          name="hasNoNik"
          render={({ field: { onChange, value } }) => (
            <CheckRow
              checked={Boolean(value)}
              onPress={() => {
                const nextValue = !value;
                onChange(nextValue);
                if (nextValue) {
                  setValue('nik', '');
                }
              }}
              label="Saya belum memiliki NIK"
            />
          )}
        />
        <Controller
          control={control}
          name="nik"
          rules={{
            required: hasNoNik ? false : requiredMessage,
            validate: (value) => {
              if (hasNoNik && !value) {
                return true;
              }
              return nikPattern.test(value) || 'Format NIK tidak valid.';
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextInputField
              label={hasNoNik ? 'NIK (opsional)' : 'NIK'}
              value={value}
              onChangeText={onChange}
              keyboardType="number-pad"
              editable={!hasNoNik}
              placeholder={hasNoNik ? 'Dapat dilengkapi setelah terbit' : undefined}
              error={errors.nik?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="kkNumber"
          rules={{
            required: requiredMessage,
            validate: (value) => nikPattern.test(value) || 'Nomor KK harus 16 digit.',
          }}
          render={({ field: { onChange, value } }) => (
            <TextInputField label="Nomor KK" value={value} onChangeText={onChange} keyboardType="number-pad" error={errors.kkNumber?.message} />
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
            <TextInputField label="Email" value={value} onChangeText={onChange} autoCapitalize="none" keyboardType="email-address" error={errors.email?.message} />
          )}
        />
        <Controller
          control={control}
          name="phone"
          rules={{
            required: 'Nomor HP wajib diisi.',
            validate: (value) => phonePattern.test(value) || 'Nomor HP tidak valid.',
          }}
          render={({ field: { onChange, value } }) => (
            <TextInputField label="Nomor HP" value={value} onChangeText={onChange} keyboardType="phone-pad" error={errors.phone?.message} />
          )}
        />
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
          name="password"
          rules={{ required: requiredMessage, minLength: { value: 6, message: 'Password minimal 6 karakter.' } }}
          render={({ field: { onChange, value } }) => (
            <TextInputField label="Password" value={value} onChangeText={onChange} secureTextEntry error={errors.password?.message} />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: requiredMessage,
            validate: (value) => value === password || 'Konfirmasi password tidak sesuai.',
          }}
          render={({ field: { onChange, value } }) => (
            <TextInputField label="Konfirmasi Password" value={value} onChangeText={onChange} secureTextEntry error={errors.confirmPassword?.message} />
          )}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton title="Daftar" icon={FiUserPlus} onPress={handleSubmit(onSubmit)} loading={loading} disabled={registerDisabled} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  logo: {
    width: 118,
    height: 118,
  },
  appName: {
    color: colors.primary,
    fontSize: typography.title,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
  splashLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  splashLoadingText: {
    color: colors.textSecondary,
    fontSize: typography.bodySmall,
  },
  authBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
  },
  brandLogo: {
    width: 58,
    height: 58,
  },
  appNameSmall: {
    color: colors.primary,
    fontSize: typography.h2,
    fontWeight: '900',
  },
  subtitleSmall: {
    color: colors.textSecondary,
  },
  formCard: {
    gap: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  error: {
    color: colors.danger,
    fontWeight: '700',
  },
  authLink: {
    alignItems: 'center',
    padding: spacing.md,
  },
  authLinkText: {
    color: colors.primary,
    fontWeight: '900',
  },
});
