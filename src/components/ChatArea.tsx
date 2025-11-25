import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView } from 'react-native';
import { Send, Paperclip, FileText, PanelLeftOpen, Plus, ArrowUp, Mic, Headphones, Menu, Scale } from 'lucide-react-native';
import { Message } from './Message';
import { MediaUploadModal } from './MediaUploadModal';
import { INITIAL_MESSAGE, getRandomResponse } from '../lib/mockData';
import { clsx } from 'clsx';
import { useColorScheme } from 'nativewind';
import { streamChat } from '../services/gemini';

import * as Clipboard from 'expo-clipboard';

interface MessageType {
    id: string;
    role: 'user' | 'model';
    content: string;
    isStreaming?: boolean;
}

interface ChatAreaProps {
    isSidebarOpen: boolean;
    onToggle: () => void;
    isDark: boolean;
}

export function ChatArea({ isSidebarOpen, onToggle, isDark }: ChatAreaProps) {
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [isDebugOpen, setIsDebugOpen] = useState(false);
    const [debugLogs, setDebugLogs] = useState<string[]>([]);
    const flatListRef = useRef<FlatList>(null);

    const SUGGESTIONS = [
        "Redactar contrato de alquiler",
        "Duda sobre despido improcedente",
        "Reclamar multa de tráfico",
        "Crear acuerdo de confidencialidad",
        "Consultar ley de propiedad intelectual"
    ];

    const addDebugLog = (log: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setDebugLogs(prev => [`[${timestamp}] ${log}`, ...prev]);
    };

    const copyLogs = async () => {
        const logsText = debugLogs.join('\n');
        await Clipboard.setStringAsync(logsText);
        alert('Logs copiados al portapapeles');
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: MessageType = {
            id: Date.now().toString(),
            role: 'user',
            content: input
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsTyping(true);
        setDebugLogs([]); // Clear logs on new request

        // Create placeholder for AI response
        const aiMessageId = (Date.now() + 1).toString();
        const aiResponse: MessageType = {
            id: aiMessageId,
            role: 'model',
            content: '',
            isStreaming: true
        };
        setMessages(prev => [...prev, aiResponse]);

        try {
            // Build conversation history
            const history = messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Stream response from Gemini
            await streamChat(
                currentInput,
                history,
                (text) => {
                    setMessages(prev =>
                        prev.map(msg =>
                            msg.id === aiMessageId
                                ? { ...msg, content: text }
                                : msg
                        )
                    );
                },
                addDebugLog // Pass debug callback
            );

            // Mark as complete
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === aiMessageId
                        ? { ...msg, isStreaming: false }
                        : msg
                )
            );
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            addDebugLog(`Error: ${errorMessage}`);

            setMessages(prev =>
                prev.map(msg =>
                    msg.id === aiMessageId
                        ? {
                            ...msg,
                            content: `❌ Error: ${errorMessage}`,
                            isStreaming: false
                        }
                        : msg
                )
            );
        } finally {
            setIsTyping(false);
        }
    };

    useEffect(() => {
        if (flatListRef.current) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }, [messages]);

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-[#111827]">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 relative"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                {/* Background Icon */}
                <View className="absolute inset-0 items-center justify-center pb-48" pointerEvents="none">
                    <Scale size={120} color={isDark ? "#1F2937" : "#F3F4F6"} />
                </View>

                {/* Header */}
                <View className="h-14 flex-row items-center justify-between px-4 bg-white dark:bg-[#111827] z-10">
                    <View className="flex-row items-center gap-3">
                        {!isSidebarOpen && (
                            <TouchableOpacity
                                onPress={onToggle}
                                className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10"
                            >
                                <Menu size={20} color={isDark ? "white" : "#4B5563"} />
                            </TouchableOpacity>
                        )}
                        <Text className="font-medium text-lg text-gray-900 dark:text-white">Lexia</Text>
                    </View>
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => setIsDebugOpen(!isDebugOpen)}
                            className={`px-3 py-1.5 rounded-md ${isDebugOpen ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                        >
                            <Text className={`text-xs font-medium ${isDebugOpen ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                {isDebugOpen ? 'Hide Logs' : 'Debug'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-row items-center gap-2 bg-emerald-600 px-3 py-1.5 rounded-md">
                            <FileText size={14} color="white" />
                            <Text className="text-xs text-white font-medium">Generar Doc</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Debug Logs Overlay */}
                {isDebugOpen && (
                    <View className="absolute top-14 left-0 right-0 h-64 bg-black/90 z-50 p-4 border-b border-gray-700">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-white font-bold">Debug Logs</Text>
                            <TouchableOpacity
                                onPress={copyLogs}
                                className="bg-blue-600 px-3 py-1 rounded"
                            >
                                <Text className="text-white text-xs font-bold">Copiar Todo</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView className="flex-1 bg-gray-900 rounded p-2">
                            <Text
                                className="text-green-400 font-mono text-xs"
                                selectable={true}
                            >
                                {debugLogs.length === 0 ? 'Waiting for logs...' : debugLogs.join('\n')}
                            </Text>
                        </ScrollView>
                    </View>
                )}

                {/* Messages */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <Message
                            role={item.role}
                            content={item.content}
                            isStreaming={item.isStreaming}
                        />
                    )}
                    contentContainerStyle={{ paddingBottom: 20, paddingTop: 20 }}
                    className="flex-1"
                />

                {/* Input Area */}
                <View className="px-4 pb-2 pt-2 bg-white dark:bg-[#111827]">
                    {/* Suggestions */}
                    {messages.length === 0 && (
                        <View className="mb-4">
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                                {SUGGESTIONS.map((suggestion, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => setInput(suggestion)}
                                        className="bg-gray-50 dark:bg-[#1F2937] px-4 py-2.5 rounded-xl mr-3 border border-gray-100 dark:border-gray-700"
                                    >
                                        <Text className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                                            {suggestion}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}




                    <View className="flex-row items-center gap-3">
                        {/* Upload Button */}
                        <TouchableOpacity
                            onPress={() => setIsMediaModalOpen(true)}
                            className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/10 items-center justify-center"
                        >
                            <Plus size={24} color={isDark ? "white" : "#4B5563"} strokeWidth={2.5} />
                        </TouchableOpacity>

                        {/* Text Input Container */}
                        <View className="flex-1 bg-gray-100 dark:bg-white/10 rounded-full flex-row items-center pl-4 pr-1.5 h-12 relative">
                            <TextInput
                                placeholder="Pregunta lo que sea"
                                placeholderTextColor="#9CA3AF"
                                className="flex-1 text-base text-gray-900 dark:text-white mr-2 h-full"
                                value={input}
                                onChangeText={setInput}
                                returnKeyType="send"
                                onSubmitEditing={handleSend}
                                style={{
                                    textAlignVertical: 'center',
                                    paddingTop: 0,
                                    paddingBottom: 0,
                                    includeFontPadding: false, // Android specific fix
                                    lineHeight: undefined // Let system handle line height to avoid clipping
                                }}
                            />

                            {/* Send/Mic Button */}
                            <TouchableOpacity
                                onPress={handleSend}
                                className="p-1 mr-2"
                            >
                                {input ? (
                                    <View className="bg-black dark:bg-white rounded-full p-1.5">
                                        <ArrowUp size={16} color={isDark ? "black" : "white"} strokeWidth={3} />
                                    </View>
                                ) : (
                                    <Mic size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
                                )}
                            </TouchableOpacity>

                            {/* Headphones Button */}
                            <TouchableOpacity className="w-9 h-9 rounded-full bg-black dark:bg-white items-center justify-center">
                                <Headphones size={20} color={isDark ? "black" : "white"} strokeWidth={2} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text
                        className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-1"
                        style={{ paddingLeft: 60 }}
                    >
                        Lexia puede cometer errores. Verifica la información importante.
                    </Text>
                </View>

                {/* Media Upload Modal */}
                <MediaUploadModal
                    visible={isMediaModalOpen}
                    onClose={() => setIsMediaModalOpen(false)}
                    onMediaSelected={(uri) => {
                        console.log('Media selected:', uri);
                        // TODO: Handle media upload
                    }}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
