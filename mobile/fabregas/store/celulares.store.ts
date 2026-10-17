import { Producto } from './producto';

export const celulares: Producto[] = [
    {
        id: '1',
        titulo: 'Samsung Galaxy A56 5G',
        descripcion:
            'Presentamos Galaxy A56 5G. Con 7,4mm de grosor y 198g de peso tiene un muy buen agarre. Las cámaras mejoradas se agrupan en el nuevo diseño lineal y viene en cuatro colores: Graphite, Lightgray, Olive y Pink.',
        precio: 1099999,
        imagen: require('@/assets/images/galaxy-a56.png'),
    },
    {
        id: '2',
        titulo: 'Samsung Galaxy A36 5G',
        descripcion:
            'Diseño minimalista y duradero con cámara lineal. La parte de atrás es de vidrio y el marco lateral es plano, con un acabado delgado y elegante.',
        precio: 649999,
        imagen: require('@/assets/images/galaxy-a36.png'),
    },
    {
        id: '3',
        titulo: 'Samsung Galaxy A26 5G',
        descripcion:
            'Dale un extra a tu estilo con el Galaxy A26 5G. Cristal brillante atrás y cámaras que llaman la atención. Disponible en blanco, negro y menta.',
        precio: 719999,
        imagen: require('@/assets/images/galaxy-a26.png'),
    },
    {
        id: '4',
        titulo: 'Samsung Galaxy A06',
        descripcion:
            'Pantalla grande de 6,7" con 90Hz para ver todo más fluido. Batería de 5000mAh que te dura todo el día.',
        precio: 199999,
        imagen: require('@/assets/images/galaxy-a06.png'),
    },
    {
        id: '5',
        titulo: 'Samsung Galaxy A15',
        descripcion:
            'Pantalla Super AMOLED de 6,5", triple cámara de 50MP y carga rápida de 25W. Un celular completo a un buen precio.',
        precio: 299999,
        imagen: require('@/assets/images/galaxy-a15.png'),
    },
];
