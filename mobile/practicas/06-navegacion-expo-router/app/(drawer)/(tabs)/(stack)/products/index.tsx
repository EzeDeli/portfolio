import { products } from '@/store/products.store'
import { Link } from 'expo-router'
import React from 'react'
import { FlatList, Text, View } from 'react-native'

const ProductsScreen = () => {
    return (
        <View className='flex flex-1 px-4'>
            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View className='mt-8'>
                        <Text className='text-xl font-work-black'>{item.titulo}</Text>
                        <Text className='text-gray-700'>{item.descripcion}</Text>
                        <View className='flex flex-row justify-between'>
                            <Text className='font-work-black'>{item.precio}</Text>
                            <Link href={`/products/${item.id}`} className='text-primary font-work-medium'>Ver Detalles</Link>
                        </View>
                    </View>
                )}
            />
        </View>
    )
}

export default ProductsScreen
