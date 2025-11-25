import React from 'react';
import { View, Text } from 'react-native';
import { clsx } from 'clsx';
import { useTypewriter } from '../hooks/useTypewriter';

interface MessageProps {
    role: 'user' | 'assistant';
    content: string;
    isStreaming?: boolean;
}

export function Message({ role, content, isStreaming = false }: MessageProps) {
    const { displayedText } = useTypewriter(content, 15, isStreaming);

    return (
        <View className={clsx(
            "w-full px-4 py-2 flex-row",
            role === 'user' ? "justify-end" : "justify-start"
        )}>
            <View className={clsx(
                "rounded-2xl px-4 py-3 max-w-[85%]",
                role === 'user'
                    ? "bg-gray-200/50 dark:bg-white/10"
                    : "bg-transparent"
            )}>
                {/* We render Markdown for both, or just Text for simple user messages if markdown causes issues, but Markdown is safer for consistency */}
                <Text className="text-gray-900 dark:text-gray-100 text-base">
                    {role === 'assistant' && isStreaming ? displayedText : content}
                </Text>
            </View>
        </View>
    );
}
