import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import React from 'react'

const TabsLayout = () => {
    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#4B0082',
            tabBarInactiveTintColor: 'white',
            tabBarActiveBackgroundColor: '#DDA0DD',
            tabBarStyle: {
                backgroundColor: '#4B0082',
            },
            tabBarLabelStyle: {
                fontFamily: 'WorkSans_500Medium',
            },
        }}>
            <Tabs.Screen
                name="productos"
                options={{
                    title: 'Productos',
                    tabBarIcon: ({ color }) => <Ionicons size={24} name="cart-outline" color={color} />,
                }}
            />
            <Tabs.Screen
                name="celulares"
                options={{
                    title: 'Celulares',
                    tabBarIcon: ({ color }) => <Ionicons size={24} name="phone-portrait-outline" color={color} />,
                }}
            />
            <Tabs.Screen
                name="televisores"
                options={{
                    title: 'Televisores',
                    tabBarIcon: ({ color }) => <Ionicons size={24} name="tv-outline" color={color} />,
                }}
            />
        </Tabs>
    )
}

export default TabsLayout
