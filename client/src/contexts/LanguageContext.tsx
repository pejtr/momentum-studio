import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'cz';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Menu items
    'menu.dashboard': 'Dashboard',
    'menu.scriptBuilder': 'Script Builder',
    'menu.profiles': 'Profiles',
    'menu.codeGenerator': 'Code Generator',
    'menu.recorder': 'Recorder',
    'menu.dockerManager': 'Docker Manager',
    'menu.socialTemplates': 'Social Templates',
    'menu.bddIntegration': 'BDD Integration',
    'menu.liveMonitor': 'Live Monitor',
    'menu.macosIntegration': 'macOS Integration',
    'menu.collaboration': 'Collaboration',
    'menu.marketplace': 'Marketplace',
    'menu.documentation': 'Documentation',
    'menu.blog': 'Blog',
    'menu.aiGenerator': 'AI Generator',
    'menu.securityTesting': 'Security Testing',
    'menu.dataConverter': 'Data Converter',
    'menu.backlinkChecker': 'Backlink Checker',
    'menu.domainAuthority': 'Domain Authority',
    'menu.remoteJobs': 'Remote Jobs',
    'menu.architecture': 'Architecture',
    'menu.aiPdfSummarizer': 'AI PDF Summarizer',
    'menu.testCaseGenerator': 'Test Case Generator',
    'menu.xmlValidator': 'XML Validator',
    'menu.hermes': 'HERMES AI',

    // Common
    'common.earnings': 'Earnings',
    'common.messages': 'Messages',
    'common.seeAllMessages': 'See all messages',
    'common.noMessages': 'No messages yet',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.close': 'Close',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
    'common.reset': 'Reset',
    'common.all': 'All',
    'common.none': 'None',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.status': 'Status',
    'common.actions': 'Actions',
    'common.details': 'Details',
    'common.settings': 'Settings',
    'common.profile': 'Profile',
    'common.logout': 'Logout',
    'common.login': 'Login',
    'common.online': 'Online',
    'common.offline': 'Offline',
    'common.notifications': 'Notifications',
    'common.help': 'Help',
    'common.version': 'Version',
    'common.system': 'System',

    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.overview': 'Your automation cockpit is ready. Here is your system overview.',
    'dashboard.totalScripts': 'Total Scripts',
    'dashboard.activeProfiles': 'Active Profiles',
    'dashboard.totalExecutions': 'Total Executions',
    'dashboard.runningNow': 'Running Now',
    'dashboard.successRate': 'Success Rate',
    'dashboard.thisWeek': 'this week',
    'dashboard.new': 'new',
    'dashboard.stable': 'Stable',
    'dashboard.resourceMonitor': 'Resource Monitor',
    'dashboard.platformDistribution': 'Platform Distribution',
    'dashboard.weeklyHistory': 'Weekly Execution History',
    'dashboard.recentExecutions': 'Recent Executions',
    'dashboard.completed': 'Completed',
    'dashboard.failed': 'Failed',
    'dashboard.queued': 'Queued',
    'dashboard.running': 'Running',
    'dashboard.cpuCores': 'CPU Cores',
    'dashboard.memory': 'Memory',
    'dashboard.gpu': 'GPU',
    'dashboard.neuralEngine': 'Neural Engine',

    // Blog detail
    'blog.backToBlog': 'Back to Blog',
    'blog.postNotFound': 'Post not found',
    'blog.draft': 'Draft',
    'blog.views': 'views',
    'blog.comments': 'Comments',
    'blog.shareThoughts': 'Share your thoughts...',
    'blog.posting': 'Posting...',
    'blog.postComment': 'Post Comment',
    'blog.loginToComment': 'Please log in to leave a comment.',
    'blog.noComments': 'No comments yet. Be the first to comment!',

    // Job Board
    'jobs.title': 'Remote QA Jobs',
    'jobs.subtitle': 'Find your next remote QA position',
    'jobs.searchPlaceholder': 'Search jobs, companies, skills...',
    'jobs.filters': 'Filters',
    'jobs.skills': 'Skills',
    'jobs.salary': 'Salary',
    'jobs.location': 'Location',
    'jobs.posted': 'Posted',
    'jobs.type': 'Job Type',
    'jobs.companySize': 'Company Size',
    'jobs.tags': 'Tags',
    'jobs.manageTags': 'Manage Tags',
    'jobs.applyNow': 'Apply Now',
    'jobs.saveJob': 'Save Job',
    'jobs.saved': 'Saved',
    'jobs.applied': 'Applied',
    'jobs.interview': 'Interview',
    'jobs.offer': 'Offer',
    'jobs.rejected': 'Rejected',
    'jobs.allJobs': 'All Jobs',
    'jobs.noJobs': 'No jobs found matching your criteria',
    'jobs.totalJobs': 'Total Jobs',
    'jobs.savedJobs': 'Saved',
    'jobs.appliedJobs': 'Applied',
    'jobs.interviews': 'Interviews',

    // Architecture Whiteboard
    'whiteboard.title': 'Architecture Whiteboard',
    'whiteboard.subtitle': 'Drag & drop to design your QA automation architecture',
    'whiteboard.addNode': 'Add Node',
    'whiteboard.clearAll': 'Clear All',
    'whiteboard.exportPng': 'Export PNG',
    'whiteboard.save': 'Save Diagram',
    'whiteboard.load': 'Load Diagram',
    'whiteboard.process': 'Process',
    'whiteboard.tool': 'Tool',
    'whiteboard.database': 'Database',
    'whiteboard.decision': 'Decision',
    'whiteboard.note': 'Note',

    // Status messages
    'status.systemOnline': 'System Online',
    'status.systemOffline': 'System Offline',
    'status.connecting': 'Connecting...',
    'status.connected': 'Connected',
    'status.disconnected': 'Disconnected',

    // Onboarding
    'onboarding.welcome': 'Welcome to QA Automation - AI ToolKit',
    'onboarding.subtitle': 'Your ultimate automation engine cross-platform. Let\'s get you started with a quick tour of the key features.',
    'onboarding.getStarted': 'Get Started',
    'onboarding.skip': 'Skip Tour',
    'onboarding.next': 'Next',
    'onboarding.finish': 'Finish',
    'onboarding.step': 'Step',
    'onboarding.of': 'of',
    'onboarding.complete': 'complete',
  },
  cz: {
    // Menu items
    'menu.dashboard': 'Přehled',
    'menu.scriptBuilder': 'Tvůrce Skriptů',
    'menu.profiles': 'Profily',
    'menu.codeGenerator': 'Generátor Kódu',
    'menu.recorder': 'Nahrávač',
    'menu.dockerManager': 'Docker Manager',
    'menu.socialTemplates': 'Sociální Šablony',
    'menu.bddIntegration': 'BDD Integrace',
    'menu.liveMonitor': 'Živý Monitor',
    'menu.macosIntegration': 'Platformy',
    'menu.collaboration': 'Spolupráce',
    'menu.marketplace': 'Tržiště',
    'menu.documentation': 'Dokumentace',
    'menu.blog': 'Blog',
    'menu.aiGenerator': 'AI Generátor',
    'menu.securityTesting': 'Bezpečnostní Testy',
    'menu.dataConverter': 'Konvertor Dat',
    'menu.backlinkChecker': 'Zpětné Odkazy',
    'menu.domainAuthority': 'Autorita Domény',
    'menu.remoteJobs': 'Vzdálené Pozice',
    'menu.architecture': 'Architektura',
    'menu.aiPdfSummarizer': 'AI PDF Sumarizátor',
    'menu.testCaseGenerator': 'Generátor Testů',
    'menu.xmlValidator': 'XML Validátor',
    'menu.hermes': 'HERMES AI',

    // Common
    'common.earnings': 'Výdělky',
    'common.messages': 'Zprávy',
    'common.seeAllMessages': 'Zobrazit všechny zprávy',
    'common.noMessages': 'Zatím žádné zprávy',
    'common.save': 'Uložit',
    'common.cancel': 'Zrušit',
    'common.delete': 'Smazat',
    'common.edit': 'Upravit',
    'common.add': 'Přidat',
    'common.close': 'Zavřít',
    'common.search': 'Hledat',
    'common.filter': 'Filtrovat',
    'common.export': 'Exportovat',
    'common.import': 'Importovat',
    'common.loading': 'Načítání...',
    'common.error': 'Chyba',
    'common.success': 'Úspěch',
    'common.confirm': 'Potvrdit',
    'common.back': 'Zpět',
    'common.next': 'Další',
    'common.submit': 'Odeslat',
    'common.reset': 'Resetovat',
    'common.all': 'Vše',
    'common.none': 'Žádné',
    'common.yes': 'Ano',
    'common.no': 'Ne',
    'common.status': 'Stav',
    'common.actions': 'Akce',
    'common.details': 'Detaily',
    'common.settings': 'Nastavení',
    'common.profile': 'Profil',
    'common.logout': 'Odhlásit se',
    'common.login': 'Přihlásit se',
    'common.online': 'Online',
    'common.offline': 'Offline',
    'common.notifications': 'Oznámení',
    'common.help': 'Nápověda',
    'common.version': 'Verze',
    'common.system': 'Systém',

    // Dashboard
    'dashboard.welcome': 'Vítejte zpět',
    'dashboard.overview': 'Váš automatizační kokpit je připraven. Zde je přehled vašeho systému.',
    'dashboard.totalScripts': 'Celkem Skriptů',
    'dashboard.activeProfiles': 'Aktivní Profily',
    'dashboard.totalExecutions': 'Celkem Spuštění',
    'dashboard.runningNow': 'Právě Běží',
    'dashboard.successRate': 'Úspěšnost',
    'dashboard.thisWeek': 'tento týden',
    'dashboard.new': 'nové',
    'dashboard.stable': 'Stabilní',
    'dashboard.resourceMonitor': 'Monitor Zdrojů',
    'dashboard.platformDistribution': 'Distribuce Platforem',
    'dashboard.weeklyHistory': 'Týdenní Historie Spuštění',
    'dashboard.recentExecutions': 'Poslední Spuštění',
    'dashboard.completed': 'Dokončeno',
    'dashboard.failed': 'Selhalo',
    'dashboard.queued': 'Ve Frontě',
    'dashboard.running': 'Běží',
    'dashboard.cpuCores': 'Jádra CPU',
    'dashboard.memory': 'Paměť',
    'dashboard.gpu': 'GPU',
    'dashboard.neuralEngine': 'Neuronový Engine',

    // Detail blogu
    'blog.backToBlog': 'Zpět na blog',
    'blog.postNotFound': 'Článek nebyl nalezen',
    'blog.draft': 'Koncept',
    'blog.views': 'zobrazení',
    'blog.comments': 'Komentáře',
    'blog.shareThoughts': 'Podělte se o svůj názor...',
    'blog.posting': 'Odesílání...',
    'blog.postComment': 'Přidat komentář',
    'blog.loginToComment': 'Pro přidání komentáře se prosím přihlaste.',
    'blog.noComments': 'Zatím žádné komentáře. Buďte první, kdo přidá komentář!',

    // Job Board
    'jobs.title': 'Vzdálené QA Pozice',
    'jobs.subtitle': 'Najdi svou další vzdálenou QA pozici',
    'jobs.searchPlaceholder': 'Hledat pozice, firmy, dovednosti...',
    'jobs.filters': 'Filtry',
    'jobs.skills': 'Dovednosti',
    'jobs.salary': 'Plat',
    'jobs.location': 'Lokalita',
    'jobs.posted': 'Zveřejněno',
    'jobs.type': 'Typ Práce',
    'jobs.companySize': 'Velikost Firmy',
    'jobs.tags': 'Štítky',
    'jobs.manageTags': 'Spravovat Štítky',
    'jobs.applyNow': 'Přihlásit se',
    'jobs.saveJob': 'Uložit Pozici',
    'jobs.saved': 'Uloženo',
    'jobs.applied': 'Přihlášeno',
    'jobs.interview': 'Pohovor',
    'jobs.offer': 'Nabídka',
    'jobs.rejected': 'Zamítnuto',
    'jobs.allJobs': 'Všechny Pozice',
    'jobs.noJobs': 'Žádné pozice neodpovídají vašim kritériím',
    'jobs.totalJobs': 'Celkem Pozic',
    'jobs.savedJobs': 'Uloženo',
    'jobs.appliedJobs': 'Přihlášeno',
    'jobs.interviews': 'Pohovory',

    // Architecture Whiteboard
    'whiteboard.title': 'Architektonická Tabule',
    'whiteboard.subtitle': 'Přetáhněte a navrhněte architekturu vašeho QA frameworku',
    'whiteboard.addNode': 'Přidat Uzel',
    'whiteboard.clearAll': 'Vymazat Vše',
    'whiteboard.exportPng': 'Exportovat PNG',
    'whiteboard.save': 'Uložit Diagram',
    'whiteboard.load': 'Načíst Diagram',
    'whiteboard.process': 'Proces',
    'whiteboard.tool': 'Nástroj',
    'whiteboard.database': 'Databáze',
    'whiteboard.decision': 'Rozhodnutí',
    'whiteboard.note': 'Poznámka',

    // Status messages
    'status.systemOnline': 'Systém Online',
    'status.systemOffline': 'Systém Offline',
    'status.connecting': 'Připojování...',
    'status.connected': 'Připojeno',
    'status.disconnected': 'Odpojeno',

    // Onboarding
    'onboarding.welcome': 'Vítejte v QA Automation - AI ToolKit',
    'onboarding.subtitle': 'Váš ultimátní multiplatformní automatizační engine. Pojďme vás provést klíčovými funkcemi.',
    'onboarding.getStarted': 'Začít',
    'onboarding.skip': 'Přeskočit',
    'onboarding.next': 'Další',
    'onboarding.finish': 'Dokončit',
    'onboarding.step': 'Krok',
    'onboarding.of': 'z',
    'onboarding.complete': 'dokončeno',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'cz'; // Default to Czech
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
