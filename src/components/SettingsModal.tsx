import React from 'react';
import { View, Text, TouchableOpacity, Modal, Switch } from 'react-native';
import { X, Moon, Sun } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { clsx } from 'clsx';

interface SettingsModalProps {
    visible: boolean;
    onClose: () => void;
}

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
    const { colorScheme, setColorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const toggleSwitch = () => {
        setColorScheme(isDark ? 'light' : 'dark');
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white dark:bg-[#1F2937] rounded-t-3xl p-6 h-[40%]">
                    <View className="flex-row items-center justify-between mb-8">
                        <Text className="text-xl font-bold text-gray-900 dark:text-white">Configuración</Text>
                        <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 dark:bg-white/10 rounded-full">
                            <X size={20} className="text-gray-900 dark:text-white" color={isDark ? "white" : "black"} />
                        </TouchableOpacity>
                    </View>

                    <View className="space-y-6">
                        <View className="flex-row items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                            <View className="flex-row items-center gap-3">
                                {isDark ? (
                                    <Moon size={24} color="white" />
                                ) : (
                                    <Sun size={24} color="black" />
                                )}
                                <View>
                                    <Text className="text-base font-medium text-gray-900 dark:text-white">Modo Oscuro</Text>
                                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                                        {isDark ? 'Activado' : 'Desactivado'}
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={isDark}
                                onValueChange={toggleSwitch}
                                trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                                thumbColor={'white'}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
