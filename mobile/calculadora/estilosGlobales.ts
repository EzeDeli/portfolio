import { StyleSheet } from 'react-native';
import { colors } from '@/colors';

export const estilosGlobales = StyleSheet.create({
    fondo: {
        flex: 1,
        backgroundColor: colors.fondo,
    },

    visor: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 30,
    },

    textoVisor: {
        color: colors.texto,
        fontSize: 42,
        fontWeight: 'bold',
        textAlign: 'right',
    },

    textoHistorial: {
        color: colors.textoHistorial,
        fontSize: 24,
        textAlign: 'right',
        marginTop: 5,
    },

    botonera: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'center',
        width: 320,
        marginBottom: 20,
    },

    boton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        margin: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },

    botonDoble: {
        width: 150,
    },

    textoBoton: {
        fontSize: 26,
    },
})
