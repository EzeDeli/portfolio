import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList } from 'expo-router/drawer'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Pressable, Text, View } from 'react-native'

const CustomDrawer = (props: DrawerContentComponentProps) => {

    const cerrarMenu = () => {
        props.navigation.closeDrawer();
    }

    return (
        <DrawerContentScrollView {...props} scrollEnabled={false}>
            <View className='flex justify-center items-center mx-3 p-10 mb-10 h-[150px] rounded-xl bg-primary'>
                <View className='flex justify-center items-center bg-white rounded-full h-24 w-24'>
                    <Text className='text-primary font-work-black text-3xl'>ED</Text>
                </View>
            </View>

            <DrawerItemList {...props} />

            <Pressable
                className='flex flex-row items-center mx-3 mt-10 px-4 py-3 rounded-full bg-violeta active:opacity-80'
                onPress={cerrarMenu}
            >
                <Ionicons name='close-outline' size={22} color='white' />
                <Text className='text-white font-work-black ml-1'>Cerrar Menú</Text>
            </Pressable>
        </DrawerContentScrollView>
    )
}

export default CustomDrawer
