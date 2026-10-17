import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, View } from 'react-native'

const OffersScreen = () => {
    return (
        <View className='flex-1 justify-center items-center'>
            <Ionicons name='megaphone-outline' size={40} color='#555' />
            <Text className='text-2xl text-primary font-work-light'>Ofertas</Text>
        </View>
    )
}

export default OffersScreen
