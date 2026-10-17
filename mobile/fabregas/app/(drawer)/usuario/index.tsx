import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { ScrollView, Text, View } from 'react-native'

const datos = [
    { icono: 'mail-outline', titulo: 'Email', valor: 'ezequiel.delipetro@mail.com' },
    { icono: 'call-outline', titulo: 'Teléfono', valor: '11 5555-1234' },
    { icono: 'location-outline', titulo: 'Dirección', valor: 'Ituzaingó, Buenos Aires' },
    { icono: 'calendar-outline', titulo: 'Cliente desde', valor: 'Marzo 2026' },
    { icono: 'storefront-outline', titulo: 'Sucursal favorita', valor: 'Fábregas Ituzaingó' },
] as const;

const UsuarioScreen = () => {
    return (
        <ScrollView className='flex-1 bg-fondo' contentContainerClassName='px-6 py-8'>

            <View className='items-center'>
                <View className='flex justify-center items-center bg-primary rounded-full h-28 w-28'>
                    <Text className='text-white font-work-black text-4xl'>ED</Text>
                </View>
                <Text className='text-2xl text-primary font-work-black mt-3'>Ezequiel Delipetro</Text>
                <Text className='text-primary font-work-medium'>Cliente Fábregas Plus</Text>
            </View>

            <View className='bg-white rounded-xl p-4 mt-8'>
                {datos.map((dato) => (
                    <View key={dato.titulo} className='flex flex-row items-center py-3 border-b border-gray-200'>
                        <Ionicons name={dato.icono} size={22} color='#4B0082' />
                        <View className='ml-3'>
                            <Text className='text-gray-500 text-xs'>{dato.titulo}</Text>
                            <Text className='font-work-medium'>{dato.valor}</Text>
                        </View>
                    </View>
                ))}
            </View>

            <View className='flex flex-row justify-between mt-6'>
                <View className='flex-1 bg-white rounded-xl p-4 mr-2 items-center'>
                    <Text className='text-2xl text-primary font-work-black'>12</Text>
                    <Text className='text-gray-700'>Compras</Text>
                </View>
                <View className='flex-1 bg-white rounded-xl p-4 ml-2 items-center'>
                    <Text className='text-2xl text-primary font-work-black'>3450</Text>
                    <Text className='text-gray-700'>Puntos</Text>
                </View>
            </View>
        </ScrollView>
    )
}

export default UsuarioScreen
