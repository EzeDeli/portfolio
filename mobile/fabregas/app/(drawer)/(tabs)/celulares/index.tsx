import ListaProductos from '@/components/shared/ListaProductos'
import { celulares } from '@/store/celulares.store'
import React from 'react'

const CelularesScreen = () => <ListaProductos productos={celulares} rutaBase='/celulares' />

export default CelularesScreen
