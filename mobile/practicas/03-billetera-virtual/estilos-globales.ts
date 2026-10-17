import { StyleSheet } from 'react-native';

export const estilosGlobales = StyleSheet.create({
    background: {flex:1},
    primerContenedor: {
        flexDirection:'row', 
        width:'100%',
        height:'10%',
        alignItems:'center', 
        justifyContent:'space-between',
        marginHorizontal: 10,
        marginTop:10,
    },
    contenedorNombre: {
        flexDirection:'row', 
        alignItems:'center',
        
    },
    contenedorCampana: {
        flexDirection:'row', 
        alignItems:'center',
        justifyContent:'flex-end',
        marginRight:'5%'
    },

    // Para el primer sector
    contenedorImagen1: {
        width:'20%',
        paddingRight:5
    },
    Imagen1:{
        width: '100%',
        height:'70%',
    },
    textCampana:{
        backgroundColor:'white', 
        borderRadius: 4, 
        fontWeight:'bold', 
        padding: 5,
    },

    textNombre:{
        fontWeight:'bold', 
    },


    //Para el segundo sector
    segundoContenedor: {
        width:'95%',
        height:'50%',
        alignItems:'center',
        marginHorizontal: 10, 
        backgroundColor:'white'
    },
    contenedorText: {
        width:'90%',
        height:'10%', 
        flexDirection:'row', 
        alignItems:'center', 
        justifyContent:'space-between', 
        marginHorizontal: 10,
        marginTop:10,
    },
    text1:{
        fontWeight:'bold'
    },
    text2:{
        backgroundColor:'#b4dcf371', 
        borderRadius: 4, 
        color:'#37f137', 
        fontWeight:'bold', 
        paddingHorizontal: 10},
    text3:{
        fontWeight:'bold', 
        color:'#3eade0f3'
    },
    contenedorOjo: {
        flexDirection:'row',
        width:'90%',
        height:'10%', 
        alignItems:'center',
        marginTop:20
    },
    imagenOjo: {
        width:'100%',
        height:'100%',
    },
    text4:{
        fontWeight:'bold', 
        fontSize: 24
    },
    contenedorBotones: {
        flexDirection:'row', 
        width:'95%',
        height:'40%',  
        justifyContent:'space-between'
    },
    contenedorImagen2: {
        width:'20%',
        height:'50%', 
        alignItems:'center', 
        justifyContent:'center',
    },
    imagen2:{
        width: '100%',
        height:'70%',
    },
    textIconos:{
        textAlign: 'center', 
        fontSize:10,
         
    },
    contenedorTarjeta: {
        width:'85%',
        height:'5%',
        justifyContent:'center'
    },
    tarjeta:{
        width:'100%',
    },

    //Sector 3

    tercerContenedor: {
        width:'95%',
        height:'20%',
        backgroundColor:'yellow',
        alignItems:'center',
        justifyContent:'center',
        marginHorizontal: 10,
        marginTop:20

    },
    textVence:{
        backgroundColor:'white', 
        borderRadius: 4,
        fontWeight:'bold',
        marginVertical:10 
    },
    botonPagar:{},

})