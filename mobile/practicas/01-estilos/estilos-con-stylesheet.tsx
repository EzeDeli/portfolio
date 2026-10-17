import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style = {[styles.contenedorPrincipal]}>
      <View style = {[styles.cuadro1]}>
        <Text style = {[styles.texto1]}>Bienvenidos a desarrollo de aplicativos moviles!!!</Text>
      </View>
      <View style = {[styles.cuadro2]}>
        <Text style = {[styles.texto2]}>Bienvenidos a desarrollo de aplicativos moviles!!!</Text>
      </View>
      <View style = {[styles.cuadro3]}>
        <Text style = {[styles.texto3]}>Bienvenidos a desarrollo de aplicativos moviles!!!</Text>
      </View>
      <View style = {[styles.cuadro4]}>
        <Text style = {[styles.texto4]}>Bienvenidos a desarrollo de aplicativos moviles!!!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedorPrincipal: {
    flex:1
  },
  cuadro1: {flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'blue'
  },
  texto1:{fontSize:18,color: 'white', textTransform: 'uppercase', textDecorationLine:'underline', textAlign: 'center'
  },
    cuadro2: {flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'yellow'
  },
  texto2:{fontSize: 18,fontWeight:'bold', textAlign:'left', textDecorationLine:'line-through'
  },
    cuadro3: {flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'green'
  },
  texto3:{ fontSize: 18,fontWeight:'bold',color:'yellow', textAlign:'right', textDecorationLine:'line-through'
  },
    cuadro4: {flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'red'
  },
  texto4:{ fontSize:18,color: 'white', textTransform:'capitalize', textAlign: 'center'
  }
})
