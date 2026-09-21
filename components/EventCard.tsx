import Link from 'next/link';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { getTranslations, getLang } from '@/lib/i18n/server';

interface EventCardEvent {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  startDate: Date;
  category: { name: string; slug: string } | null;
  venue: { name: string; city: string } | null;
  ticketTypes: { price: { toString: () => string } }[];
}

export default async function EventCard({ event, compact = false }: { event: EventCardEvent; compact?: boolean }) {
  const t = await getTranslations();
  const lang = await getLang();

  const prices = event.ticketTypes.map((tt) => parseFloat(tt.price.toString()));
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;

  const date = new Date(event.startDate);
  const dateStr = date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : lang === 'nl' ? 'nl-NL' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString(lang === 'fr' ? 'fr-FR' : lang === 'nl' ? 'nl-NL' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Link href={`/events/${event.slug}`} className="group block h-full">
      <div className="relative rounded-xl overflow-hidden border border-ink-500 bg-ink-800 card-hover h-full flex flex-col">
        <div className={`relative overflow-hidden ${compact ? 'aspect-[4/3]' : 'aspect-[16/10]'}`}>
          {event.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          ) : (
            <div className="w-full h-full bg-ink-700 flex items-center justify-center">
              <Calendar className="w-12 h-12 text-gray-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 to-transparent" />
          {event.category && (
            <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium bg-gold-400/90 text-ink-900 backdrop-blur-sm">
              {t(`category.${event.category.slug}`, event.category.name)}
            </span>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <h3
            className={`font-semibold text-white group-hover:text-gold-300 transition line-clamp-2 ${
              compact ? 'text-sm' : 'text-lg'
            }`}
          >
            {event.title}
          </h3>
          <div className="mt-2 space-y-1 flex-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar className="w-3.5 h-3.5 shrink-0" /> {dateStr}
              <Clock className="w-3.5 h-3.5 ml-1 shrink-0" /> {timeStr}
            </div>
            {event.venue && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <MapPin className="w-3.5 h-3.5 shrink-0" /> {event.venue.name}, {event.venue.city}
              </div>
            )}
          </div>
          {minPrice !== null && (
            <div className="mt-3 pt-3 border-t border-ink-500">
              <span className="text-xs text-gray-500">{t('event.from_price')} </span>
              <span className="text-sm font-bold text-gold-300">
                {minPrice.toFixed(2)} {t('common.eur')}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
