import ListaProductos from '@/components/shared/ListaProductos'
import { televisores } from '@/store/televisores.store'
import React from 'react'

const TelevisoresScreen = () => <ListaProductos productos={televisores} rutaBase='/televisores' />

export default TelevisoresScreen
