import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ToastProps = {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onHide: () => void;
};

export function CustomToast({ visible, message, type = 'success', onHide }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, speed: 12, useNativeDriver: true })
      ]).start();

      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -20, duration: 300, useNativeDriver: true })
        ]).start(() => onHide());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const bgColors = {
    success: 'bg-primary-700',
    error: 'bg-red-600',
    info: 'bg-primary-700',
  };

  const icons = {
    success: 'checkmark-circle',
    error: 'close-circle',
    info: 'information-circle',
  };

  return (
    <Animated.View
      style={{ opacity, transform: [{ translateY }] }}
      className={`absolute top-14 left-4 right-4 z-50 flex-row items-center p-4 rounded-xl shadow-lg ${bgColors[type]}`}
    >
      <Ionicons name={icons[type] as any} size={24} color="#fff" />
      <Text className="text-white font-medium ml-3 flex-1">{message}</Text>
    </Animated.View>
  );
}