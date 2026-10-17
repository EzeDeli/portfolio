import DetalleProducto from '@/components/shared/DetalleProducto';
import { celulares } from '@/store/celulares.store';
import React from 'react';

const CelularScreen = () => (
    <DetalleProducto productos={celulares} rutaBase='/celulares' tituloPorDefecto='Celular' />
)

export default CelularScreen
