import { prisma } from '@/lib/prisma';
import { getTranslations } from '@/lib/i18n/server';
import Link from 'next/link';
import EventCard from '@/components/EventCard';
import SearchBar from '@/components/SearchBar';
import { Calendar, Music, Ticket, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';

export default async function HomePage() {
  const t = await getTranslations();

  const [featuredEvents, upcomingEvents, categories, organizers] = await Promise.all([
    prisma.event.findMany({
      where: { status: 'PUBLISHED', featured: true },
      include: { organizer: true, category: true, venue: true, ticketTypes: true },
      take: 6,
      orderBy: { startDate: 'asc' },
    }),
    prisma.event.findMany({
      where: { status: 'PUBLISHED', startDate: { gte: new Date() } },
      include: { organizer: true, category: true, venue: true, ticketTypes: true },
      take: 8,
      orderBy: { startDate: 'asc' },
    }),
    prisma.eventCategory.findMany({
      include: { events: { where: { status: 'PUBLISHED' }, select: { id: true } } },
    }),
    prisma.organizerProfile.findMany({
      where: { events: { some: { status: 'PUBLISHED' } } },
      include: { events: { where: { status: 'PUBLISHED' }, select: { id: true } } },
      take: 6,
    }),
  ]);

  const categoryIcons: Record<string, string> = {
    concerts: '🎵', spectacles: '🎭', theatre: '🎭', festivals: '🎪',
    soirees: '🪩', conferences: '🎤', sport: '⚽', culture: '🎨',
    loisirs: '🎯', famille: '👨‍👩‍👧', autres: '✨',
  };

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-900/70 via-ink-900/80 to-ink-900" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-400/30 bg-gold-400/5 mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span className="text-sm text-gold-300">{t('home.hero_badge')}</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
            {t('home.hero_title')}
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto animate-slide-up">
            {t('home.hero_subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up">
            <Link href="/events" className="btn-gold px-8 py-3.5 rounded-lg text-base inline-flex items-center justify-center gap-2">
              <Ticket className="w-5 h-5" />
              {t('home.cta_find')}
            </Link>
            <Link href="/dashboard/organizer/events/new" className="btn-outline-gold px-8 py-3.5 rounded-lg text-base inline-flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {t('home.cta_organize')}
            </Link>
          </div>

          <SearchBar />
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">{t('home.categories_title')}</h2>
          <Link href="/events" className="text-gold-400 hover:text-gold-300 text-sm flex items-center gap-1">
            {t('home.view_all')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/events?category=${cat.slug}`}
              className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-ink-500 hover:border-gold-400/40 bg-ink-800 transition-all card-hover"
            >
              <span className="text-3xl">{categoryIcons[cat.slug] || '✨'}</span>
              <span className="text-sm font-medium text-gray-300 group-hover:text-gold-300">
                {t(`category.${cat.slug}`, cat.name)}
              </span>
              <span className="text-xs text-gray-500">{cat.events.length} {t('home.events')}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED EVENTS */}
      {featuredEvents.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">{t('home.featured_title')}</h2>
              <p className="text-gray-500 mt-1">{t('home.featured_subtitle')}</p>
            </div>
            <Link href="/events" className="text-gold-400 hover:text-gold-300 text-sm flex items-center gap-1">
              {t('home.view_all')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* UPCOMING EVENTS */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">{t('home.upcoming_title')}</h2>
            <p className="text-gray-500 mt-1">{t('home.upcoming_subtitle')}</p>
          </div>
          <Link href="/agenda" className="text-gold-400 hover:text-gold-300 text-sm flex items-center gap-1">
            <Calendar className="w-4 h-4" /> {t('home.view_agenda')}
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} compact />
          ))}
        </div>
      </section>

      {/* ORGANIZER CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="relative rounded-2xl overflow-hidden border border-gold-400/20">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1470229363808-4b8e1f6e3c11?w=1920&q=80"
              alt=""
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/90 to-ink-900/60" />
          </div>
          <div className="relative z-10 p-8 md:p-16 max-w-2xl">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">{t('home.organizer_cta_title')}</h2>
            <p className="text-gray-400 mb-8 text-lg">{t('home.organizer_cta_subtitle')}</p>
            <Link href="/dashboard/organizer/events/new" className="btn-gold px-8 py-3.5 rounded-lg inline-flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {t('home.organizer_cta_button')}
            </Link>
          </div>
        </div>
      </section>

      {/* ORGANIZERS */}
      {organizers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">{t('home.organizers_title')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {organizers.map((org) => (
              <Link
                key={org.id}
                href={`/events?organizer=${org.slug}`}
                className="flex flex-col items-center gap-3 p-5 rounded-xl border border-ink-500 hover:border-gold-400/40 bg-ink-800 transition-all card-hover"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-ink-900 font-bold text-lg">
                  {org.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-300 text-center">{org.name}</span>
                <span className="text-xs text-gray-500">{org.events.length} {t('home.events')}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
