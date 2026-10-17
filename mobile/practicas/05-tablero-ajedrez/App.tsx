import { StatusBar } from 'expo-status-bar';
import { Text, View, ImageBackground, Image, ImageSourcePropType } from 'react-native';
import { estilosGlobales } from './estilos-globales';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Casilla from './components/Casilla';

const piezas = {
  ntorre: require('./assets/ntorre.png'),
  ncaballo: require('./assets/ncaballo.png'),
  nalfil: require('./assets/nalfil.png'),
  nreina: require('./assets/nreina.png'),
  nrey: require('./assets/nrey.png'),
  npeon: require('./assets/npeon.png'),
  btorre: require('./assets/btorre.png'),
  bcaballo: require('./assets/bcaballo.png'),
  balfil: require('./assets/balfil.png'),
  breina: require('./assets/breina.png'),
  brey: require('./assets/brey.png'),
  bpeon: require('./assets/bpeon.png'),
};

// La reina va en la columna d, sobre la casilla de su propio color
const filaTrasera = ['torre', 'caballo', 'alfil', 'reina', 'rey', 'alfil', 'caballo', 'torre'];

function piezaInicial(fila: number, columna: number): ImageSourcePropType | undefined {
  if (fila === 0) return piezas[`n${filaTrasera[columna]}` as keyof typeof piezas];
  if (fila === 1) return piezas.npeon;
  if (fila === 6) return piezas.bpeon;
  if (fila === 7) return piezas[`b${filaTrasera[columna]}` as keyof typeof piezas];
  return undefined;
}

const casillas = Array.from({ length: 64 }, (_, i) => {
  const fila = Math.floor(i / 8);
  const columna = i % 8;
  return {
    clave: `${fila}-${columna}`,
    color: (fila + columna) % 2 === 0 ? 'white' : 'lightblue',
    imagen: piezaInicial(fila, columna),
  };
});

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style='auto' hidden={false} animated></StatusBar>
        <ImageBackground
          source={require('./assets/chess.png')}
          style={estilosGlobales.backgroundChess}
          resizeMode='cover'>

          <View style={estilosGlobales.backgroundJugador}>
            <Text style={estilosGlobales.textoJugador}> Jugador 1</Text>
            <Image
              source={require('./assets/jugador1.png')}
              style={estilosGlobales.imagenJugador}
            ></Image>
          </View>

          <View style={estilosGlobales.backgroundTablero}>
            {casillas.map((casilla) => (
              <Casilla key={casilla.clave} imagen={casilla.imagen} color={casilla.color}></Casilla>
            ))}
          </View>

          <View style={estilosGlobales.backgroundJugador}>
            <Image
              source={require('./assets/jugador2.png')}
              style={estilosGlobales.imagenJugador}
            ></Image>
            <Text style={estilosGlobales.textoJugador}> Jugador 2</Text>
          </View>

        </ImageBackground>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
