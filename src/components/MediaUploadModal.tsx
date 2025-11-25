import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Image, Alert, PanResponder, Animated } from 'react-native';
import { Camera } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

interface MediaUploadModalProps {
    visible: boolean;
    onClose: () => void;
    onMediaSelected?: (uri: string) => void;
}

export function MediaUploadModal({ visible, onClose, onMediaSelected }: MediaUploadModalProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [recentPhotos, setRecentPhotos] = useState<MediaLibrary.Asset[]>([]);
    const [hasMediaPermission, setHasMediaPermission] = useState(false);
    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            requestMediaLibraryPermission();
            translateY.setValue(0);
        }
    }, [visible]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dy) > 5;
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    translateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 100) {
                    Animated.timing(translateY, {
                        toValue: 500,
                        duration: 200,
                        useNativeDriver: true,
                    }).start(() => {
                        onClose();
                    });
                } else {
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    const requestMediaLibraryPermission = async () => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        setHasMediaPermission(status === 'granted');

        if (status === 'granted') {
            loadRecentPhotos();
        }
    };

    const loadRecentPhotos = async () => {
        try {
            const media = await MediaLibrary.getAssetsAsync({
                first: 20,
                mediaType: 'photo',
                sortBy: ['creationTime'],
            });

            // Get actual URIs for each photo
            const photosWithUris = await Promise.all(
                media.assets.map(async (asset) => {
                    const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
                    return {
                        ...asset,
                        displayUri: assetInfo.localUri || assetInfo.uri
                    };
                })
            );

            setRecentPhotos(photosWithUris as any);
        } catch (error) {
            console.error('Error loading photos:', error);
        }
    };

    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara para tomar fotos.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            onMediaSelected?.(result.assets[0].uri);
            onClose();
        }
    };

    const handleOpenGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Necesitamos acceso a la galería para seleccionar fotos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            onMediaSelected?.(result.assets[0].uri);
            onClose();
        }
    };

    const handleSelectRecentPhoto = async (asset: MediaLibrary.Asset) => {
        const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
        if (assetInfo.localUri || assetInfo.uri) {
            onMediaSelected?.(assetInfo.localUri || assetInfo.uri);
            onClose();
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableOpacity
                activeOpacity={1}
                onPress={onClose}
                className="flex-1 justify-end bg-black/50"
            >
                <Animated.View
                    style={{ transform: [{ translateY }] }}
                    {...panResponder.panHandlers}
                    onStartShouldSetResponder={() => true}
                >
                    <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                        <View className="bg-white dark:bg-[#1F2937] rounded-t-3xl p-6 pb-8">
                            {/* Drag Handle */}
                            <View className="items-center mb-4">
                                <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                            </View>

                            {/* Header */}
                            <View className="flex-row items-center justify-between mb-6">
                                <Text className="text-xl font-bold text-gray-900 dark:text-white">Subir Archivo</Text>
                                <TouchableOpacity onPress={handleOpenGallery}>
                                    <Text className="text-base font-medium text-blue-600 dark:text-blue-400">Galería</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Camera Button + Recent Photos Grid */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                className="flex-row"
                            >
                                {/* Camera Button */}
                                <TouchableOpacity
                                    onPress={handleTakePhoto}
                                    className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-white/10 items-center justify-center mr-3 border-2 border-dashed border-gray-300 dark:border-gray-600"
                                >
                                    <Camera size={32} color={isDark ? "white" : "#4B5563"} strokeWidth={1.5} />
                                </TouchableOpacity>

                                {/* Recent Photos */}
                                {hasMediaPermission && recentPhotos.map((photo) => (
                                    <TouchableOpacity
                                        key={photo.id}
                                        onPress={() => handleSelectRecentPhoto(photo)}
                                        className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-700 mr-3"
                                    >
                                        <Image
                                            source={{ uri: (photo as any).displayUri }}
                                            className="w-full h-full"
                                            resizeMode="cover"
                                        />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
}
