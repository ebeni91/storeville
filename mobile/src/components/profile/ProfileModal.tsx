import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { X, User, Save } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { authClient } from '../../lib/auth-client';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ProfileModal({ visible, onClose }: ProfileModalProps) {
  const { data: session } = authClient.useSession();
  const user = session?.user as any;
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || ''
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
                  <User size={24} color="#6366f1" />
                  <Text className="text-2xl font-black text-gray-900 ml-3">
                    Edit Profile
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
                  <X size={20} color="#374151" />
                </TouchableOpacity>
              </View>

              <View className="space-y-4 mb-8">
                <View className="mb-4">
                  <Text style={{ fontSize: 13 }} className="font-bold text-gray-700 mb-2">First Name</Text>
                  <TextInput 
                    value={formData.first_name} onChangeText={t => setFormData({...formData, first_name: t})}
                    className="w-full px-4 py-4 rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-900" 
                  />
                </View>
                
                <View className="mb-4">
                  <Text style={{ fontSize: 13 }} className="font-bold text-gray-700 mb-2">Last Name</Text>
                  <TextInput 
                    value={formData.last_name} onChangeText={t => setFormData({...formData, last_name: t})}
                    className="w-full px-4 py-4 rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-900" 
                  />
                </View>

                <View className="mb-4">
                  <Text style={{ fontSize: 13 }} className="font-bold text-gray-700 mb-2">Email Address</Text>
                  <TextInput 
                    value={formData.email} editable={false}
                    className="w-full px-4 py-4 rounded-xl bg-gray-100 border border-gray-200 font-bold text-gray-500 opacity-60" 
                  />
                </View>
              </View>

              <TouchableOpacity onPress={onClose} className="w-full bg-indigo-600 items-center py-4 rounded-xl shadow-md mb-4 flex-row justify-center">
                <Save size={20} color="#ffffff" className="mr-2" />
                <Text className="text-white font-black text-lg">Save Changes</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
