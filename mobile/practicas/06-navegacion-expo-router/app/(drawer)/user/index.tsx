import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, View } from 'react-native'

const UserScreen = () => {
    return (
        <View className='flex-1 justify-center items-center bg-pink-200'>
            <Ionicons name='person-outline' size={40} color='#3B1296' />
            <Text className='text-2xl text-primary font-work-light'>Usuario</Text>
        </View>
    )
}

export default UserScreen
