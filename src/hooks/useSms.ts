import { Capacitor } from '@capacitor/core';
import { SMSInboxReader } from 'capacitor-sms-inbox';

export function useSms() {
  const checkPermissions = async () => {
    if (!Capacitor.isNativePlatform()) {
      console.warn('SMS reading is only available on Android');
      return false;
    }
    try {
      const status = await SMSInboxReader.checkPermissions();
      return status.sms === 'granted';
    } catch (err) {
      console.error('Error checking SMS permissions', err);
      return false;
    }
  };

  const requestPermissions = async () => {
    if (!Capacitor.isNativePlatform()) {
      alert('قراءة الرسائل تعمل فقط على تطبيق الأندرويد.');
      return false;
    }
    try {
      const status = await SMSInboxReader.requestPermissions();
      if (status.sms === 'granted') {
        return true;
      } else {
        alert('يرجى الموافقة على صلاحية قراءة الرسائل لتتمكن من تسجيل المعاملات تلقائياً.');
        return false;
      }
    } catch (err) {
      console.error('Error requesting SMS permissions', err);
      alert('حدث خطأ أثناء طلب الصلاحيات.');
      return false;
    }
  };

  const getRecentBankSms = async (limit: number = 20) => {
    if (!Capacitor.isNativePlatform()) return [];
    
    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      const granted = await requestPermissions();
      if (!granted) return [];
    }

    try {
      // Filter for SMS from typical bank shortcodes or names (often containing text like 'خصم', 'إيداع', 'purchase')
      // For general reading, we fetch the latest INBOX messages.
      const result = await SMSInboxReader.getSMSList({
        filter: {
          type: 1, // INBOX
          maxCount: limit,
        }
      });
      return result.smsList;
    } catch (err) {
      console.error('Error reading SMS', err);
      return [];
    }
  };

  return { checkPermissions, requestPermissions, getRecentBankSms };
}
