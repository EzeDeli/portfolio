import { Producto } from './producto';

export const products: Producto[] = [
    {
        id: '1',
        titulo: 'Auriculares Inalámbricos',
        descripcion:
            'Experimenta una calidad de sonido premium con estos auriculares inalámbricos. Diseñados para la comodidad y el uso prolongado, son perfectos para amantes de la música.',
        precio: 89999,
        imagen: require('@/assets/images/auriculares.png'),
    },
    {
        id: '2',
        titulo: 'Reloj Inteligente',
        descripcion:
            'Mantente conectado y seguí tu estado físico con este reloj inteligente. Tiene monitor de frecuencia cardíaca, GPS y notificaciones del celular.',
        precio: 189999,
        imagen: require('@/assets/images/reloj.png'),
    },
    {
        id: '3',
        titulo: 'Altavoz Bluetooth',
        descripcion:
            'Portátil y potente, este altavoz te da un sonido claro y fuerte donde quieras. Ideal para juntadas, salidas al aire libre y más.',
        precio: 69999,
        imagen: require('@/assets/images/altavoz.png'),
    },
    {
        id: '4',
        titulo: 'Mouse para Gaming',
        descripcion:
            'Mejorá tu experiencia de juego con este mouse de alta precisión. Diseño ergonómico, luces RGB y botones programables.',
        precio: 39999,
        imagen: require('@/assets/images/mouse.png'),
    },
    {
        id: '5',
        titulo: 'Monitor 4K',
        descripcion:
            'Disfrutá de imágenes nítidas con este monitor 4K. Perfecto para juegos, trabajo y películas con colores vibrantes.',
        precio: 459999,
        imagen: require('@/assets/images/monitor.png'),
    },
];
