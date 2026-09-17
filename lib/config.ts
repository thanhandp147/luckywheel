// lib/config.ts

export interface WheelItem {
  label: string
  image: string   // HTTPS URL
  color: string   // hex color for wheel segment
  emoji: string
}

export const ITEMS: WheelItem[] = [
  {
    label: 'Trà sữa trân châu',
    image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=400',
    color: '#FF6B9D',
    emoji: '🧋'
  },
  {
    label: 'Matcha latte',
    image: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=400',
    color: '#7BC67E',
    emoji: '🍵'
  },
  {
    label: 'Hồng trà sữa',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
    color: '#FFB347',
    emoji: '🫖'
  },
  {
    label: 'Sinh tố xoài',
    image: 'https://images.unsplash.com/photo-1553177595-4de6a86bcd44?w=400',
    color: '#FFD700',
    emoji: '🥭'
  },
  {
    label: 'Nước ép dưa hấu',
    image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400',
    color: '#FF4D6D',
    emoji: '🍉'
  },
  {
    label: 'Cà phê sữa đá',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
    color: '#8B4513',
    emoji: '☕'
  },
  {
    label: 'Soda chanh',
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
    color: '#90EE90',
    emoji: '🍋'
  },
  {
    label: 'Kem trà xanh',
    image: 'https://images.unsplash.com/photo-1567206563114-c179706a56dc?w=400',
    color: '#98FB98',
    emoji: '🍦'
  }
]
