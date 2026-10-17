import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, View } from 'react-native'

const FavoritesScreen = () => {
    return (
        <View className='flex-1 justify-center items-center'>
            <Ionicons name='star-outline' size={40} color='#555' />
            <Text className='text-2xl text-primary font-work-light'>Favoritos</Text>
        </View>
    )
}

export default FavoritesScreen
