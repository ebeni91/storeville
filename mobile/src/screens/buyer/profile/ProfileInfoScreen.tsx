import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, StatusBar, Alert, ActivityIndicator
} from 'react-native';
import { useAuthStore } from '../../../store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import {
  ArrowLeft, User, Mail, Phone, MapPin, Plus,
  ChevronRight, Trash2, Edit3, Check, AlertTriangle
} from 'lucide-react-native';

interface Props { navigation: any; }

const fetchAddresses = async () => { const res = await api.get('/accounts/addresses/'); return res.data.results || res.data; };
const fetchProfile = async () => { const res = await api.get('/accounts/profile/'); return res.data; };

export function ProfileInfoScreen({ navigation }: Props) {
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValue, setFieldValue] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', street_address: '', city_subcity: '', phone_number: '' });

  const { data: addresses = [], isLoading: loadingAddresses } = useQuery({ queryKey: ['addresses'], queryFn: fetchAddresses });
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: fetchProfile });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => api.patch('/accounts/profile/', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['profile'] }); setEditingField(null); Alert.alert('Updated', 'Profile updated successfully.'); },
    onError: () => Alert.alert('Error', 'Could not update profile.'),
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/accounts/addresses/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });

  const addAddressMutation = useMutation({
    mutationFn: (data: any) => api.post('/accounts/addresses/', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['addresses'] }); setAddingAddress(false); setNewAddress({ label: '', street_address: '', city_subcity: '', phone_number: '' }); },
    onError: () => Alert.alert('Error', 'Could not save address.'),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => api.delete('/accounts/profile/'),
    onSuccess: () => { Alert.alert('Account Deleted', 'Your account has been permanently deleted.'); logout(); },
    onError: () => Alert.alert('Error', 'Could not delete account. Please contact support.'),
  });

  const startEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setFieldValue(currentValue || '');
  };

  const saveEdit = () => {
    if (!editingField) return;
    updateProfileMutation.mutate({ [editingField]: fieldValue });
  };

  const displayName = user?.first_name ? `${user.first_name} ${user?.last_name || ''}`.trim() : 'Member';

  const infoRows = [
    { icon: User, label: 'Full Name', field: 'first_name', value: displayName, color: '#6366f1', bg: '#eef2ff' },
    { icon: Mail, label: 'Email Address', field: 'email', value: profile?.email || user?.email || '—', color: '#0ea5e9', bg: '#f0f9ff' },
    { icon: Phone, label: 'Phone Number', field: 'phone_number', value: profile?.phone_number || user?.phone_number || '—', color: '#10b981', bg: '#ecfdf5' },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="#111827" size={22} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Information</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.body}>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>{displayName.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.avatarName}>{displayName}</Text>
            <Text style={styles.avatarEmail}>{user?.email}</Text>
          </View>

          {/* Info rows */}
          <Text style={styles.sectionLabel}>Personal Details</Text>
          <View style={styles.card}>
            {infoRows.map((row, idx) => (
              <View key={row.field}>
                <View style={[styles.infoRow, idx < infoRows.length - 1 && styles.rowDivider]}>
                  <View style={[styles.iconBox, { backgroundColor: row.bg }]}>
                    <row.icon color={row.color} size={16} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{row.label}</Text>
                    {editingField === row.field ? (
                      <View style={styles.editRow}>
                        <TextInput
                          value={fieldValue}
                          onChangeText={setFieldValue}
                          style={styles.editInput}
                          autoFocus
                          autoCapitalize={row.field === 'email' ? 'none' : 'words'}
                        />
                        <TouchableOpacity onPress={saveEdit} style={styles.saveBtn}>
                          {updateProfileMutation.isPending
                            ? <ActivityIndicator color="#6366f1" size="small" />
                            : <Check color="#6366f1" size={18} strokeWidth={2.5} />}
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <Text style={styles.rowValue}>{row.value}</Text>
                    )}
                  </View>
                  {editingField !== row.field && (
                    <TouchableOpacity onPress={() => startEdit(row.field, row.value === '—' ? '' : row.value)}>
                      <Edit3 color="#9ca3af" size={16} strokeWidth={2} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Addresses */}
          <Text style={styles.sectionLabel}>Saved Addresses</Text>
          <View style={styles.card}>
            {loadingAddresses ? (
              <ActivityIndicator color="#6366f1" style={{ padding: 20 }} />
            ) : addresses.length === 0 ? (
              <Text style={styles.emptyText}>No addresses saved yet.</Text>
            ) : (
              addresses.map((addr: any, idx: number) => (
                <View key={addr.id} style={[styles.addressRow, idx < addresses.length - 1 && styles.rowDivider]}>
                  <View style={[styles.iconBox, { backgroundColor: '#ecfdf5' }]}>
                    <MapPin color="#10b981" size={16} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <Text style={styles.addressLabel}>{addr.label}</Text>
                      {addr.is_primary && <View style={styles.primaryBadge}><Text style={styles.primaryText}>Primary</Text></View>}
                    </View>
                    <Text style={styles.addressStreet}>{addr.street_address}, {addr.city_subcity}</Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteAddressMutation.mutate(addr.id)} style={styles.deleteBtn}>
                    <Trash2 color="#ef4444" size={15} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              ))
            )}

            {/* Add address form */}
            {addingAddress ? (
              <View style={styles.addAddressForm}>
                {[
                  { placeholder: 'Label (e.g. Home)', key: 'label' },
                  { placeholder: 'Street Address', key: 'street_address' },
                  { placeholder: 'City / Sub-city', key: 'city_subcity' },
                  { placeholder: 'Phone Number', key: 'phone_number' },
                ].map(f => (
                  <TextInput
                    key={f.key}
                    placeholder={f.placeholder}
                    placeholderTextColor="#9ca3af"
                    value={(newAddress as any)[f.key]}
                    onChangeText={v => setNewAddress(prev => ({ ...prev, [f.key]: v }))}
                    style={styles.addInput}
                  />
                ))}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity onPress={() => setAddingAddress(false)} style={[styles.formBtn, { backgroundColor: '#f3f4f6', flex: 1 }]}>
                    <Text style={{ color: '#6b7280', fontWeight: '700' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => addAddressMutation.mutate(newAddress)}
                    disabled={addAddressMutation.isPending}
                    style={[styles.formBtn, { backgroundColor: '#6366f1', flex: 1 }]}
                  >
                    {addAddressMutation.isPending
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <Text style={{ color: '#ffffff', fontWeight: '800' }}>Save</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setAddingAddress(true)} style={styles.addAddressBtn}>
                <Plus color="#6366f1" size={16} strokeWidth={2.5} />
                <Text style={styles.addAddressText}>Add New Address</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Danger zone */}
          <Text style={styles.sectionLabel}>Danger Zone</Text>
          <View style={[styles.card, { borderColor: '#fecdd3', borderWidth: 1 }]}>
            {showDeleteConfirm ? (
              <View style={{ padding: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <AlertTriangle color="#ef4444" size={20} />
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#ef4444' }}>This is irreversible</Text>
                </View>
                <Text style={{ color: '#6b7280', fontSize: 13, fontWeight: '500', marginBottom: 16 }}>
                  All your data, orders, and favourites will be permanently deleted.
                </Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity onPress={() => setShowDeleteConfirm(false)} style={[styles.formBtn, { backgroundColor: '#f3f4f6', flex: 1 }]}>
                    <Text style={{ color: '#6b7280', fontWeight: '700' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteAccountMutation.mutate()}
                    disabled={deleteAccountMutation.isPending}
                    style={[styles.formBtn, { backgroundColor: '#ef4444', flex: 1 }]}
                  >
                    {deleteAccountMutation.isPending
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <Text style={{ color: '#fff', fontWeight: '800' }}>Delete Forever</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setShowDeleteConfirm(true)} style={[styles.infoRow, { gap: 14 }]}>
                <View style={[styles.iconBox, { backgroundColor: '#fff1f2' }]}>
                  <Trash2 color="#ef4444" size={16} strokeWidth={2} />
                </View>
                <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: '#ef4444' }}>Delete Account</Text>
                <ChevronRight color="#fca5a5" size={18} />
              </TouchableOpacity>
            )}
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
  body: { padding: 20 },
  avatarSection: { alignItems: 'center', paddingVertical: 28 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarLetter: { fontSize: 36, fontWeight: '900', color: '#ffffff' },
  avatarName: { fontSize: 20, fontWeight: '900', color: '#111827', marginBottom: 4 },
  avatarEmail: { fontSize: 13, fontWeight: '500', color: '#6b7280' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 },
  card: { backgroundColor: '#ffffff', borderRadius: 20, overflow: 'hidden', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, padding: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, gap: 12 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 11, fontWeight: '600', color: '#9ca3af', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  rowValue: { fontSize: 15, fontWeight: '600', color: '#111827' },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  editInput: { flex: 1, fontSize: 15, fontWeight: '600', color: '#6366f1', borderBottomWidth: 1.5, borderBottomColor: '#6366f1', paddingVertical: 4 },
  saveBtn: { padding: 4 },
  addressRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, gap: 12 },
  addressLabel: { fontSize: 14, fontWeight: '700', color: '#111827' },
  primaryBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  primaryText: { fontSize: 10, fontWeight: '800', color: '#16a34a' },
  addressStreet: { fontSize: 13, fontWeight: '500', color: '#6b7280' },
  deleteBtn: { padding: 8, backgroundColor: '#fff1f2', borderRadius: 10 },
  addAddressBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, marginHorizontal: 14, marginBottom: 8, borderWidth: 1.5, borderColor: '#e0e7ff', borderStyle: 'dashed', borderRadius: 14 },
  addAddressText: { fontSize: 14, fontWeight: '700', color: '#6366f1' },
  addAddressForm: { padding: 14, gap: 10 },
  addInput: { backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontWeight: '500', color: '#111827', borderWidth: 1, borderColor: '#f3f4f6' },
  formBtn: { borderRadius: 12, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  emptyText: { textAlign: 'center', color: '#9ca3af', fontWeight: '600', padding: 20 },
});
