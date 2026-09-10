import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Network, ConnectionStatus } from '@capacitor/network';
import { Toast } from '@capacitor/toast';
import { GPSLocation } from '../types/survey';

/**
 * Service providing unified interface to Capacitor Native Plugins
 * with seamless fallbacks when running in a standard Web Browser.
 */
export const CapacitorService = {
  /**
   * Get current GPS location using Capacitor Geolocation
   */
  async getCurrentPosition(): Promise<GPSLocation> {
    try {
      const position: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        altitude: position.coords.altitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };
    } catch (error) {
      console.warn('Native Geolocation failed, using web fallback if available', error);
      
      // Fallback for standard HTML5 Geolocation API
      return new Promise((resolve, reject) => {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                altitude: pos.coords.altitude,
                accuracy: pos.coords.accuracy,
                timestamp: pos.timestamp
              });
            },
            (err) => {
              // Return fallback default coordinates (e.g., Ho Chi Minh City center) if permission denied or error
              resolve({
                latitude: 10.776889,
                longitude: 106.700806,
                accuracy: 10,
                timestamp: Date.now()
              });
            },
            { enableHighAccuracy: true, timeout: 8000 }
          );
        } else {
          resolve({
            latitude: 10.776889,
            longitude: 106.700806,
            accuracy: 10,
            timestamp: Date.now()
          });
        }
      });
    }
  },

  /**
   * Capture or select photo using Capacitor Camera
   */
  async takePhoto(source: 'camera' | 'photos' = 'camera'): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
        correctOrientation: true
      });

      return image.dataUrl || null;
    } catch (error) {
      console.warn('Native Camera error or canceled:', error);
      return null;
    }
  },

  /**
   * Check network connection status
   */
  async getNetworkStatus(): Promise<ConnectionStatus> {
    try {
      return await Network.getStatus();
    } catch (e) {
      return {
        connected: navigator.onLine,
        connectionType: 'wifi'
      };
    }
  },

  /**
   * Add listener for network status changes
   */
  async listenNetworkStatus(callback: (status: ConnectionStatus) => void): Promise<{ remove: () => void }> {
    try {
      const handle = await Network.addListener('networkStatusChange', callback);
      return {
        remove: () => handle.remove()
      };
    } catch (e) {
      const handleOnline = () => callback({ connected: true, connectionType: 'wifi' });
      const handleOffline = () => callback({ connected: false, connectionType: 'none' });

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return {
        remove: () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        }
      };
    }
  },

  /**
   * Show native toast message
   */
  async showToast(text: string, duration: 'short' | 'long' = 'short') {
    try {
      await Toast.show({
        text,
        duration: duration === 'short' ? 'short' : 'long',
        position: 'bottom'
      });
    } catch (e) {
      // Browser fallback
      console.log(`[Toast] ${text}`);
    }
  }
};
