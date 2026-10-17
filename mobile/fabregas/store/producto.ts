import { ImageSourcePropType } from 'react-native';

export interface Producto {
    id: string;
    titulo: string;
    descripcion: string;
    precio: number;
    imagen: ImageSourcePropType;
}

// Precio en pesos con separador de miles: 1099999 -> "$ 1.099.999"
export const formatearPrecio = (precio: number) =>
    `$ ${precio.toLocaleString('es-AR', { maximumFractionDigits: 2 })}`;
