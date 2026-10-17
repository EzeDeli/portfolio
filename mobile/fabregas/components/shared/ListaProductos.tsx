import TarjetaProducto from '@/components/shared/TarjetaProducto'
import { Producto } from '@/store/producto'
import { Href } from 'expo-router'
import React from 'react'
import { FlatList, View } from 'react-native'

interface Props {
    productos: Producto[];
    // Ruta de la seccion, por ejemplo '/celulares'. El detalle queda en '/celulares/:id'
    rutaBase: string;
}

const ListaProductos = ({ productos, rutaBase }: Props) => {
    return (
        <View className='flex flex-1 px-4'>
            <FlatList
                data={productos}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TarjetaProducto
                        titulo={item.titulo}
                        descripcion={item.descripcion}
                        precio={item.precio}
                        ruta={`${rutaBase}/${item.id}` as Href}
                    />
                )}
                ListFooterComponent={<View className='h-8' />}
            />
        </View>
    )
}

export default ListaProductos
