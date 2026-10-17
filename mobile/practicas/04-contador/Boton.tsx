    import { Text, Pressable } from 'react-native';
    import React from 'react';
    import { estilosGlobales } from './estilos-globales';

    interface Props {
        texto:string,
        posicion?: 'izquierda'| 'derecha',
        presionar?: () => void,
        mantenerPresionado?: () => void,
    } 

    export default function Boton({texto, presionar, mantenerPresionado, posicion = 'derecha'}: Props) {
        return (
            <Pressable style = {({pressed}) => [estilosGlobales.botonFlotante,
                posicion === 'derecha' ? estilosGlobales.botonDerecha : estilosGlobales.botonIzquierda, pressed ? {opacity:0.5,} :{opacity:1}]}
            onPress={presionar}
            onLongPress={mantenerPresionado}>
                <Text style = {{color: 'white', fontSize:20,textAlign:'center'}}
                >{texto}</Text>
            </Pressable>
        );
    }