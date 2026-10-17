import { products } from '@/store/products.store';
import { Redirect, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, Text, View } from 'react-native';

const ProductScreen = () => {

    const { id } = useLocalSearchParams();
    const product = products.find((p) => p.id === id);

    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            title: product?.titulo ?? 'Producto',
        });
    }, [product]);

    if (!product) {
        return <Redirect href='/' />
    }

    return (
        <View className='px-5 mt-2'>
            <Image source={product.imagen} className='w-full h-52' resizeMode='contain' />
            <Text className='font-work-black text-xl mt-5'>{product.titulo}</Text>
            <Text className='text-gray-700'>{product.descripcion}</Text>
            <Text className='font-work-black'>{product.precio}</Text>
        </View>
    )
}

export default ProductScreen
