import { Pressable, PressableProps, Text } from 'react-native'
import React from 'react'

interface Props extends PressableProps {
    children: string;
    color?: 'primary' | 'secondary' | 'tertiary' | 'violeta' | 'rosa';
    variant?: 'contained' | 'solo-texto';
    className?: string;
}

const CustomButton = ({ children, color = 'primary', onPress, onLongPress, variant = 'contained', className }: Props) => {

    const btnColor = {
        primary: 'bg-primary',
        secondary: 'bg-secondary',
        tertiary: 'bg-tertiary',
        violeta: 'bg-violeta',
        rosa: 'bg-rosa',
    }[color];

    const textColor = {
        primary: 'text-primary',
        secondary: 'text-secondary',
        tertiary: 'text-tertiary',
        violeta: 'text-violeta',
        rosa: 'text-rosa',
    }[color];

    if (variant === 'solo-texto') {
        return (
            <Pressable className={`p-3 ${className}`} onPress={onPress} onLongPress={onLongPress}>
                <Text className={`text-center ${textColor} font-work-medium`}>{children}</Text>
            </Pressable>
        )
    }

    return (
        <Pressable
            className={`p-3 rounded-md ${btnColor} active:opacity-90 ${className}`}
            onPress={onPress}
            onLongPress={onLongPress}
        >
            <Text className='text-white text-center font-work-black'>{children}</Text>
        </Pressable>
    )
}

export default CustomButton
