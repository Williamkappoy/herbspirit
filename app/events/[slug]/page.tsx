import { prisma } from '@/lib/prisma';
import { getTranslations, getLang } from '@/lib/i18n/server';
import { getCurrentUser } from '@/lib/auth';
import TicketPurchase from '@/components/TicketPurchase';
import EventCard from '@/components/EventCard';
import Link from 'next/link';
import { Calendar, Clock, MapPin, User, Tag } from 'lucide-react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const event = await prisma.event.findUnique({ where: { slug: params.slug } });
  if (!event) return { title: 'Event not found' };
  return {
    title: `${event.title} — Kapibana's Tickets`,
    description: event.description.slice(0, 160),
    openGraph: {
      title: event.title,
      description: event.description.slice(0, 160),
      images: event.image ? [event.image] : [],
    },
  };
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const t = await getTranslations();
  const lang = await getLang();
  const currentUser = await getCurrentUser();

  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    include: {
      organizer: true,
      category: true,
      venue: true,
      ticketTypes: true,
    },
  });

  if (!event || (event.status !== 'PUBLISHED' && currentUser?.role !== 'ADMIN' && event.organizerId !== currentUser?.organizerProfile?.id)) {
    notFound();
  }

  const date = new Date(event.startDate);
  const dateStr = date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : lang === 'nl' ? 'nl-NL' : 'en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString(lang === 'fr' ? 'fr-FR' : lang === 'nl' ? 'nl-NL' : 'en-GB', {
    hour: '2-digit', minute: '2-digit',
  });

  const similarEvents = await prisma.event.findMany({
    where: {
      status: 'PUBLISHED',
      categoryId: event.categoryId,
      id: { not: event.id },
      startDate: { gte: new Date() },
    },
    include: { organizer: true, category: true, venue: true, ticketTypes: true },
    take: 3,
    orderBy: { startDate: 'asc' },
  });

  const ticketTypesData = event.ticketTypes.map((tt) => ({
    id: tt.id,
    name: tt.name,
    description: tt.description,
    price: parseFloat(tt.price.toString()),
    quantity: tt.quantity,
    sold: tt.sold,
    maxPerOrder: tt.maxPerOrder,
  }));

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[400px] overflow-hidden">
        {event.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            {event.category && (
              <Link href={`/events?category=${event.category.slug}`} className="inline-block mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gold-400 text-ink-900">
                  {t(`category.${event.category.slug}`, event.category.name)}
                </span>
              </Link>
            )}
            <h1 className="text-3xl md:text-5xl font-bold mb-3">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {dateStr}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {timeStr}</span>
              {event.venue && (
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {event.venue.name}, {event.venue.city}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
        {/* Left: description */}
        <div>
          <div className="prose prose-invert max-w-none">
            <h2 className="text-xl font-semibold mb-4">{t('event.description')}</h2>
            <p className="text-gray-400 whitespace-pre-line">{event.description}</p>
          </div>

          {/* Practical info */}
          <div className="mt-10 space-y-4">
            <h2 className="text-xl font-semibold">{t('event.practical_info')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-ink-500 bg-ink-800">
                <div className="flex items-center gap-2 text-gold-300 text-sm font-medium mb-1">
                  <Calendar className="w-4 h-4" /> {t('event.date')}
                </div>
                <p className="text-gray-400 text-sm">{dateStr} — {timeStr}</p>
              </div>
              {event.venue && (
                <div className="p-4 rounded-xl border border-ink-500 bg-ink-800">
                  <div className="flex items-center gap-2 text-gold-300 text-sm font-medium mb-1">
                    <MapPin className="w-4 h-4" /> {t('event.venue')}
                  </div>
                  <p className="text-gray-400 text-sm">{event.venue.name}</p>
                  {event.venue.address && <p className="text-gray-500 text-sm">{event.venue.address}</p>}
                  <p className="text-gray-500 text-sm">{event.venue.postalCode} {event.venue.city}</p>
                </div>
              )}
              <div className="p-4 rounded-xl border border-ink-500 bg-ink-800">
                <div className="flex items-center gap-2 text-gold-300 text-sm font-medium mb-1">
                  <User className="w-4 h-4" /> {t('event.organizer')}
                </div>
                <p className="text-gray-400 text-sm">{event.organizer.name}</p>
              </div>
              {event.category && (
                <div className="p-4 rounded-xl border border-ink-500 bg-ink-800">
                  <div className="flex items-center gap-2 text-gold-300 text-sm font-medium mb-1">
                    <Tag className="w-4 h-4" /> {t('event.category')}
                  </div>
                  <p className="text-gray-400 text-sm">{t(`category.${event.category.slug}`, event.category.name)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Similar events */}
          {similarEvents.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-4">{t('event.similar_events')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {similarEvents.map((e) => (
                  <EventCard key={e.id} event={e} compact />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: ticket purchase */}
        <div>
          <TicketPurchase
            event={{
              id: event.id,
              title: event.title,
              slug: event.slug,
              image: event.image,
              startDate: event.startDate.toISOString(),
            }}
            ticketTypes={ticketTypesData}
          />
        </div>
      </div>
    </div>
  );
}
