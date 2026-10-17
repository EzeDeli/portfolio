import { Image, ImageBackground, StyleSheet, View } from 'react-native';

  export default function HomeScreen() {
    return (
      <View style={{flex: 1}}>
      <ImageBackground
        source={require('@/assets/images/splash-icon.png')}
        style={[styles.imagenPrincipal]}
        resizeMode='cover'
      >
        <View style={[styles.contenedoresImagen1]}>
          <Image 
          source={require('../../assets/images/android-icon-foreground.png')}
          style={[styles.Imagen1]}
          resizeMode='center'
          />
        </View>
        <View style={[styles.contenedoresImagen2]}>
          <Image 
          source={require('../../assets/images/icon.png')}
          style={[styles.Imagen2]}
          />
        </View>
        <View style={[styles.contenedoresImagen3]}>
          <Image 
          source={require('../../assets/images/react-logo.png')}
          style={[styles.Imagen3]}
          resizeMode='stretch'
          />
        </View>
      </ImageBackground>
      </View>
    );
  }

  const styles = StyleSheet.create({
    imagenPrincipal: {flex:1, width: '100%', height:'100%', backgroundColor:'orange', alignItems:'center'
    },
    Imagen1:{width: '60%', height:'95%', backgroundColor: 'white', borderWidth:2, borderColor:'orange', borderRadius: 20,
    },
    Imagen2:{width: '100%', height:'100%', backgroundColor: 'white',
    },
    Imagen3:{width: '100%', height:'100%', backgroundColor: 'white',
    },
    contenedoresImagen1: {flex: 1,justifyContent:'center', alignItems:'center', backgroundColor: 'white', width: '85%', margin: 25, borderLeftWidth:5, borderRightWidth:5, borderLeftColor: 'red', borderRightColor: 'red',
    },
    contenedoresImagen2: {flex: 1, overflow: 'hidden', backgroundColor: 'white', width: '85%', margin: 25, borderWidth:5, borderColor:'red', borderRadius: 30,
    },
    contenedoresImagen3: {flex: 1, backgroundColor: 'white', width: '85%', margin: 25, borderTopWidth:5, borderBottomWidth:5, borderTopColor: 'red', borderBottomColor: 'red',
    },
  })
