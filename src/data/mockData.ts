export const mockAppointments = [
  {
    id: '1',
    clientName: 'Carlos Silva',
    service: 'Haircut & Beard Trim',
    time: 'Today, 10:00 AM',
    barber: 'André Santos',
    status: 'upcoming'
  },
  {
    id: '2',
    clientName: 'Rafael Oliveira',
    service: 'Fade Haircut',
    time: 'Today, 11:30 AM',
    barber: 'Pedro Costa',
    status: 'upcoming'
  },
  {
    id: '3',
    clientName: 'Lucas Ferreira',
    service: 'Full Grooming',
    time: 'Today, 2:00 PM',
    barber: 'André Santos',
    status: 'upcoming'
  },
  {
    id: '4',
    clientName: 'Marcos Souza',
    service: 'Beard Styling',
    time: 'Tomorrow, 9:00 AM',
    barber: 'Pedro Costa',
    status: 'upcoming'
  },
  {
    id: '5',
    clientName: 'Bruno Martins',
    service: 'Haircut',
    time: 'Yesterday, 4:30 PM',
    barber: 'André Santos',
    status: 'completed'
  }
] as const;

export const mockChats = [
  {
    id: '1',
    clientName: 'Carlos Silva',
    message: 'Olá, gostaria de remarcar meu horário para amanhã, é possível?',
    time: '10 min ago',
    unread: true
  },
  {
    id: '2',
    clientName: 'Rafael Oliveira',
    message: 'Vocês têm disponibilidade para sábado às 14h?',
    time: '30 min ago',
    unread: true
  },
  {
    id: '3',
    clientName: 'Lucas Ferreira',
    message: 'Obrigado pelo atendimento de hoje!',
    time: '2h ago',
    unread: false
  },
  {
    id: '4',
    clientName: 'Marcos Souza',
    message: 'Qual o preço do pacote completo?',
    time: '3h ago',
    unread: false
  }
] as const;

export const mockClients = [
  {
    id: '1',
    name: 'Carlos Silva',
    phone: '+55 11 99999-8888',
    lastVisit: '2 days ago',
    favoriteTeam: 'Corinthians'
  },
  {
    id: '2',
    name: 'Rafael Oliveira',
    phone: '+55 11 98888-7777',
    lastVisit: '1 week ago',
    favoriteTeam: 'São Paulo'
  },
  {
    id: '3',
    name: 'Lucas Ferreira',
    phone: '+55 11 97777-6666',
    lastVisit: '2 weeks ago',
    favoriteTeam: 'Palmeiras'
  },
  {
    id: '4',
    name: 'Marcos Souza',
    phone: '+55 11 96666-5555',
    lastVisit: '1 month ago',
    favoriteTeam: 'Santos'
  },
  {
    id: '5',
    name: 'Bruno Martins',
    phone: '+55 11 95555-4444',
    lastVisit: '2 months ago',
    favoriteTeam: 'Flamengo'
  }
] as const;

const mockServices = [
  {
    id: '1',
    name: 'Haircut',
    price: 50,
    duration: 30,
    description: 'Classic haircut with scissors or machine'
  },
  {
    id: '2',
    name: 'Beard Trim',
    price: 30,
    duration: 20,
    description: 'Beard trimming and styling'
  },
  {
    id: '3',
    name: 'Haircut & Beard',
    price: 70,
    duration: 45,
    description: 'Complete package with haircut and beard trim'
  },
  {
    id: '4',
    name: 'Premium Grooming',
    price: 120,
    duration: 90,
    description: 'Full service including haircut, beard, facial treatment, and hot towel'
  },
  {
    id: '5',
    name: 'Kids Haircut',
    price: 35,
    duration: 20,
    description: 'Haircut for children under 12'
  }
] as const;

const mockProducts = [
  {
    id: '1',
    name: 'Premium Beard Oil',
    price: 45,
    stock: 24,
    image: 'https://images.pexels.com/photos/3998411/pexels-photo-3998411.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: '2',
    name: 'Styling Pomade',
    price: 40,
    stock: 18,
    image: 'https://images.pexels.com/photos/6621462/pexels-photo-6621462.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: '3',
    name: 'Beard Balm',
    price: 35,
    stock: 15,
    image: 'https://images.pexels.com/photos/5658518/pexels-photo-5658518.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: '4',
    name: 'Hair Wax',
    price: 38,
    stock: 22,
    image: 'https://images.pexels.com/photos/3993323/pexels-photo-3993323.jpeg?auto=compress&cs=tinysrgb&w=300'
  }
] as const;

const mockBarbers = [
  {
    id: '1',
    name: 'André Santos',
    specialties: ['Fades', 'Classic Cuts'],
    rating: 4.9,
    appointments: 352,
    image: 'https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: '2',
    name: 'Pedro Costa',
    specialties: ['Beards', 'Modern Styles'],
    rating: 4.8,
    appointments: 284,
    image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: '3',
    name: 'Ricardo Almeida',
    specialties: ['Color', 'Textured Cuts'],
    rating: 4.7,
    appointments: 201,
    image: 'https://images.pexels.com/photos/2085848/pexels-photo-2085848.jpeg?auto=compress&cs=tinysrgb&w=300'
  }
] as const;

export const mockMessageTemplates = [
  {
    id: '1',
    name: 'Appointment Confirmation',
    content: 'Olá {{client.name}}, confirmamos seu agendamento para {{appointment.service}} com {{appointment.barber}} em {{appointment.date}} às {{appointment.time}}. Aguardamos você!'
  },
  {
    id: '2',
    name: 'Appointment Reminder',
    content: 'Olá {{client.name}}, lembrando que você tem um horário agendado amanhã às {{appointment.time}} para {{appointment.service}}. Te esperamos!'
  },
  {
    id: '3',
    name: 'Post-Service Feedback',
    content: 'Olá {{client.name}}, como foi sua experiência hoje? Ficaríamos felizes em receber seu feedback. Volte sempre!'
  },
  {
    id: '4',
    name: 'Birthday Greeting',
    content: 'Feliz aniversário, {{client.name}}! Como presente, oferecemos 15% de desconto em qualquer serviço este mês. Agende seu horário!'
  },
  {
    id: '5',
    name: 'Special Promotion',
    content: 'Olá {{client.name}}, temos uma promoção especial esta semana: {{promotion.name}}. Agende seu horário e aproveite!'
  }
] as const;