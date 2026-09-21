import { prisma } from '@/lib/prisma';
import { getTranslations } from '@/lib/i18n/server';
import EventCard from '@/components/EventCard';
import Link from 'next/link';
import { SlidersHorizontal } from 'lucide-react';

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const t = await getTranslations();
  const q = (searchParams.q as string) || '';
  const city = (searchParams.city as string) || '';
  const category = (searchParams.category as string) || '';
  const sort = (searchParams.sort as string) || 'date';

  const where: any = { status: 'PUBLISHED' };
  if (q) where.title = { contains: q, mode: 'insensitive' };
  if (city) where.venue = { city: { contains: city, mode: 'insensitive' } };
  if (category) where.category = { slug: category };

  const events = await prisma.event.findMany({
    where,
    include: { organizer: true, category: true, venue: true, ticketTypes: true },
    orderBy: sort === 'price' ? undefined : { startDate: 'asc' },
  });

  // Sort by min price if requested
  if (sort === 'price') {
    events.sort((a, b) => {
      const aMin = Math.min(...a.ticketTypes.map((tt) => parseFloat(tt.price.toString())));
      const bMin = Math.min(...b.ticketTypes.map((tt) => parseFloat(tt.price.toString())));
      return aMin - bMin;
    });
  }

  const categories = await prisma.eventCategory.findMany({ orderBy: { name: 'asc' } });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{t('nav.events')}</h1>
      <p className="text-gray-500 mb-8">{events.length} {t('events.results')}</p>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
        {/* Filters sidebar */}
        <aside className="space-y-6">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <SlidersHorizontal className="w-4 h-4" /> {t('events.filter_title')}
          </div>

          {/* Category filter */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">{t('search.category')}</h3>
            <div className="space-y-1">
              <Link
                href={`/events${q ? `?q=${q}` : ''}${city ? `${q ? '&' : '?'}city=${city}` : ''}`}
                className={`block text-sm py-1.5 px-3 rounded-lg transition ${!category ? 'bg-gold-400/10 text-gold-300' : 'text-gray-400 hover:bg-ink-700'}`}
              >
                {t('search.all_categories')}
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/events?${new URLSearchParams({ ...(q && { q }), ...(city && { city }), category: cat.slug }).toString()}`}
                  className={`block text-sm py-1.5 px-3 rounded-lg transition ${category === cat.slug ? 'bg-gold-400/10 text-gold-300' : 'text-gray-400 hover:bg-ink-700'}`}
                >
                  {t(`category.${cat.slug}`, cat.name)}
                </Link>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">{t('events.sort_by')}</h3>
            <div className="space-y-1">
              {[
                { key: 'date', label: t('events.sort_date') },
                { key: 'price', label: t('events.sort_price') },
                { key: 'relevance', label: t('events.sort_relevance') },
              ].map((s) => (
                <Link
                  key={s.key}
                  href={`/events?${new URLSearchParams({ ...(q && { q }), ...(city && { city }), ...(category && { category }), sort: s.key }).toString()}`}
                  className={`block text-sm py-1.5 px-3 rounded-lg transition ${sort === s.key ? 'bg-gold-400/10 text-gold-300' : 'text-gray-400 hover:bg-ink-700'}`}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Events grid */}
        <div>
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-gray-500 text-lg">{t('events.no_results')}</p>
              <Link href="/events" className="mt-4 text-gold-400 hover:text-gold-300 text-sm">
                {t('search.all_categories')}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
