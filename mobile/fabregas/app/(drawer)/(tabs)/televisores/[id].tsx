import DetalleProducto from '@/components/shared/DetalleProducto';
import { televisores } from '@/store/televisores.store';
import React from 'react';

const TelevisorScreen = () => (
    <DetalleProducto productos={televisores} rutaBase='/televisores' tituloPorDefecto='Televisor' />
)

export default TelevisorScreen
