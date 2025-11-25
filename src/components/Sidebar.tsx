import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, Animated, Easing } from 'react-native';
import { Plus, MessageSquare, User, Settings, PanelLeftClose } from 'lucide-react-native';

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    onNewChat: () => void;
    onOpenSettings: () => void;
}

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.8;

export function Sidebar({ isOpen, onToggle, onNewChat, onOpenSettings }: SidebarProps) {
    const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

    useEffect(() => {
        if (isOpen) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -SIDEBAR_WIDTH,
                duration: 300,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }).start();
        }
    }, [isOpen]);

    return (
        <Animated.View
            style={[
                { transform: [{ translateX: slideAnim }] },
            ]}
            className="absolute top-0 left-0 bottom-0 w-[80%] bg-[#171717] z-50 h-full shadow-xl"
        >
            <SafeAreaView className="flex-1">
                <View className="p-3 flex-row items-center justify-between border-b border-white/10">
                    <TouchableOpacity
                        onPress={onNewChat}
                        className="flex-1 flex-row items-center gap-3 px-3 py-3 rounded-md border border-white/20 bg-white/5 mr-2"
                    >
                        <Plus size={16} color="white" />
                        <Text className="text-white text-sm font-medium">Nuevo chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onToggle} className="p-2">
                        <PanelLeftClose size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-2 py-2">
                    <View className="space-y-1">
                        <Text className="text-xs font-medium text-gray-500 px-3 py-2">Hoy</Text>
                        {['Revisión de Contrato: NDA', 'Apelación de Multa de Tráfico', 'Consulta de Divorcio'].map((item, i) => (
                            <TouchableOpacity key={i} className="flex-row items-center gap-3 w-full px-3 py-3 rounded-md">
                                <MessageSquare size={16} color="#9CA3AF" />
                                <Text className="text-gray-100 text-sm" numberOfLines={1}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                <View className="p-3 border-t border-white/10">
                    <TouchableOpacity className="flex-row items-center gap-3 w-full px-3 py-3 rounded-md">
                        <User size={16} color="white" />
                        <Text className="text-white text-sm">Cuenta de usuario</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onOpenSettings} className="flex-row items-center gap-3 w-full px-3 py-3 rounded-md">
                        <Settings size={16} color="white" />
                        <Text className="text-white text-sm">Configuración</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Animated.View>
    );
}
