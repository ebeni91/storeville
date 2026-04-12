import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, ActivityIndicator
} from 'react-native';
import { ChevronLeft, User, Mail, Phone, Trash2, Save } from 'lucide-react-native';
import { useThemeStore } from '../../../store/themeStore';
import { useAuthStore } from '../../../store/authStore';
import { api } from '../../../lib/api';
import { CustomAlert } from '../../../components/ui/CustomAlert';
import { useAlert } from '../../../lib/useAlert';

interface Props { navigation: any; }

export function SellerAccountInfoScreen({ navigation }: Props) {
  const { colors, mode } = useThemeStore();
  const { logout } = useAuthStore();
  const isDark = mode === 'dark';
  const { alertState, showAlert, hideAlert } = useAlert();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone_number: '' });

  useEffect(() => {
    api.get('/accounts/profile/').then(r => {
      const u = r.data;
      setForm({ first_name: u.first_name || '', last_name: u.last_name || '', email: u.email || '', phone_number: u.phone_number || '' });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.patch('/accounts/profile/', { first_name: form.first_name, last_name: form.last_name, phone_number: form.phone_number });
      showAlert({ title: 'Saved!', message: 'Account details updated successfully.', variant: 'success', buttons: [{ text: 'Great' }] });
    } catch {
      showAlert({ title: 'Save Failed', message: 'Could not save your changes.', variant: 'error', buttons: [{ text: 'OK' }] });
    }
    finally { setSaving(false); }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete('/accounts/profile/');
      logout();
    } catch {
      showAlert({ title: 'Error', message: 'Could not delete account.', variant: 'error', buttons: [{ text: 'OK' }] });
      setDeleting(false);
    }
  };

  const fieldBg = (f: string) => isDark
    ? (focused === f ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)')
    : (focused === f ? colors.surface : colors.surfaceAlt);
  const fieldBorder = (f: string) => focused === f ? colors.accent + '80' : colors.border;

  if (loading) return (
    <View style={[styles.root, { backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator color={colors.accent} size="large" />
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.topBar, { 
        backgroundColor: isDark ? 'rgba(28, 30, 43, 0.98)' : colors.surface, 
        borderBottomColor: isDark ? '#3b3f5c' : colors.border 
      }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={colors.text} size={24} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { color: colors.text }]}>Account Information</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>

        {/* Fields */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Personal Details</Text>
        <View style={[styles.card, { 
          backgroundColor: isDark ? 'rgba(28, 30, 43, 0.95)' : colors.surface, 
          borderColor: isDark ? '#3b3f5c' : colors.border 
        }]}>
          {[
            { key: 'first_name', label: 'First Name',    icon: User,  placeholder: 'Alex' },
            { key: 'last_name',  label: 'Last Name',     icon: User,  placeholder: 'Johnson' },
            { key: 'email',      label: 'Email Address', icon: Mail,  placeholder: 'you@store.com', editable: false },
            { key: 'phone_number', label: 'Phone',       icon: Phone, placeholder: '+251 9xx xxx xxx', kbType: 'phone-pad' },
          ].map((f, idx, arr) => (
            <View key={f.key} style={[styles.fieldWrap, { 
              borderBottomColor: isDark ? '#3b3f5c' : colors.border, 
              borderBottomWidth: idx < arr.length - 1 ? 1 : 0 
            }]}>
              <View style={[styles.fieldIconBox, { backgroundColor: colors.accentFaint }]}>
                <f.icon color={colors.accent} size={15} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{f.label}</Text>
                <TextInput
                  value={(form as any)[f.key]}
                  onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))}
                  onFocus={() => setFocused(f.key)}
                  onBlur={() => setFocused(null)}
                  editable={f.editable !== false}
                  keyboardType={(f.kbType || 'default') as any}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { color: f.editable === false ? colors.textMuted : colors.text }]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Save */}
        <TouchableOpacity onPress={save} disabled={saving} activeOpacity={0.85}
          style={[styles.saveBtn, { backgroundColor: saving ? colors.surfaceAlt : colors.accent }]}>
          {saving ? <ActivityIndicator color="#fff" />
            : <><Save color="#fff" size={17} strokeWidth={2} /><Text style={styles.saveBtnText}>Save Changes</Text></>}
        </TouchableOpacity>

        {/* Danger zone */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: 16 }]}>Danger Zone</Text>
        <View style={[styles.card, { 
          backgroundColor: isDark ? 'rgba(28, 30, 43, 0.95)' : colors.surface, 
          borderColor: isDark ? '#3b3f5c' : colors.dangerBorder 
        }]}>
          {showDeleteConfirm ? (
            <View style={{ padding: 4 }}>
              <Text style={[styles.deleteTitle, { color: colors.danger }]}>Are you absolutely sure?</Text>
              <Text style={[styles.deleteSub, { color: colors.textMuted }]}>This action is permanent and cannot be undone. All store data will be erased.</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <TouchableOpacity onPress={() => setShowDeleteConfirm(false)} style={[styles.dangerCancelBtn, { borderColor: isDark ? '#3b3f5c' : colors.border, backgroundColor: isDark ? 'rgba(28, 30, 43, 0.5)' : colors.surfaceAlt }]}>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={deleteAccount} disabled={deleting} style={[styles.dangerConfirmBtn, { backgroundColor: colors.danger }]}>
                  {deleting ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Yes, Delete Everything</Text>}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setShowDeleteConfirm(true)} activeOpacity={0.7}
              style={[styles.menuRow, { borderBottomWidth: 0 }]}>
              <View style={[styles.menuIconBox, { backgroundColor: isDark ? 'rgba(239,68,68,0.15)' : colors.dangerFaint }]}>
                <Trash2 color={colors.danger} size={17} strokeWidth={2} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.danger }]}>Delete Account</Text>
              <ChevronLeft color={colors.danger} size={17} style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          )}
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
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 },
  card: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, marginBottom: 18 },
  fieldWrap: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  fieldIconBox: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  fieldLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 3 },
  input: { fontSize: 15, fontWeight: '600' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 16, paddingVertical: 16, marginBottom: 8 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  deleteTitle: { fontSize: 16, fontWeight: '900', marginBottom: 6 },
  deleteSub: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  dangerCancelBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1 },
  dangerConfirmBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 18, gap: 14 },
  menuIconBox: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
});
