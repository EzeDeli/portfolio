import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from 'expo-router/react-navigation';
import { router, Stack, useNavigation } from 'expo-router';
import React from 'react';

interface Props {
    // Titulo del listado, por ejemplo 'Celulares'
    titulo: string;
    // Titulo del detalle mientras carga, por ejemplo 'Celular'
    tituloDetalle: string;
}

// Stack de cada seccion de la tienda: listado + detalle. En el listado el
// boton de la izquierda abre el menu; en el detalle vuelve atras.
const StackSeccion = ({ titulo, tituloDetalle }: Props) => {

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
                name='index'
                options={{ title: titulo, }}
            />
            <Stack.Screen
                name='[id]'
                options={{ title: tituloDetalle, }}
            />
        </Stack>
    )
}

export default StackSeccion
