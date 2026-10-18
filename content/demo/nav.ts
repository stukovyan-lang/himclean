import type { NavItem } from '../../lib/navigation'

/**
 * Fixed header nav of the approved design (the names are historical — see
 * CLAUDE.md, "Дизайн сайта"). Unlike `getNavItems()`, it does not derive from
 * content presence: all six pages always exist. The footer adds the pages
 * the header has no room for (`DemoFooter`).
 */
export const DEMO_NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Главная' },
  { href: '/uslugi', label: 'Услуги' },
  { href: '/raboty', label: 'Наши работы' },
  { href: '/o-nas', label: 'О нас' },
  { href: '/otzyvy', label: 'Отзывы' },
  { href: '/kontakty', label: 'Контакты' },
]
