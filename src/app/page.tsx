// src/app/page.tsx
'use client'; // 标记为客户端组件

import Link from "next/link";
import { Clock, Sunrise, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/i18n'; 

const features = [
  {
    icon: Sunrise,
    titleKey: "features.transformYourLife.title",
    descriptionKey: "features.transformYourLife.description"
  },
  {
    icon: Users,
    titleKey: "features.community.title",
    descriptionKey: "features.community.description"
  },
  {
    icon: Target,
    titleKey: "features.goalTracking.title",
    descriptionKey: "features.goalTracking.description"
  },
  {
    icon: Clock,
    titleKey: "features.dataInsights.title",
    descriptionKey: "features.dataInsights.description"
  }
];

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto pt-20 pb-16">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
            {t('welcome', { club: t('club') })}
          </h1>
          <p className="text-xl text-gray-600 mb-8 whitespace-pre-line">
            {t('hero.joinText')}
          </p>
          <Link href="/auth">
            <Button 
              className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-6 text-lg rounded-full transition-all duration-200 transform hover:scale-105"
            >
              {t('hero.startJourney')}
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto px-4 py-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-sky-100 p-3 rounded-lg">
                  <feature.icon className="w-6 h-6 text-sky-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {t(feature.titleKey)}
                </h3>
              </div>
              <p className="text-gray-600">
                {t(feature.descriptionKey)}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center pb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('cta.readyToTransform')}
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('cta.joinThousands')}
          </p>
          <Link href="/auth">
            <Button 
              className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              {t('cta.joinNow')}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}