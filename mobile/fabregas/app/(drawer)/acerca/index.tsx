import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { ScrollView, Text, View } from 'react-native'

const AcercaScreen = () => {
    return (
        <ScrollView className='flex-1 bg-fondo' contentContainerClassName='px-6 py-8'>

            <View className='items-center'>
                <Ionicons name='information-circle-outline' size={40} color='black' />
                <Text className='text-3xl text-primary font-work-black'>Fábregas</Text>
            </View>

            <View className='bg-white rounded-xl p-4 mt-6'>
                <Text className='text-lg text-primary font-work-black'>La empresa</Text>
                <Text className='text-gray-700 mt-1'>
                    Fábregas es una cadena de tiendas de tecnología y electrodomésticos.
                    Vendemos celulares, televisores, audio, computación y accesorios en
                    nuestras sucursales de zona oeste y también desde la app.
                </Text>
            </View>

            <View className='bg-white rounded-xl p-4 mt-4'>
                <Text className='text-lg text-primary font-work-black'>Contacto</Text>
                <View className='flex flex-row items-center mt-2'>
                    <Ionicons name='call-outline' size={18} color='#4B0082' />
                    <Text className='text-gray-700 ml-2'>0800-555-3227</Text>
                </View>
                <View className='flex flex-row items-center mt-1'>
                    <Ionicons name='mail-outline' size={18} color='#4B0082' />
                    <Text className='text-gray-700 ml-2'>contacto@fabregas.com.ar</Text>
                </View>
                <View className='flex flex-row items-center mt-1'>
                    <Ionicons name='logo-instagram' size={18} color='#4B0082' />
                    <Text className='text-gray-700 ml-2'>@fabregas.ok</Text>
                </View>
            </View>

            <View className='bg-white rounded-xl p-4 mt-4'>
                <Text className='text-lg text-primary font-work-black'>La aplicación</Text>
                <Text className='text-gray-700 mt-1'>Versión: 1.0.0</Text>
                <Text className='text-gray-700'>Desarrollada por: Ezequiel Delipetro</Text>
                <Text className='text-gray-700'>Desarrollo de Aplicativos Móviles - CRUI</Text>
                <Text className='text-gray-700'>Hecha con React Native y Expo</Text>
            </View>
        </ScrollView>
    )
}

export default AcercaScreen
