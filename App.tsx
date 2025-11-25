import './global.css';
import React, { useState } from 'react';
import { View, StatusBar, TouchableOpacity } from 'react-native';
import { Sidebar } from './src/components/Sidebar';
import { ChatArea } from './src/components/ChatArea';
import { SettingsModal } from './src/components/SettingsModal';
import { useColorScheme } from 'nativewind';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed on mobile
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [chatKey, setChatKey] = useState(0);
  const { colorScheme } = useColorScheme();

  const handleNewChat = () => {
    setChatKey(prev => prev + 1);
    setIsSidebarOpen(false); // Close sidebar after selecting new chat
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#111827]">
      <StatusBar barStyle={colorScheme === 'dark' ? "light-content" : "dark-content"} />

      <ChatArea
        key={chatKey}
        isSidebarOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(true)}
        isDark={colorScheme === 'dark'}
      />

      {/* Overlay for Sidebar */}
      {isSidebarOpen && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsSidebarOpen(false)}
          className="absolute inset-0 bg-black/50 z-40"
        />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(false)}
        onNewChat={handleNewChat}
        onOpenSettings={() => {
          setIsSidebarOpen(false);
          setIsSettingsOpen(true);
        }}
      />

      <SettingsModal
        visible={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </View>
  );
}
