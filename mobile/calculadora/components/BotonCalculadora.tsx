import { Text, Pressable, ColorValue } from 'react-native';
import React from 'react';
import { estilosGlobales } from '@/estilosGlobales';
import { colors } from '@/colors';

interface Props {
    texto: string,
    color?: ColorValue,
    colorTexto?: ColorValue,
    ancho?: 'normal' | 'doble',
    presionar?: () => void,
}

export default function BotonCalculadora({texto, color = colors.gris, colorTexto = colors.texto, ancho = 'normal', presionar}: Props) {
    return (
        <Pressable style = {({pressed}) => [estilosGlobales.boton,
            {backgroundColor: color},
            ancho === 'doble' ? estilosGlobales.botonDoble : null,
            pressed ? {opacity: 0.5} : {opacity: 1}]}
        onPress={presionar}>
            <Text style = {[estilosGlobales.textoBoton, {color: colorTexto}]}>{texto}</Text>
        </Pressable>
    );
}
