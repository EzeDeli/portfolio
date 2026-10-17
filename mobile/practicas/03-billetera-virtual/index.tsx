import { estilosGlobales } from './estilos-globales';
import { Alert, Button, Image, ImageBackground, Text, View } from 'react-native';

  export default function HomeScreen() {
    return (
      <View style={{flex: 1}}>
        <ImageBackground 
        source={require('@/assets/Desafío4/fondo.png')}
        style = {estilosGlobales.background}>

          <View style = {estilosGlobales.primerContenedor}>

            <View style = {estilosGlobales.contenedorNombre}>
              <View style = {estilosGlobales.contenedorImagen1}>
                <Image 
              source={require('@/assets/Desafío4/mp32x32.png')}
              style= {estilosGlobales.Imagen1}
              resizeMode='center'></Image>
              </View>
              <Text style = {estilosGlobales.textNombre}>Hola, EZEQUIEL {'>'} </Text>
            </View>
            <View style = {estilosGlobales.contenedorCampana}>
              <View style = {estilosGlobales.contenedorImagen1}>
                <Image 
              source={require('@/assets/Desafío4/campana64.png')}
              style= {estilosGlobales.Imagen1}
              resizeMode='center'></Image>
              </View>
              <Text style = {estilosGlobales.textCampana}>Ayuda 24 hs</Text>
            </View>

          </View>

          <View style = {estilosGlobales.segundoContenedor}>
            
            <View style = {estilosGlobales.contenedorText}>
              <Text style = {estilosGlobales.text1}>Disponible</Text>
              <Text style = {estilosGlobales.text2}>Rinde 26,7%</Text>
              <Text style = {estilosGlobales.text3}>Ir a movimiento {'>'}</Text>
            </View>

            <View style = {estilosGlobales.contenedorOjo}>
              <Text style = {estilosGlobales.text4}>$ 250.323,74</Text> 
              <View style = {estilosGlobales.contenedorImagen1}>
                <Image 
                source={require('@/assets/Desafío4/ojo64.png')}
                style= {estilosGlobales.imagenOjo}
                resizeMode='center'></Image>
              </View>
            </View>

            <View style = {estilosGlobales.contenedorBotones}>
              <View style = {estilosGlobales.contenedorImagen2}>
                <Image 
                source={require('@/assets/Desafío4/ingresar.png')}
                style= {estilosGlobales.imagen2}
                resizeMode='center'
                ></Image>
                <Text style = {estilosGlobales.textIconos}>Ingresar</Text>
              </View>
              <View style = {estilosGlobales.contenedorImagen2}>
                <Image 
                source={require('@/assets/Desafío4/transferir.png')}
                style= {estilosGlobales.imagen2}
                resizeMode='center'
                ></Image>
                <Text style = {estilosGlobales.textIconos}>Transferir</Text>
              </View>
              <View style = {estilosGlobales.contenedorImagen2}>
                <Image 
                source={require('@/assets/Desafío4/sacar.png')}
                style= {estilosGlobales.imagen2}
                resizeMode='center'
                ></Image>
                <Text style = {estilosGlobales.textIconos}>Sacar</Text>
              </View>
              <View style = {estilosGlobales.contenedorImagen2}>
                <Image 
                source={require('@/assets/Desafío4/tus-alias.png')}
                style= {estilosGlobales.imagen2}
                resizeMode='center'
                ></Image>
                <Text style = {estilosGlobales.textIconos}>Tus alias</Text>
              </View>
            </View>

            <View style={estilosGlobales.contenedorTarjeta}>
              <View>
                <Image
              source={require('@/assets/Desafío4/tarjeta.png')}
              style={estilosGlobales.tarjeta}
              resizeMode='center'></Image>
              </View>
              
            </View>

          </View>

          <View style = {estilosGlobales.tercerContenedor}>

            <Text style= {estilosGlobales.textVence}>Vence en 3 dias</Text>
            <Button 
            title='PAGAR CREDITO'
            onPress={()=>Alert.alert('Deuda Cancelada.')}
            accessibilityLabel='PAGAR CREDITO'
            disabled={false}
            color={'#2ceef5'}
            ></Button>
            
          </View>

        </ImageBackground>
      </View>
    );
  }

