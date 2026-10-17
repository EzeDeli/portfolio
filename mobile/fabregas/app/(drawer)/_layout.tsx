import CustomDrawer from '@/components/shared/CustomDrawer';
import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import React from 'react';

const DrawerLayout = () => {
    return (
        <Drawer
            drawerContent={CustomDrawer}
            screenOptions={{
                overlayColor: 'rgba(0,0,0,0.4)',
                drawerActiveTintColor: '#4B0082',
                drawerActiveBackgroundColor: '#EDE3F5',
                drawerInactiveTintColor: '#444',
                headerShadowVisible: false,
                sceneStyle: {
                    backgroundColor: 'white',
                },
            }}
        >
            <Drawer.Screen
                name="inicio/index"
                options={{
                    drawerLabel: 'Inicio',
                    title: 'Inicio',
                    drawerIcon: ({ color, size }) => <Ionicons
                        name='home-outline' size={size} color={color} />
                }}
            />
            <Drawer.Screen
                name="(tabs)"
                options={{
                    headerShown: false,
                    drawerLabel: 'Productos',
                    title: 'Productos',
                    drawerIcon: ({ color, size }) => <Ionicons
                        name='bag-check-outline' size={size} color={color} />
                }}
            />
            <Drawer.Screen
                name="sucursales/index"
                options={{
                    drawerLabel: 'Sucursales',
                    title: 'Sucursales',
                    drawerIcon: ({ color, size }) => <Ionicons
                        name='storefront-outline' size={size} color={color} />
                }}
            />
            <Drawer.Screen
                name="usuario/index"
                options={{
                    drawerLabel: 'Usuario',
                    title: 'Usuario',
                    drawerIcon: ({ color, size }) => <Ionicons
                        name='person-circle-outline' size={size} color={color} />
                }}
            />
            <Drawer.Screen
                name="acerca/index"
                options={{
                    drawerLabel: 'Acerca de ...',
                    title: 'Acerca de ....',
                    drawerIcon: ({ color, size }) => <Ionicons
                        name='information-circle-outline' size={size} color={color} />
                }}
            />
        </Drawer>
    )
}

export default DrawerLayout
