import DetalleProducto from '@/components/shared/DetalleProducto';
import { products } from '@/store/products.store';
import React from 'react';

const ProductoScreen = () => (
    <DetalleProducto productos={products} rutaBase='/productos' tituloPorDefecto='Producto' />
)

export default ProductoScreen
