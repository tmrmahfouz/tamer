'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface SiteSettings {
  siteName: string
  siteSlogan: string
  siteLogo: string
  siteDescription: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  contactEmail: string
  contactPhone: string
  contactAddress: string
  facebookUrl: string
  youtubeUrl: string
  instagramUrl: string
  twitterUrl: string
  linkedinUrl: string
  homeHeroTitle: string
  homeHeroSubtitle: string
  homeAboutSection: string
  statsStudents: string
  statsCourses: string
  statsSatisfaction: string
  aboutPageContent: string
  privacyPolicyContent: string
  termsAndConditionsContent: string
  contactPageTitle: string
  contactPageDescription: string
  footerAboutText: string
  footerCopyright: string
  // External Quiz Platform
  externalQuizPlatformEnabled: boolean
  externalQuizPlatformName: string
  externalQuizPlatformUrl: string
}

const defaultSettings: SiteSettings = {
  siteName: 'مستر تامر محفوظ',
  siteSlogan: 'البرمجة والذكاء الاصطناعي',
  siteLogo: '🎓',
  siteDescription: 'منصة تعليمية متخصصة في تعليم البرمجة والذكاء الاصطناعي',
  primaryColor: '#3B82F6',
  secondaryColor: '#8B5CF6',
  accentColor: '#10B981',
  contactEmail: 'info@tamermahfouz.com',
  contactPhone: '+20 123 456 7890',
  contactAddress: 'القاهرة، مصر',
  facebookUrl: '#',
  youtubeUrl: '#',
  instagramUrl: '#',
  twitterUrl: '#',
  linkedinUrl: '#',
  homeHeroTitle: 'تعلم البرمجة والذكاء الاصطناعي',
  homeHeroSubtitle: 'ابدأ رحلتك في عالم التكنولوجيا مع أفضل الدورات التعليمية',
  homeAboutSection: 'نقدم دورات تعليمية احترافية في البرمجة والذكاء الاصطناعي بأسلوب عصري ومبسط',
  statsStudents: '500+',
  statsCourses: '15+',
  statsSatisfaction: '98%',
  aboutPageContent: 'جاري تحميل المحتوى...',
  privacyPolicyContent: 'جاري تحميل سياسة الخصوصية...',
  termsAndConditionsContent: 'جاري تحميل الشروط والأحكام...',
  contactPageTitle: 'تواصل معنا',
  contactPageDescription: 'نحن هنا للإجابة على استفساراتك ومساعدتك في رحلتك التعليمية',
  footerAboutText: 'منصة تعليمية متخصصة في تعليم البرمجة والذكاء الاصطناعي',
  footerCopyright: 'مستر تامر محفوظ. جميع الحقوق محفوظة.',
  externalQuizPlatformEnabled: false,
  externalQuizPlatformName: 'منصة الاختبارات الخارجية',
  externalQuizPlatformUrl: '',
}

const SettingsContext = createContext<SiteSettings>(defaultSettings)

export function useSettings() {
  return useContext(SettingsContext)
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)

  useEffect(() => {
    // Fetch settings from API
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        // Extract only the fields we need, fallback to defaults
        setSettings({
          siteName: data.siteName || defaultSettings.siteName,
          siteSlogan: data.siteSlogan || defaultSettings.siteSlogan,
          siteLogo: data.siteLogo || defaultSettings.siteLogo,
          siteDescription: data.siteDescription || defaultSettings.siteDescription,
          primaryColor: data.primaryColor || defaultSettings.primaryColor,
          secondaryColor: data.secondaryColor || defaultSettings.secondaryColor,
          accentColor: data.accentColor || defaultSettings.accentColor,
          contactEmail: data.contactEmail || defaultSettings.contactEmail,
          contactPhone: data.contactPhone || defaultSettings.contactPhone,
          contactAddress: data.contactAddress || defaultSettings.contactAddress,
          facebookUrl: data.facebookUrl || defaultSettings.facebookUrl,
          youtubeUrl: data.youtubeUrl || defaultSettings.youtubeUrl,
          instagramUrl: data.instagramUrl || defaultSettings.instagramUrl,
          twitterUrl: data.twitterUrl || defaultSettings.twitterUrl,
          linkedinUrl: data.linkedinUrl || defaultSettings.linkedinUrl,
          homeHeroTitle: data.homeHeroTitle || defaultSettings.homeHeroTitle,
          homeHeroSubtitle: data.homeHeroSubtitle || defaultSettings.homeHeroSubtitle,
          homeAboutSection: data.homeAboutSection || defaultSettings.homeAboutSection,
          statsStudents: data.statsStudents || defaultSettings.statsStudents,
          statsCourses: data.statsCourses || defaultSettings.statsCourses,
          statsSatisfaction: data.statsSatisfaction || defaultSettings.statsSatisfaction,
          aboutPageContent: data.aboutPageContent || defaultSettings.aboutPageContent,
          privacyPolicyContent: data.privacyPolicyContent || defaultSettings.privacyPolicyContent,
          termsAndConditionsContent: data.termsAndConditionsContent || defaultSettings.termsAndConditionsContent,
          contactPageTitle: data.contactPageTitle || defaultSettings.contactPageTitle,
          contactPageDescription: data.contactPageDescription || defaultSettings.contactPageDescription,
          footerAboutText: data.footerAboutText || defaultSettings.footerAboutText,
          footerCopyright: data.footerCopyright || defaultSettings.footerCopyright,
          externalQuizPlatformEnabled: data.externalQuizPlatformEnabled === true,
          externalQuizPlatformName: data.externalQuizPlatformName || defaultSettings.externalQuizPlatformName,
          externalQuizPlatformUrl: data.externalQuizPlatformUrl || '',
        })
      })
      .catch(err => {
        console.error('Error loading settings:', err)
        // Keep default settings on error
      })
  }, [])

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  )
}
