import { formatearPrecio, Producto } from '@/store/producto';
import { Href, Redirect, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, Text, View } from 'react-native';

interface Props {
    productos: Producto[];
    // Adonde volver si el id no existe
    rutaBase: string;
    tituloPorDefecto: string;
}

const DetalleProducto = ({ productos, rutaBase, tituloPorDefecto }: Props) => {

    const { id } = useLocalSearchParams();
    const producto = productos.find((p) => p.id === id);

    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            title: producto?.titulo ?? tituloPorDefecto,
        });
    }, [navigation, producto, tituloPorDefecto]);

    if (!producto) {
        return <Redirect href={rutaBase as Href} />
    }

    return (
        <View className='px-5 mt-2'>
            <Image source={producto.imagen} className='w-full h-52' resizeMode='contain' />
            <Text className='font-work-black text-xl mt-5'>{producto.titulo}</Text>
            <Text className='text-gray-700'>{producto.descripcion}</Text>
            <Text className='font-work-black'>{formatearPrecio(producto.precio)}</Text>
        </View>
    )
}

export default DetalleProducto
