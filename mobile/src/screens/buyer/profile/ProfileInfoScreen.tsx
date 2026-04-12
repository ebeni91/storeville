import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, StatusBar, ActivityIndicator
} from 'react-native';
import { useAuthStore } from '../../../store/authStore';
import { authClient } from '../../../lib/auth-client';
import { useThemeStore } from '../../../store/themeStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import {
  ArrowLeft, User, Mail, Phone, MapPin, Plus,
  ChevronRight, Trash2, Edit3, Check, AlertTriangle
} from 'lucide-react-native';
import { CustomAlert } from '../../../components/ui/CustomAlert';
import { useAlert } from '../../../lib/useAlert';

interface Props { navigation: any; }

const fetchAddresses = async () => { const res = await api.get('/accounts/addresses/'); return res.data.results || res.data; };
const fetchProfile = async () => { const res = await api.get('/accounts/profile/'); return res.data; };

export function ProfileInfoScreen({ navigation }: Props) {
  const { logout } = useAuthStore();
  const { data: session } = authClient.useSession();
  const user = session?.user as any;
  const { colors, mode } = useThemeStore();
  const queryClient = useQueryClient();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValue, setFieldValue] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', street_address: '', city_subcity: '', phone_number: '' });
  const { alertState, showAlert, hideAlert } = useAlert();

  const { data: addresses = [], isLoading: loadingAddresses } = useQuery({ queryKey: ['addresses'], queryFn: fetchAddresses });
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: fetchProfile });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => api.patch('/accounts/profile/', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['profile'] }); setEditingField(null); showAlert({ title: 'Updated', message: 'Profile updated successfully.', variant: 'success', buttons: [{ text: 'Great' }] }); },
    onError: () => showAlert({ title: 'Error', message: 'Could not update profile.', variant: 'error', buttons: [{ text: 'OK' }] }),
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/accounts/addresses/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });

  const addAddressMutation = useMutation({
    mutationFn: (data: any) => api.post('/accounts/addresses/', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['addresses'] }); setAddingAddress(false); setNewAddress({ label: '', street_address: '', city_subcity: '', phone_number: '' }); },
    onError: () => showAlert({ title: 'Error', message: 'Could not save address.', variant: 'error', buttons: [{ text: 'OK' }] }),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => api.delete('/accounts/profile/'),
    onSuccess: () => { showAlert({ title: 'Account Deleted', message: 'Your account has been permanently deleted.', variant: 'warning', buttons: [{ text: 'OK', onPress: logout }] }); },
    onError: () => showAlert({ title: 'Error', message: 'Could not delete account. Please contact support.', variant: 'error', buttons: [{ text: 'OK' }] }),
  });

  const displayName = user?.first_name ? `${user.first_name} ${user?.last_name || ''}`.trim() : 'Member';

  const infoRows = [
    { icon: User, label: 'Full Name', field: 'first_name', value: displayName, color: '#6366f1', bg: colors.accentFaint },
    { icon: Mail, label: 'Email Address', field: 'email', value: profile?.email || user?.email || '—', color: '#0ea5e9', bg: mode === 'dark' ? 'rgba(14,165,233,0.12)' : '#f0f9ff' },
    { icon: Phone, label: 'Phone Number', field: 'phone_number', value: profile?.phone_number || user?.phone_number || '—', color: '#10b981', bg: mode === 'dark' ? 'rgba(16,185,129,0.12)' : '#ecfdf5' },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { 
        backgroundColor: mode === 'dark' ? 'rgba(28, 30, 43, 0.98)' : colors.surface, 
        borderBottomColor: mode === 'dark' ? '#3b3f5c' : colors.border 
      }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.surfaceAlt }]}>
          <ArrowLeft color={colors.text} size={22} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile Information</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.body}>

          <View style={styles.avatarSection}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.accent }]}>
              <Text style={styles.avatarLetter}>{displayName.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={[styles.avatarName, { color: colors.text }]}>{displayName}</Text>
            <Text style={[styles.avatarEmail, { color: colors.textMuted }]}>{user?.email}</Text>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Personal Details</Text>
          <View style={[styles.card, { 
            backgroundColor: mode === 'dark' ? 'rgba(28, 30, 43, 0.95)' : colors.surface, 
            borderColor: mode === 'dark' ? '#3b3f5c' : colors.border 
          }]}>
            {infoRows.map((row, idx) => (
              <View key={row.field} style={[styles.infoRow, idx < infoRows.length - 1 && { borderBottomWidth: 1, borderBottomColor: mode === 'dark' ? '#3b3f5c' : colors.border }]}>
                <View style={[styles.iconBox, { backgroundColor: row.bg }]}>
                  <row.icon color={row.color} size={16} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowLabel, { color: colors.textMuted }]}>{row.label}</Text>
                  {editingField === row.field ? (
                    <View style={styles.editRow}>
                      <TextInput
                        value={fieldValue}
                        onChangeText={setFieldValue}
                        style={[styles.editInput, { color: colors.accent, borderBottomColor: colors.accent }]}
                        autoFocus
                      />
                      <TouchableOpacity onPress={() => { if (editingField) updateProfileMutation.mutate({ [editingField]: fieldValue }); }}>
                        {updateProfileMutation.isPending ? <ActivityIndicator color={colors.accent} size="small" /> : <Check color={colors.accent} size={18} strokeWidth={2.5} />}
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={[styles.rowValue, { color: colors.text }]}>{row.value}</Text>
                  )}
                </View>
                {editingField !== row.field && (
                  <TouchableOpacity onPress={() => { setEditingField(row.field); setFieldValue(row.value === '—' ? '' : row.value); }}>
                    <Edit3 color={colors.textMuted} size={16} strokeWidth={2} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Saved Addresses</Text>
          <View style={[styles.card, { 
            backgroundColor: mode === 'dark' ? 'rgba(28, 30, 43, 0.95)' : colors.surface, 
            borderColor: mode === 'dark' ? '#3b3f5c' : colors.border 
          }]}>
            {loadingAddresses ? <ActivityIndicator color={colors.accent} style={{ padding: 20 }} /> :
              addresses.length === 0 ? <Text style={[styles.emptyText, { color: colors.textMuted }]}>No addresses saved yet.</Text> :
              addresses.map((addr: any, idx: number) => (
                <View key={addr.id} style={[styles.addressRow, idx < addresses.length - 1 && { borderBottomWidth: 1, borderBottomColor: mode === 'dark' ? '#3b3f5c' : colors.border }]}>
                  <View style={[styles.iconBox, { backgroundColor: mode === 'dark' ? 'rgba(16,185,129,0.12)' : '#ecfdf5' }]}>
                    <MapPin color="#10b981" size={16} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <Text style={[styles.addressLabel, { color: colors.text }]}>{addr.label}</Text>
                      {addr.is_primary && <View style={styles.primaryBadge}><Text style={styles.primaryText}>Primary</Text></View>}
                    </View>
                    <Text style={[styles.addressStreet, { color: colors.textSub }]}>{addr.street_address}, {addr.city_subcity}</Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteAddressMutation.mutate(addr.id)} style={[styles.deleteBtn, { backgroundColor: colors.dangerFaint }]}>
                    <Trash2 color={colors.danger} size={15} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              ))
            }
            {addingAddress ? (
              <View style={{ padding: 14, gap: 10 }}>
                {[{ placeholder: 'Label (e.g. Home)', key: 'label' }, { placeholder: 'Street Address', key: 'street_address' }, { placeholder: 'City / Sub-city', key: 'city_subcity' }, { placeholder: 'Phone Number', key: 'phone_number' }].map(f => (
                  <TextInput key={f.key} placeholder={f.placeholder} placeholderTextColor={colors.textMuted} value={(newAddress as any)[f.key]} onChangeText={v => setNewAddress(prev => ({ ...prev, [f.key]: v }))}
                    style={[styles.addInput, { 
                      backgroundColor: mode === 'dark' ? 'rgba(28, 30, 43, 0.5)' : colors.surfaceAlt, 
                      color: colors.text, 
                      borderColor: mode === 'dark' ? '#3b3f5c' : colors.border 
                    }]} />
                ))}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity onPress={() => setAddingAddress(false)} style={[styles.formBtn, { backgroundColor: colors.surfaceAlt, flex: 1 }]}><Text style={{ color: colors.textSub, fontWeight: '700' }}>Cancel</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => addAddressMutation.mutate(newAddress)} disabled={addAddressMutation.isPending} style={[styles.formBtn, { backgroundColor: colors.accent, flex: 1 }]}>
                    {addAddressMutation.isPending ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontWeight: '800' }}>Save</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setAddingAddress(true)} style={[styles.addAddressBtn, { borderColor: colors.accentFaint }]}>
                <Plus color={colors.accent} size={16} strokeWidth={2.5} />
                <Text style={[styles.addAddressText, { color: colors.accent }]}>Add New Address</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Danger Zone</Text> */}
          <View style={[styles.card, { 
            backgroundColor: mode === 'dark' ? 'rgba(28, 30, 43, 0.95)' : colors.surface, 
            borderColor: colors.dangerBorder, 
            borderWidth: 1 
          }]}>
            {showDeleteConfirm ? (
              <View style={{ padding: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <AlertTriangle color={colors.danger} size={20} />
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.danger }}>This is irreversible</Text>
                </View>
                <Text style={{ color: colors.textSub, fontSize: 13, fontWeight: '500', marginBottom: 16 }}>All your data, orders, and favourites will be permanently deleted.</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity onPress={() => setShowDeleteConfirm(false)} style={[styles.formBtn, { backgroundColor: colors.surfaceAlt, flex: 1 }]}><Text style={{ color: colors.textSub, fontWeight: '700' }}>Cancel</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteAccountMutation.mutate()} disabled={deleteAccountMutation.isPending} style={[styles.formBtn, { backgroundColor: colors.danger, flex: 1 }]}>
                    {deleteAccountMutation.isPending ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontWeight: '800' }}>Delete Forever</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setShowDeleteConfirm(true)} style={[styles.infoRow, { gap: 14 }]}>
                <View style={[styles.iconBox, { backgroundColor: colors.dangerFaint }]}><Trash2 color={colors.danger} size={16} strokeWidth={2} /></View>
                <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: colors.danger }}>Delete Account</Text>
                <ChevronRight color={colors.danger} size={18} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        variant={alertState.variant}
        buttons={alertState.buttons}
        onDismiss={hideAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  body: { padding: 20 },
  avatarSection: { alignItems: 'center', paddingVertical: 28 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarLetter: { fontSize: 36, fontWeight: '900', color: '#ffffff' },
  avatarName: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  avatarEmail: { fontSize: 13, fontWeight: '500' },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 },
  card: { borderRadius: 20, overflow: 'hidden', marginBottom: 24, borderWidth: 1, padding: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, gap: 12 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 11, fontWeight: '600', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  rowValue: { fontSize: 15, fontWeight: '600' },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  editInput: { flex: 1, fontSize: 15, fontWeight: '600', borderBottomWidth: 1.5, paddingVertical: 4 },
  addressRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, gap: 12 },
  addressLabel: { fontSize: 14, fontWeight: '700' },
  primaryBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  primaryText: { fontSize: 10, fontWeight: '800', color: '#16a34a' },
  addressStreet: { fontSize: 13, fontWeight: '500' },
  deleteBtn: { padding: 8, borderRadius: 10 },
  addAddressBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, marginHorizontal: 14, marginBottom: 8, borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 14 },
  addAddressText: { fontSize: 14, fontWeight: '700' },
  addInput: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontWeight: '500', borderWidth: 1 },
  formBtn: { borderRadius: 12, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  emptyText: { textAlign: 'center', fontWeight: '600', padding: 20 },
});
