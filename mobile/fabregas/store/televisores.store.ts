import { Producto } from './producto';

export const televisores: Producto[] = [
    {
        id: '1',
        titulo: 'Smart TV Led 43" TCL L43S5400-F',
        descripcion:
            'Pantalla LED de 43 pulgadas con resolución FHD (1920x1080) para ver tus series, videos y películas con muy buena calidad de imagen. Tiene 2 parlantes de 9.5W.',
        precio: 429999,
        imagen: require('@/assets/images/tv-tcl-43.png'),
    },
    {
        id: '2',
        titulo: 'Smart TV TCL 55" 4K UHD Google TV L55P635',
        descripcion:
            'Smart TV de 55 pulgadas 4K con Google TV. Con WiFi integrado podés entrar a tus aplicaciones y contenidos favoritos muy fácil. Colores vivos y buen contraste.',
        precio: 649999,
        imagen: require('@/assets/images/tv-tcl-55.png'),
    },
    {
        id: '3',
        titulo: 'Smart TV UHD 4K Samsung 43" UN43DU7000GCZB',
        descripcion:
            'Pantalla de 43 pulgadas con resolución UHD 4K (3840 x 2160). El procesador Crystal 4K mejora los colores y el modo juego baja la demora de la imagen.',
        precio: 649999,
        imagen: require('@/assets/images/tv-samsung-43.png'),
    },
    {
        id: '4',
        titulo: 'Smart TV UHD 4K Samsung 55" UN55DU7000GCZB',
        descripcion:
            'La misma calidad 4K del modelo de 43" pero en 55 pulgadas. Incluye Tizen con todas las apps de streaming y control por voz.',
        precio: 899999,
        imagen: require('@/assets/images/tv-samsung-55.png'),
    },
    {
        id: '5',
        titulo: 'Smart TV Philips 32" HD 32PHD6918',
        descripcion:
            'Ideal para el dormitorio o la cocina. Pantalla HD de 32 pulgadas, sistema operativo Google TV y entradas HDMI y USB.',
        precio: 279999,
        imagen: require('@/assets/images/tv-philips-32.png'),
    },
];
