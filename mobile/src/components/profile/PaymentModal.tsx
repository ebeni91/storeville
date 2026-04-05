import React from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { X, CreditCard, Construction } from 'lucide-react-native';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  paymentToEdit: any;
}

export function PaymentModal({ visible, onClose, paymentToEdit }: PaymentModalProps) {
  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-end bg-black/40">
          <TouchableWithoutFeedback>
             <View style={{ borderTopLeftRadius: 30, borderTopRightRadius: 30 }} className="bg-white p-6 shadow-2xl h-1/2">
               <View className="flex-row justify-between items-center mb-6">
                 <View className="flex-row items-center">
                   <CreditCard size={24} color="#6366f1" />
                   <Text className="text-2xl font-black text-gray-900 ml-3">
                     Payment Methods
                   </Text>
                 </View>
                 <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
                   <X size={20} color="#374151" />
                 </TouchableOpacity>
               </View>

               <View className="flex-1 justify-center items-center">
                 <Construction size={48} color="#9ca3af" className="mb-4" />
                 <Text className="text-xl font-bold text-gray-900 text-center">Coming Soon</Text>
                 <Text className="text-gray-500 text-center mt-2 font-medium">Payment management is under construction for the mobile app.</Text>
               </View>
             </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
