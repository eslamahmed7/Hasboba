export type Language = 'ar' | 'en';

export const translations = {
  ar: {
    // General
    'app.name': 'حسبوبة',
    'app.name.en': 'Hasboba',
    
    // Main Dashboard Center
    'home.title': 'الشاشة الرئيسية',
    'vault.title': 'الخزنة',
    'money.in': 'داخلي',
    'money.in.sub': 'دخول الأموال',
    'money.out': 'صرفتي',
    'money.out.sub': 'خروج الأموال',
    'search.placeholder': 'البحث الذكي...',
    'search.title': 'البحث الذكي',
    'quick.add': 'الإضافة السريعة (+)',
    'currency': 'ج.م',
    
    // Debts Widget
    'debts.title': 'إدارة السلف والديون',
    'debts.owed.to.me': 'مسلف',
    'debts.i.owe': 'مستلف',
    'debts.nudge': 'نغزة',
    'debts.whatsapp': 'واتساب',
    'debts.sister': 'علاقتي',
    'debts.subtitle': 'مستلف',
    'debts.leit': 'مسلف',
    'debts.ahmed': 'أحمد',
    'debts.mohamed': 'محمد',
    
    // Savings Widget
    'savings.title': 'التحويش والأهداف والنظام',
    'savings.level': 'المستوى',
    'savings.laptop': 'جهاز لابتوب',
    'savings.mall': 'مول',
    'savings.control': 'الكنترول',
    'savings.achievements': 'الإنجازات',
    
    // Subscriptions Widget
    'subs.title': 'نزيف الاشتراكات',
    'subs.subtitle': 'الاشتراكات النشطة',
    'subs.netflix': 'نتفلكس',
    'subs.watchit': 'ووتش ات',
    'subs.gym': 'الجيم',
    'subs.internet': 'الإنترنت',
    
    // Reports Widget
    'reports.title': 'تقارير ال PDF',
    'reports.subtitle': 'تصنيف التقارير',
    'reports.export': 'تصدير PDF',
    'reports.food': 'طعام',
    'reports.health': 'صحة',
    'reports.entertainment': 'ترفيه',
    'reports.etc': 'إلخ',
    
    // Settings Widget
    'settings.title': 'إعداداتك',
    'settings.currency': 'مصر/ جنيه',
    'settings.language': 'العربي/ الإنجليزية',
    'settings.nightmode': 'الوضع الليلي مفعل',
    'settings.cloudsync': 'مزامنة مع جوجل درايف',
  },
  en: {
    // General
    'app.name': 'Hasboba',
    'app.name.en': 'Hasboba',

    // Main Dashboard Center
    'home.title': 'Home Screen',
    'vault.title': 'Vault',
    'money.in': 'Money In',
    'money.in.sub': 'Income',
    'money.out': 'Money Out',
    'money.out.sub': 'Expenses',
    'search.placeholder': 'Smart Search...',
    'search.title': 'Smart Search',
    'quick.add': 'Quick Add (+)',
    'currency': 'EGP',

    // Debts Widget
    'debts.title': 'Debt & Loan Management',
    'debts.owed.to.me': 'Owed to Me',
    'debts.i.owe': 'I Owe',
    'debts.nudge': 'Nudge',
    'debts.whatsapp': 'WhatsApp',
    'debts.sister': 'My Sister',
    'debts.subtitle': 'Debt',
    'debts.leit': 'Leit',
    'debts.ahmed': 'Ahmed',
    'debts.mohamed': 'Mohamed',

    // Savings Widget
    'savings.title': 'Savings, Goals & System',
    'savings.level': 'Level',
    'savings.laptop': 'Laptop',
    'savings.mall': 'Mall',
    'savings.control': 'Control',
    'savings.achievements': 'Achievements',

    // Subscriptions Widget
    'subs.title': 'Subscription Bleed',
    'subs.subtitle': 'Active Subscriptions',
    'subs.netflix': 'Netflix',
    'subs.watchit': 'Watchit',
    'subs.gym': 'Gym',
    'subs.internet': 'Internet',

    // Reports Widget
    'reports.title': 'PDF Reports',
    'reports.subtitle': 'Categorize reports UI',
    'reports.export': 'Export PDF',
    'reports.food': 'Food',
    'reports.health': 'Health',
    'reports.entertainment': 'Entertainment',
    'reports.etc': 'Etc',

    // Settings Widget
    'settings.title': 'Your Settings',
    'settings.currency': 'Egypt / EGP',
    'settings.language': 'Arabic / English',
    'settings.nightmode': 'Night Mode Enabled',
    'settings.cloudsync': 'Google Drive\nCloud Sync',
  }
};

export type TranslationKey = keyof typeof translations.ar;

