import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, View } from 'react-native'

const SettingsScreen = () => {
    return (
        <View className='flex-1 justify-center items-center'>
            <Ionicons name='settings-outline' size={40} color='#555' />
            <Text className='text-2xl text-primary font-work-light'>Ajustes</Text>
        </View>
    )
}

export default SettingsScreen
