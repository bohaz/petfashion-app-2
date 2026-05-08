import type { AppSettings, DogSize } from './types'

export const SERVICES = {
  corte_bano: { label: 'Corte y Baño',    color: 'emerald' },
  solo_bano:  { label: 'Solo Baño',       color: 'sky' },
  unas:       { label: 'Corte de Uñas',   color: 'amber' },
  afilado:    { label: 'Afilado',         color: 'stone' },
} as const

export const SIZES: Record<DogSize, { label: string; range: string; min: number; max: number }> = {
  XS: { label: 'XS', range: '0 – 5 kg',     min: 0,    max: 5 },
  S:  { label: 'S',  range: '5,1 – 10 kg',  min: 5.1,  max: 10 },
  M:  { label: 'M',  range: '10,1 – 20 kg', min: 10.1, max: 20 },
  L:  { label: 'L',  range: '20,1 – 30 kg', min: 20.1, max: 30 },
}

export const BUSINESS_CATEGORIES = {
  insumos:    { label: 'Insumos',    desc: 'Shampoo, productos, consumibles' },
  sueldos:    { label: 'Sueldos',    desc: 'Pagos a groomers' },
  arriendo:   { label: 'Arriendo',   desc: 'Local' },
  cuentas:    { label: 'Cuentas',    desc: 'Luz, agua, internet, gas' },
  marketing:  { label: 'Marketing',  desc: 'Publicidad, redes' },
  mantencion: { label: 'Mantención', desc: 'Cuchillas, herramientas' },
  otros:      { label: 'Otros',      desc: '' },
} as const

export const HOME_CATEGORIES = {
  mercado:        { label: 'Mercado',         desc: 'Supermercado, almacén' },
  servicios:      { label: 'Servicios',       desc: 'Luz, agua, internet, gas' },
  arriendo:       { label: 'Arriendo',        desc: 'Arriendo o dividendo' },
  alimentacion:   { label: 'Alimentación',    desc: 'Restaurantes, delivery' },
  transporte:     { label: 'Transporte',      desc: 'Bencina, pasajes, Uber' },
  salud:          { label: 'Salud',           desc: 'Farmacia, consultas' },
  entretenimiento:{ label: 'Entretención',    desc: 'Salidas, streaming' },
  ropa:           { label: 'Ropa',            desc: 'Ropa, calzado' },
  mascotas:       { label: 'Mascotas',        desc: 'Veterinario, comida, accesorios' },
  otros:          { label: 'Otros',           desc: '' },
} as const

export const DEFAULT_SETTINGS: AppSettings = {
  prices: {
    corte_bano: { XS: 22000, S: 26000, M: 30000, L: 45000 },
    solo_bano:  { XS: 18000, S: 22000, M: 26000, L_corto: 35000, L_doble: 45000 },
    unas:       { XS: 5000,  S: 7000,  M: 10000, L: 12000 },
    afilado_unidad: 5000,
  },
  durations: {
    corte_bano: { XS: 120, S: 120, M: 120, L: 210 },
    solo_bano:  { XS: 90,  S: 90,  M: 90,  L: 180 },
    unas:       { XS: 30,  S: 30,  M: 30,  L: 30 },
    afilado: 30,
  },
  templates: {
    confirmation:
      '¡Hola {dueño}! Confirmamos la hora en Pet Fashion para {perro}:\n\n📅 {fecha}\n⏰ {hora}\n✂️ {servicio}\n💵 {precio}\n\n📍 Santa Luisa #51, Isla Negra\n\nCualquier cambio nos avisas. ¡Gracias!',
    reminder:
      '¡Hola {dueño}! Te recordamos que mañana {fecha} a las {hora} tienes hora con {perro} en Pet Fashion para {servicio}.\n\n¿Confirmas tu asistencia?',
    review:
      '¡Hola {dueño}! Esperamos que {perro} haya quedado feliz con su servicio.\n\nSi tienes un momento, nos ayudaría muchísimo dejarnos una reseña en Google: {link_reseña}\n\n¡Mil gracias!',
  },
  business: {
    name: 'Pet Fashion',
    address: 'Santa Luisa #51, Isla Negra',
    googleReviewLink: 'https://g.page/r/REEMPLAZAR-CON-TU-LINK/review',
  },
}

export const SERVICE_INCLUDES: Record<string, string[]> = {
  corte_bano: [
    'Deslanado / cepillado',
    '3 lavados (neutralizador, hidratante, acondicionador)',
    'Vaciado de glándulas anales',
    'Despejes sanitario y cojinetes',
    'Corte de pelo',
    'Limpieza de oídos',
    'Corte y limado de uñas',
    'Perfume de larga duración',
  ],
  solo_bano: [
    'Deslanado / cepillado',
    '3 lavados (neutralizador, hidratante, acondicionador)',
    'Vaciado de glándulas anales',
    'Despejes sanitario y cojinetes',
    'Limpieza de oídos',
    'Corte y limado de uñas',
    'Perfume de larga duración',
  ],
  unas: ['Corte de uñas', 'Limado de uñas'],
  afilado: [
    'Afilado profesional por cuchilla',
    'Compatible A5 desmontable (Andis, Oster, Wahl)',
    'Entrega el mismo día',
  ],
}
