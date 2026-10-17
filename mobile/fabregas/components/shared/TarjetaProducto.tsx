import { formatearPrecio } from '@/store/producto'
import { Href, Link } from 'expo-router'
import React from 'react'
import { Text, View } from 'react-native'

interface Props {
    titulo: string;
    descripcion: string;
    precio: number;
    ruta: Href;
}

const TarjetaProducto = ({ titulo, descripcion, precio, ruta }: Props) => {
    return (
        <View className='mt-8'>
            <Text className='text-xl font-work-black'>{titulo}</Text>
            <Text className='text-gray-700'>{descripcion}</Text>
            <View className='flex flex-row justify-between'>
                <Text className='font-work-black'>{formatearPrecio(precio)}</Text>
                <Link href={ruta} className='text-primary font-work-medium'>Ver Detalles</Link>
            </View>
        </View>
    )
}

export default TarjetaProducto
