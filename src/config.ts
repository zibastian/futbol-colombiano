// Configuración central del sitio — un solo lugar para la marca.
// Al reutilizar la plantilla en otro proyecto, se cambia este archivo.

export const SITE = {
  title: 'Fútbol Colombiano',
  description:
    'Noticias del fútbol profesional colombiano: Liga BetPlay, Copa Colombia, colombianos en el exterior, Libertadores y Sudamericana.',
  // Dominio propio. Si algún día se libera futbolcolombiano.com.co, se cambia
  // aquí y se dejan redirecciones 301 desde el .net (no se pierde autoridad SEO).
  url: 'https://futbolcolombiano.net',
  locale: 'es_CO',
  lang: 'es',
  author: 'Fútbol Colombiano',
  // Redes (completar cuando se recuperen/creen las cuentas):
  social: {
    x: '',
    instagram: '',
    tiktok: '',
    youtube: '',
    whatsapp: '',
    telegram: ''
  }
};
