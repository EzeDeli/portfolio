import ListaProductos from '@/components/shared/ListaProductos'
import { products } from '@/store/products.store'
import React from 'react'

const ProductosScreen = () => <ListaProductos productos={products} rutaBase='/productos' />

export default ProductosScreen
