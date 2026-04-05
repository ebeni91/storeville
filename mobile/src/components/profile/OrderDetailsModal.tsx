import React from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { X, Receipt, MapPin, Truck } from 'lucide-react-native';

interface OrderDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  order: any;
}

export function OrderDetailsModal({ visible, onClose, order }: OrderDetailsModalProps) {
  if (!visible || !order) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-end bg-black/40">
          <TouchableWithoutFeedback>
            <View style={{ borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '70%' }} className="bg-white px-6 pt-6 pb-12 shadow-2xl">
               <View className="flex-row justify-between items-center mb-6">
                 <View className="flex-row items-center">
                   <Receipt size={24} color="#4f46e5" />
                   <Text className="text-2xl font-black text-gray-900 ml-3">
                     Order Details
                   </Text>
                 </View>
                 <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
                   <X size={20} color="#374151" />
                 </TouchableOpacity>
               </View>

               <ScrollView showsVerticalScrollIndicator={false} className="flex-1 mb-4">
                 <View className="bg-gray-50 rounded-2xl p-5 mb-4 border border-gray-100">
                   <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Order ID</Text>
                   <Text className="text-lg font-black text-gray-900 mb-4">{order.id || order.rawId}</Text>
                   
                   <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</Text>
                   <Text className="text-base font-bold text-indigo-600 uppercase mb-4">{order.status}</Text>
                   
                   <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Date</Text>
                   <Text className="text-base font-bold text-gray-900 mb-4">{order.date}</Text>

                   <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total</Text>
                   <Text className="text-xl font-black text-gray-900">{order.total}</Text>
                 </View>

                 <View className="flex-row items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-4">
                   <Truck color="#4f46e5" size={20} />
                   <Text className="text-indigo-800 font-bold ml-3 text-sm flex-1">This order is currently stored in your full history. Detailed itemization will be available soon.</Text>
                 </View>
               </ScrollView>

               <TouchableOpacity onPress={onClose} className="w-full bg-black items-center py-4 rounded-xl shadow-md">
                 <Text className="text-white font-black text-lg">Close Receipt</Text>
               </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
