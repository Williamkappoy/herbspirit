import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Kapibana\'s Tickets...');

  const adminPass = await bcrypt.hash('admin123', 10);
  const orgPass = await bcrypt.hash('organizer123', 10);
  const buyerPass = await bcrypt.hash('buyer123', 10);

  // ── Users ──
  await prisma.user.upsert({
    where: { email: 'admin@kapibana.be' },
    update: {},
    create: { email: 'admin@kapibana.be', password: adminPass, firstName: 'Admin', lastName: 'Kapibana', role: 'ADMIN' },
  });

  const org1User = await prisma.user.upsert({
    where: { email: 'contact@brussels-events.be' },
    update: {},
    create: { email: 'contact@brussels-events.be', password: orgPass, firstName: 'Brussels', lastName: 'Events', role: 'ORGANIZER' },
  });
  const org2User = await prisma.user.upsert({
    where: { email: 'info@liege-culture.be' },
    update: {},
    create: { email: 'info@liege-culture.be', password: orgPass, firstName: 'Liège', lastName: 'Culture', role: 'ORGANIZER' },
  });
  const org3User = await prisma.user.upsert({
    where: { email: 'hello@flanders-festivals.be' },
    update: {},
    create: { email: 'hello@flanders-festivals.be', password: orgPass, firstName: 'Flanders', lastName: 'Festivals', role: 'ORGANIZER' },
  });
  const org4User = await prisma.user.upsert({
    where: { email: 'contact@wallonia-arts.be' },
    update: {},
    create: { email: 'contact@wallonia-arts.be', password: orgPass, firstName: 'Wallonia', lastName: 'Arts', role: 'ORGANIZER' },
  });

  const buyer1User = await prisma.user.upsert({
    where: { email: 'buyer@demo.be' },
    update: {},
    create: { email: 'buyer@demo.be', password: buyerPass, firstName: 'Marie', lastName: 'Dubois', role: 'BUYER' },
  });
  await prisma.buyerProfile.upsert({
    where: { userId: buyer1User.id },
    update: {},
    create: { userId: buyer1User.id, phone: '+32 470 12 34 56', city: 'Bruxelles' },
  });

  // ── Organizer Profiles ──
  const org1 = await prisma.organizerProfile.upsert({
    where: { slug: 'brussels-events' },
    update: {},
    create: {
      name: 'Brussels Events ASBL', slug: 'brussels-events', userId: org1User.id,
      description: 'Organisateur d\'événements culturels et musicaux à Bruxelles.',
      city: 'Bruxelles', country: 'Belgique', phone: '+32 2 123 45 67', website: 'https://brussels-events.be', verified: true,
    },
  });
  const org2 = await prisma.organizerProfile.upsert({
    where: { slug: 'liege-culture' },
    update: {},
    create: {
      name: 'Liège Culture', slug: 'liege-culture', userId: org2User.id,
      description: 'Promotion de la culture et des arts à Liège.',
      city: 'Liège', country: 'Belgique', phone: '+32 4 234 56 78', verified: true,
    },
  });
  const org3 = await prisma.organizerProfile.upsert({
    where: { slug: 'flanders-festivals' },
    update: {},
    create: {
      name: 'Flanders Festivals', slug: 'flanders-festivals', userId: org3User.id,
      description: 'Les plus grands festivals de Flandre.',
      city: 'Anvers', country: 'Belgique', phone: '+32 3 345 67 89', website: 'https://flanders-festivals.be', verified: true,
    },
  });
  const org4 = await prisma.organizerProfile.upsert({
    where: { slug: 'wallonia-arts' },
    update: {},
    create: {
      name: 'Wallonia Arts', slug: 'wallonia-arts', userId: org4User.id,
      description: 'Événements artistiques et familiaux en Wallonie.',
      city: 'Namur', country: 'Belgique', phone: '+32 81 45 67 89', verified: true,
    },
  });

  // ── Categories ──
  const catData = [
    { name: 'Concerts', slug: 'concerts' },
    { name: 'Spectacles', slug: 'spectacles' },
    { name: 'Théâtre', slug: 'theatre' },
    { name: 'Festivals', slug: 'festivals' },
    { name: 'Soirées', slug: 'soirees' },
    { name: 'Conférences', slug: 'conferences' },
    { name: 'Sport', slug: 'sport' },
    { name: 'Culture', slug: 'culture' },
    { name: 'Loisirs', slug: 'loisirs' },
    { name: 'Famille', slug: 'famille' },
    { name: 'Autres', slug: 'autres' },
  ];
  const cats: Record<string, string> = {};
  for (const c of catData) {
    const cat = await prisma.eventCategory.upsert({ where: { slug: c.slug }, update: {}, create: c });
    cats[c.slug] = cat.id;
  }

  // ── Venues ──
  const venueData = [
    { name: 'Ancienne Belgique', address: 'Boulevard Anspach 110', postalCode: '1000', city: 'Bruxelles' },
    { name: 'Théâtre Royal de Liège', address: 'Place du 20-Août 16', postalCode: '4000', city: 'Liège' },
    { name: 'De Schorre', address: 'Schorredijk 2', postalCode: '2850', city: 'Boom' },
    { name: 'Square Brussels', address: 'Mont des Arts', postalCode: '1000', city: 'Bruxelles' },
    { name: 'Stade Maurice Dufrasne', address: 'Rue de la Centrale 4', postalCode: '4020', city: 'Liège' },
    { name: 'Musées Royaux des Beaux-Arts', address: 'Rue de la Régence 3', postalCode: '1000', city: 'Bruxelles' },
    { name: 'Mirano Continental', address: 'Chaussée de Louvain 38', postalCode: '1210', city: 'Bruxelles' },
    { name: 'Centre Culturel de Namur', address: 'Place Saint-Aubain 2', postalCode: '5000', city: 'Namur' },
    { name: 'Bourla Theater', address: 'Komedieplaats 18', postalCode: '2000', city: 'Anvers' },
    { name: 'Palais des Beaux-Arts', address: 'Rue Ravenstein 23', postalCode: '1000', city: 'Bruxelles' },
  ];
  const venues: Record<string, string> = {};
  for (const v of venueData) {
    const venue = await prisma.venue.upsert({
      where: { id: v.name.replace(/\s+/g, '-').toLowerCase() },
      update: {},
      create: { ...v, id: v.name.replace(/\s+/g, '-').toLowerCase() },
    });
    venues[v.name] = venue.id;
  }

  // ── Events ──
  type EventSeed = {
    title: string; slug: string; description: string; image: string;
    category: string; organizer: string; venue: string;
    startDate: string; endDate?: string; status: string; featured?: boolean;
    ticketTypes: { name: string; description?: string; price: number; quantity: number; maxPerOrder?: number }[];
  };

  const events: EventSeed[] = [
    {
      title: 'Nuit du Funk — Live at AB Club',
      slug: 'nuit-du-funk-live-at-ab-club',
      description: 'Une nuit électrisante dédiée au funk et au groove. Trois groupes live montent sur scène pour vous faire danser jusqu\'au bout de la nuit. Une expérience musicale incontournable au cœur de Bruxelles.',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
      category: 'concerts', organizer: 'brussels-events', venue: 'Ancienne Belgique',
      startDate: '2026-10-17T20:00:00Z', endDate: '2026-10-17T23:30:00Z',
      status: 'PUBLISHED', featured: true,
      ticketTypes: [
        { name: 'Early Bird', description: 'Premier prix, quantité limitée', price: 25, quantity: 100, maxPerOrder: 6 },
        { name: 'Standard', price: 35, quantity: 200, maxPerOrder: 8 },
        { name: 'VIP — Accès loge', description: 'Accès zone VIP + welcome drink', price: 60, quantity: 30, maxPerOrder: 4 },
      ],
    },
    {
      title: 'Hamlet — Tragédie en cinq actes',
      slug: 'hamlet-tragedie-en-cinq-actes',
      description: 'La masterpiece de Shakespeare dans une mise en scène contemporaine signée par le Théâtre Royal de Liège. Une réflexion puissante sur la folie, le pouvoir et la vengeance.',
      image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80',
      category: 'theatre', organizer: 'liege-culture', venue: 'Théâtre Royal de Liège',
      startDate: '2026-10-24T19:30:00Z', endDate: '2026-10-24T22:00:00Z',
      status: 'PUBLISHED', featured: true,
      ticketTypes: [
        { name: 'Standard', price: 28, quantity: 150, maxPerOrder: 6 },
        { name: 'Étudiant', description: 'Sur présentation de la carte étudiante', price: 18, quantity: 50, maxPerOrder: 1 },
        { name: 'Premium — Orchestre', price: 42, quantity: 40, maxPerOrder: 4 },
      ],
    },
    {
      title: 'Festival des Étoiles — Édition 2026',
      slug: 'festival-des-etoiles-edition-2026',
      description: 'Trois jours de musique, d\'art et de gastronomie au parc De Schorre. Plus de 40 artistes sur 5 scènes, des ateliers créatifs, un village gourmand et des animations pour toute la famille.',
      image: 'https://images.unsplash.com/photo-1470229363808-4b8e1f6e3c11?w=800&q=80',
      category: 'festivals', organizer: 'flanders-festivals', venue: 'De Schorre',
      startDate: '2026-11-14T14:00:00Z', endDate: '2026-11-16T23:00:00Z',
      status: 'PUBLISHED', featured: true,
      ticketTypes: [
        { name: 'Pass 1 jour', description: 'Accès complet pour une journée au choix', price: 65, quantity: 500, maxPerOrder: 6 },
        { name: 'Pass 3 jours', description: 'Accès complet pour tout le festival', price: 150, quantity: 300, maxPerOrder: 4 },
        { name: 'VIP — Pass 3 jours', description: 'Accès VIP + zone réservée + catering', price: 250, quantity: 50, maxPerOrder: 2 },
      ],
    },
    {
      title: 'Tech & Innovation Summit 2026',
      slug: 'tech-innovation-summit-2026',
      description: 'Le rendez-vous des professionnels de la tech en Belgique. Conférences, ateliers et networking autour de l\'IA, de la transition numérique et des technologies émergentes. 30+ intervenants internationaux.',
      image: 'https://images.unsplash.com/photo-1505373877841-6d8754586f0a?w=800&q=80',
      category: 'conferences', organizer: 'brussels-events', venue: 'Square Brussels',
      startDate: '2026-11-05T09:00:00Z', endDate: '2026-11-05T18:00:00Z',
      status: 'PUBLISHED', featured: true,
      ticketTypes: [
        { name: 'Standard', description: 'Accès complet aux conférences', price: 120, quantity: 200, maxPerOrder: 5 },
        { name: 'Pro', description: 'Accès complet + ateliers + networking dinner', price: 250, quantity: 80, maxPerOrder: 3 },
        { name: 'Étudiant', description: 'Sur présentation de la carte étudiante', price: 50, quantity: 40, maxPerOrder: 1 },
      ],
    },
    {
      title: 'Derby Liégeois — Standard vs Anderlecht',
      slug: 'derby-liegeois-standard-anderlecht',
      description: 'Le choc de la saison au stade Maurice Dufrasne. Un derby mythique qui promet spectacle, passion et intensité. Places limitées, réservez vite !',
      image: 'https://images.unsplash.com/photo-1461896836934-bffe451b2f5e?w=800&q=80',
      category: 'sport', organizer: 'liege-culture', venue: 'Stade Maurice Dufrasne',
      startDate: '2026-10-31T20:00:00Z', endDate: '2026-10-31T22:00:00Z',
      status: 'PUBLISHED', featured: true,
      ticketTypes: [
        { name: 'Tribune populaire', price: 45, quantity: 500, maxPerOrder: 8 },
        { name: 'Tribune centrale', price: 65, quantity: 200, maxPerOrder: 6 },
        { name: 'VIP Loge', description: 'Accès loge + catering', price: 120, quantity: 30, maxPerOrder: 4 },
      ],
    },
    {
      title: 'Exposition Magritte — Les Années Surréalistes',
      slug: 'exposition-magritte-annees-surréalistes',
      description: 'Une rétrospective exceptionnelle de l\'œuvre de René Magritte, avec plus de 100 toiles, dessins et documents inédits. Plongez dans l\'univers surréaliste du maître belge.',
      image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80',
      category: 'culture', organizer: 'wallonia-arts', venue: 'Musées Royaux des Beaux-Arts',
      startDate: '2026-10-10T10:00:00Z', endDate: '2027-01-15T18:00:00Z',
      status: 'PUBLISHED',
      ticketTypes: [
        { name: 'Adulte', price: 15, quantity: 1000, maxPerOrder: 10 },
        { name: 'Enfant (-12 ans)', price: 8, quantity: 500, maxPerOrder: 5 },
        { name: 'Famille (2 adultes + 2 enfants)', price: 35, quantity: 200, maxPerOrder: 2 },
      ],
    },
    {
      title: 'Soirée Lounge — Opening Season',
      slug: 'soiree-lounge-opening-season',
      description: 'L\'ouverture de la saison au Mirano. DJ sets, performances live et ambiance lounge dans un cadre exceptionnel. Dress code: élégant.',
      image: 'https://images.unsplash.com/photo-1571266028243-d220c902b4f2?w=800&q=80',
      category: 'soirees', organizer: 'brussels-events', venue: 'Mirano Continental',
      startDate: '2026-10-18T22:00:00Z', endDate: '2026-10-19T04:00:00Z',
      status: 'PUBLISHED',
      ticketTypes: [
        { name: 'Early Bird', price: 15, quantity: 80, maxPerOrder: 4 },
        { name: 'Standard', price: 22, quantity: 120, maxPerOrder: 6 },
        { name: 'Table VIP (4 pers.)', description: 'Table réservée + bouteille', price: 80, quantity: 15, maxPerOrder: 1 },
      ],
    },
    {
      title: 'Atelier Familial — Poterie & Créativité',
      slug: 'atelier-familial-poterie-creativite',
      description: 'Un atelier créatif en famille pour découvrir la poterie et laisser libre cours à votre imagination. À partir de 6 ans. Matériel fourni.',
      image: 'https://images.unsplash.com/photo-1565193566173-7a0ee4dbe267?w=800&q=80',
      category: 'famille', organizer: 'wallonia-arts', venue: 'Centre Culturel de Namur',
      startDate: '2026-11-08T14:00:00Z', endDate: '2026-11-08T17:00:00Z',
      status: 'PUBLISHED',
      ticketTypes: [
        { name: 'Adulte', price: 20, quantity: 30, maxPerOrder: 4 },
        { name: 'Enfant (6-12 ans)', price: 12, quantity: 30, maxPerOrder: 4 },
        { name: 'Famille (4 personnes)', price: 55, quantity: 10, maxPerOrder: 1 },
      ],
    },
    {
      title: 'Stand-Up Comedy Night',
      slug: 'stand-up-comedy-night',
      description: 'Cinq humoristes montent sur scène pour une soirée de rires garantis. Stand-up en français et en néerlandais. Une soirée conviviale au Bourla Theater.',
      image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&q=80',
      category: 'spectacles', organizer: 'flanders-festivals', venue: 'Bourla Theater',
      startDate: '2026-10-27T20:30:00Z', endDate: '2026-10-27T22:30:00Z',
      status: 'PUBLISHED',
      ticketTypes: [
        { name: 'Standard', price: 18, quantity: 120, maxPerOrder: 6 },
        { name: 'Premium — Premiers rangs', price: 30, quantity: 30, maxPerOrder: 4 },
      ],
    },
    {
      title: 'Concert Symphonique — Beethoven & Mahler',
      slug: 'concert-symphonique-beethoven-mahler',
      description: 'L\'Orchestre Philharmonique de Belgique interprète la Symphonie n°5 de Beethoven et la Symphonie n°5 de Mahler. Une soirée d\'exception au Palais des Beaux-Arts.',
      image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&q=80',
      category: 'culture', organizer: 'brussels-events', venue: 'Palais des Beaux-Arts',
      startDate: '2026-11-22T20:00:00Z', endDate: '2026-11-22T22:30:00Z',
      status: 'PUBLISHED',
      ticketTypes: [
        { name: 'Catégorie 1 — Orchestre', price: 55, quantity: 100, maxPerOrder: 6 },
        { name: 'Catégorie 2 — Balcon', price: 35, quantity: 80, maxPerOrder: 6 },
        { name: 'Catégorie 3 — Galerie', price: 20, quantity: 60, maxPerOrder: 6 },
      ],
    },
    {
      title: 'Conférence — L\'IA et le Futur du Travail',
      slug: 'conference-ia-futur-du-travail',
      description: 'Une conférence interactive sur l\'impact de l\'intelligence artificielle sur le monde du travail. Intervenants experts, débats et questions-réponses.',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2b87c?w=800&q=80',
      category: 'conferences', organizer: 'liege-culture', venue: 'Centre Culturel de Namur',
      startDate: '2026-12-03T18:30:00Z', endDate: '2026-12-03T21:00:00Z',
      status: 'PENDING',
      ticketTypes: [
        { name: 'Standard', price: 15, quantity: 100, maxPerOrder: 5 },
        { name: 'Étudiant', price: 8, quantity: 30, maxPerOrder: 1 },
      ],
    },
    {
      title: 'Atelier Loisirs — Photographie Urbaine',
      slug: 'atelier-loisirs-photographie-urbaine',
      description: 'Un atelier pratique de photographie urbaine dans les rues de Namur. Apprenez les techniques de composition, de lumière et de post-traitement.',
      image: 'https://images.unsplash.com/photo-1500218299076-1bf2dc6c6f1e?w=800&q=80',
      category: 'loisirs', organizer: 'wallonia-arts', venue: 'Centre Culturel de Namur',
      startDate: '2026-12-13T10:00:00Z', endDate: '2026-12-13T16:00:00Z',
      status: 'DRAFT',
      ticketTypes: [
        { name: 'Standard', price: 45, quantity: 15, maxPerOrder: 1 },
      ],
    },
  ];

  for (const e of events) {
    const existing = await prisma.event.findUnique({ where: { slug: e.slug } });
    if (existing) continue;

    const event = await prisma.event.create({
      data: {
        title: e.title,
        slug: e.slug,
        description: e.description,
        image: e.image,
        gallery: [],
        categoryId: cats[e.category],
        organizerId: e.organizer === 'brussels-events' ? org1.id : e.organizer === 'liege-culture' ? org2.id : e.organizer === 'flanders-festivals' ? org3.id : org4.id,
        venueId: venues[e.venue],
        startDate: new Date(e.startDate),
        endDate: e.endDate ? new Date(e.endDate) : null,
        status: e.status as any,
        featured: e.featured || false,
        ticketTypes: {
          create: e.ticketTypes.map((tt) => ({
            name: tt.name,
            description: tt.description || null,
            price: tt.price,
            quantity: tt.quantity,
            maxPerOrder: tt.maxPerOrder || 10,
          })),
        },
      },
    });
    console.log(`  ✅ ${event.title}`);
  }

  // ── Sample order for demo buyer ──
  const firstEvent = await prisma.event.findFirst({
    where: { slug: 'nuit-du-funk-live-at-ab-club' },
    include: { ticketTypes: true },
  });
  if (firstEvent && firstEvent.ticketTypes.length > 0) {
    const existingOrder = await prisma.order.findFirst({ where: { userId: buyer1User.id } });
    if (!existingOrder) {
      const tt = firstEvent.ticketTypes[0];
      const qty = 2;
      const totalAmount = Number(tt.price) * qty;
      const commissionRate = 5;
      const commissionAmount = totalAmount * commissionRate / 100;
      const organizerAmount = totalAmount - commissionAmount;

      const order = await prisma.order.create({
        data: {
          orderNumber: `KAP-${Date.now().toString().slice(-8)}`,
          userId: buyer1User.id,
          totalAmount,
          fees: 0,
          status: 'PAID',
          items: {
            create: { ticketTypeId: tt.id, quantity: qty, unitPrice: tt.price },
          },
        },
      });

      await prisma.payment.create({
        data: { orderId: order.id, amount: totalAmount, status: 'SUCCEEDED', method: 'card' },
      });

      await prisma.commission.create({
        data: {
          orderId: order.id,
          rate: commissionRate,
          grossAmount: totalAmount,
          commissionAmount,
          organizerAmount,
          currency: 'EUR',
        },
      });

      for (let i = 0; i < qty; i++) {
        await prisma.ticket.create({
          data: {
            uniqueCode: `TKT-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
            ticketTypeId: tt.id,
            eventId: firstEvent.id,
            orderId: order.id,
            participantName: 'Marie Dubois',
            status: 'PAID',
          },
        });
      }

      await prisma.ticketType.update({ where: { id: tt.id }, data: { sold: { increment: qty } } });

      console.log('  ✅ Demo order with tickets');
    }
  }

  console.log('✅ Seed complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
