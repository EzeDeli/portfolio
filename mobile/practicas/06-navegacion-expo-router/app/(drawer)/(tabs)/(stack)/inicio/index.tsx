import CustomButton from '@/components/shared/CustomButton'
import { DrawerActions } from 'expo-router/react-navigation'
import { Link, router, useNavigation } from 'expo-router'
import React from 'react'
import { View } from 'react-native'

const InicioScreen = () => {

    const navigation = useNavigation();

    const abrirMenu = () => {
        navigation.dispatch(DrawerActions.toggleDrawer());
    }

    return (
        <View className='mx-10 mt-5'>

            <CustomButton
                className='mb-2'
                color='primary'
                onPress={() => router.push('/products')}>Productos</CustomButton>

            <CustomButton
                className='mb-2'
                color='secondary'
                onPress={() => router.push('/offers')}>Ofertas</CustomButton>

            <CustomButton
                className='mb-2'
                color='tertiary'
                onPress={() => router.push('/profile')}>Perfil</CustomButton>

            <CustomButton
                className='mb-2'
                color='violeta'
                onPress={() => router.push('/settings')}>Ajustes</CustomButton>

            <Link href={'/products'} asChild>
                <CustomButton
                    variant='solo-texto'
                    color='primary'>Productos</CustomButton>
            </Link>

            <CustomButton color='rosa' onPress={abrirMenu}>Abrir Menú</CustomButton>
        </View>
    )
}

export default InicioScreen
