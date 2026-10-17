import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { estilosGlobales } from './estilos-globales';
import Boton from './Boton';

  export default function App() {
    const [contador, setContador] = useState(0);
    return (
      <SafeAreaProvider>
        <SafeAreaView style = {estilosGlobales.background}>
            <Text style={estilosGlobales.fuente}>{contador}</Text>
            <StatusBar style='dark' hidden={false} animated></StatusBar>
            <Boton 
            texto='+1'
            presionar={() => setContador(contador + 1)}
            posicion='derecha'
            />
            <Boton
            texto='Reset'
            mantenerPresionado={() => setContador(0)}
            posicion='izquierda'
            />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }
