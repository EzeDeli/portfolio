import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, View } from 'react-native'

const ScheduleScreen = () => {
    return (
        <View className='flex-1 justify-center items-center bg-purple-200'>
            <Ionicons name='calendar-outline' size={40} color='#3B1296' />
            <Text className='text-2xl text-primary font-work-light'>Horario</Text>
        </View>
    )
}

export default ScheduleScreen
