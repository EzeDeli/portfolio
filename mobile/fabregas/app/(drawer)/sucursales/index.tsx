import { sucursales } from '@/store/sucursales.store'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { FlatList, Text, View } from 'react-native'

const SucursalesScreen = () => {
    return (
        <View className='flex-1 bg-fondo px-4'>
            <FlatList
                data={sucursales}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={
                    <View className='items-center mt-6 mb-2'>
                        <Ionicons name='storefront-outline' size={40} color='black' />
                        <Text className='text-2xl text-primary font-work-medium'>Nuestras Sucursales</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View className='bg-white rounded-xl p-4 mt-4'>
                        <Text className='text-lg text-primary font-work-black'>{item.nombre}</Text>

                        <View className='flex flex-row items-center mt-1'>
                            <Ionicons name='location-outline' size={18} color='#4B0082' />
                            <Text className='text-gray-700 ml-2'>{item.direccion}</Text>
                        </View>

                        <View className='flex flex-row items-center mt-1'>
                            <Ionicons name='time-outline' size={18} color='#4B0082' />
                            <Text className='text-gray-700 ml-2'>{item.horario}</Text>
                        </View>

                        <View className='flex flex-row items-center mt-1'>
                            <Ionicons name='call-outline' size={18} color='#4B0082' />
                            <Text className='text-gray-700 ml-2'>{item.telefono}</Text>
                        </View>
                    </View>
                )}
                ListFooterComponent={<View className='h-8' />}
            />
        </View>
    )
}

export default SucursalesScreen
