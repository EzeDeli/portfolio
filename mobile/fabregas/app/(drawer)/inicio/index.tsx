import CustomButton from '@/components/shared/CustomButton'
import { Ionicons } from '@expo/vector-icons'
import { DrawerActions } from 'expo-router/react-navigation'
import { router, useNavigation } from 'expo-router'
import React from 'react'
import { ScrollView, Text, View } from 'react-native'

const InicioScreen = () => {

    const navigation = useNavigation();

    const abrirMenu = () => {
        navigation.dispatch(DrawerActions.toggleDrawer());
    }

    return (
        <ScrollView className='flex-1 bg-fondo' contentContainerClassName='px-10 py-8'>

            <View className='items-center mb-8'>
                <Ionicons name='home-outline' size={40} color='black' />
                <Text className='text-3xl text-primary font-work-black'>Fábregas</Text>
                <Text className='text-primary font-work-medium text-center'>
                    Tecnología y electro al mejor precio
                </Text>
            </View>

            <CustomButton
                className='mb-2'
                color='primary'
                onPress={() => router.push('/productos')}>Productos</CustomButton>

            <CustomButton
                className='mb-2'
                color='violeta'
                onPress={() => router.push('/celulares')}>Celulares</CustomButton>

            <CustomButton
                className='mb-2'
                color='tertiary'
                onPress={() => router.push('/televisores')}>Televisores</CustomButton>

            <CustomButton
                className='mb-2'
                color='primary'
                onPress={() => router.push('/sucursales')}>Sucursales</CustomButton>

            <CustomButton
                className='mb-2'
                color='violeta'
                onPress={() => router.push('/usuario')}>Usuario</CustomButton>

            <CustomButton
                className='mb-2'
                color='tertiary'
                onPress={() => router.push('/acerca')}>Acerca de ...</CustomButton>

            <CustomButton
                variant='solo-texto'
                color='primary'
                onPress={abrirMenu}>Abrir Menú</CustomButton>
        </ScrollView>
    )
}

export default InicioScreen
