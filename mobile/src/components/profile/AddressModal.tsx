import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { X, MapPin, Check } from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

interface AddressModalProps {
  visible: boolean;
  onClose: () => void;
  addressToEdit: any;
}

export function AddressModal({ visible, onClose, addressToEdit }: AddressModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ label: '', street_address: '', city_subcity: '', is_primary: false });

  useEffect(() => {
    if (visible) {
      if (addressToEdit) setFormData(addressToEdit);
      else setFormData({ label: '', street_address: '', city_subcity: '', is_primary: false });
    }
  }, [addressToEdit, visible]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (addressToEdit?.id) return api.put(`/accounts/addresses/${addressToEdit.id}/`, data);
      return api.post('/accounts/addresses/', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      onClose();
    }
  });

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-end bg-black/40">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={{ borderTopLeftRadius: 30, borderTopRightRadius: 30 }} className="bg-white p-6 shadow-2xl">
              <View className="flex-row justify-between items-center mb-6">
                <View className="flex-row items-center">
                  <MapPin size={24} color="#059669" />
                  <Text className="text-2xl font-black text-gray-900 ml-3">
                    {addressToEdit ? 'Edit Address' : 'New Address'}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
                  <X size={20} color="#374151" />
                </TouchableOpacity>
              </View>

              <View className="space-y-4 mb-8">
                <View className="mb-4">
                  <Text style={{ fontSize: 13 }} className="font-bold text-gray-700 mb-2">Label (e.g., Home, Work)</Text>
                  <TextInput 
                    value={formData.label} onChangeText={t => setFormData({...formData, label: t})}
                    className="w-full px-4 py-4 rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-900" 
                    placeholderTextColor="#9ca3af" placeholder="My Home" 
                  />
                </View>
                
                <View className="mb-4">
                  <Text style={{ fontSize: 13 }} className="font-bold text-gray-700 mb-2">Street Address</Text>
                  <TextInput 
                    value={formData.street_address} onChangeText={t => setFormData({...formData, street_address: t})}
                    className="w-full px-4 py-4 rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-900" 
                    placeholderTextColor="#9ca3af" placeholder="House No. 124, Bole Blvd" 
                  />
                </View>

                <View className="mb-4">
                  <Text style={{ fontSize: 13 }} className="font-bold text-gray-700 mb-2">City / Subcity</Text>
                  <TextInput 
                    value={formData.city_subcity} onChangeText={t => setFormData({...formData, city_subcity: t})}
                    className="w-full px-4 py-4 rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-900" 
                    placeholderTextColor="#9ca3af" placeholder="Addis Ababa, Bole" 
                  />
                </View>

                <TouchableOpacity 
                  onPress={() => setFormData({...formData, is_primary: !formData.is_primary})}
                  className="flex-row items-center pt-2 mt-4" activeOpacity={1}
                >
                  <View 
                    style={{ backgroundColor: formData.is_primary ? '#10b981' : '#f9fafb', borderColor: formData.is_primary ? '#10b981' : '#d1d5db' }}
                    className="w-6 h-6 rounded flex items-center justify-center border mr-3"
                  >
                    {formData.is_primary && <Check size={16} color="#ffffff" />}
                  </View>
                  <Text className="font-bold text-gray-700 text-base">Set as Primary Address</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                disabled={mutation.isPending}
                onPress={() => mutation.mutate(formData)}
                style={{ opacity: mutation.isPending ? 0.7 : 1 }}
                className="w-full bg-emerald-600 items-center py-4 rounded-xl shadow-md mb-4"
              >
                {mutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-black text-lg">Save Address</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
