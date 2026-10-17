import { StyleSheet } from 'react-native';

export const estilosGlobales = StyleSheet.create({
  backgroundChess: {
    flex: 1,
    overflow:'hidden',
    width: '100%',
    height: '100%',    
  },

  backgroundJugador: {
    flex: 0.2,
    justifyContent:'center',
    alignItems:'center',
  },

  backgroundTablero:{
    flex: 0.6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 2,
    margin: 5
  },

  imagenJugador:{
    flex: 1,
    justifyContent:'center',
    alignItems:'center',
    height: '50%'
  },

  textoJugador:{
    alignItems:'center',
    textAlign:'center',
    margin: 20,
    fontSize: 25,
    fontWeight: 'bold',
    backgroundColor:'pink',
    borderRadius:5,
    borderWidth:3,
    borderColor: '#f15bf1',
    paddingHorizontal: 5
  },

  casilla:{
    width:'12.5%',
    height:'12.5%',
    borderWidth: 1,
    borderColor: 'black',
    justifyContent: 'center',
    alignItems: 'center'
  },

  tamanoFigura:{
    width:'80%',
    height:'80%',
    overflow:'hidden',
  }

})