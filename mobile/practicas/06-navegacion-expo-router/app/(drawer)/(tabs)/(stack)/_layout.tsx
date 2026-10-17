import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from 'expo-router/react-navigation';
import { router, Stack, useNavigation } from 'expo-router';
import React from 'react';

const StackLayout = () => {

    const navigation = useNavigation();

    const botonMenu = (canGoBack: boolean | undefined) => {
        if (canGoBack) {
            router.back();
            return;
        }
        navigation.dispatch(DrawerActions.toggleDrawer());
    };

    return (
        <Stack
            screenOptions={{
                headerShadowVisible: false,
                contentStyle: {
                    backgroundColor: 'white'
                },
                animation: 'fade_from_bottom',
                headerLeft: ({ canGoBack }) =>
                    <Ionicons
                        name={canGoBack ? 'arrow-back-outline' : 'menu-outline'}
                        size={22}
                        className='mr-5'
                        onPress={() => botonMenu(canGoBack)}
                    />,
            }}
        >
            <Stack.Screen
                name='inicio/index'
                options={{ title: 'Inicio', }}
            />
            <Stack.Screen
                name='products/index'
                options={{ title: 'Productos', }}
            />
            <Stack.Screen
                name='products/[id]'
                options={{ title: 'Producto', }}
            />
            <Stack.Screen
                name='offers/index'
                options={{ title: 'Ofertas', }}
            />
            <Stack.Screen
                name='profile/index'
                options={{ title: 'Perfil', }}
            />
            <Stack.Screen
                name='settings/index'
                options={{ title: 'Ajustes', }}
            />
        </Stack>
    )
}

export default StackLayout
