import { StyleSheet } from 'react-native';

export const estilosGlobales = StyleSheet.create({
    background: {flex:1,
        backgroundColor:'white',
        alignItems: 'center',
        justifyContent:'center',
    },
    fuente:{
        fontWeight:'bold',
        fontSize:80,
    },
    botonFlotante: {
        position:'absolute',
        bottom: 20,
        backgroundColor:'red',
        padding:20,
        borderRadius:15,
        shadowColor:'black',
        elevation:10,
    },
    botonDerecha: {
        right: 20,
    },
    botonIzquierda: {
        left: 20,
    }
    
})