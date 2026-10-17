import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { estilosGlobales } from '@/estilosGlobales';
import { colors } from '@/colors';
import BotonCalculadora from '@/components/BotonCalculadora';

enum Operaciones {
  sumar = '+',
  restar = '-',
  multiplicar = 'x',
  dividir = '/',
}

export default function Calculadora() {
  const [formula, setFormula] = useState('0');
  const [historial, setHistorial] = useState('');
  const [esResultado, setEsResultado] = useState(false);

  function esOperador(caracter: string) {
    return caracter === Operaciones.sumar || caracter === Operaciones.restar ||
           caracter === Operaciones.multiplicar || caracter === Operaciones.dividir;
  }

  function separar() {
    const partes: string[] = [];
    let numero = '';

    for (let i = 0; i < formula.length; i++) {
      const caracter = formula[i];

      if (caracter === '(' || caracter === ')') {
        continue;
      }

      if (esOperador(caracter) && numero !== '') {
        partes.push(numero);
        partes.push(caracter);
        numero = '';
      } else {
        numero = numero + caracter;
      }
    }

    partes.push(numero);
    return partes;
  }

  function ultimoNumero() {
    const partes = separar();
    return partes[partes.length - 1];
  }

  // Devuelve null si la cuenta no tiene resultado (division por cero)
  function resolver(partes: string[]): number | null {
    const cuentas: string[] = [];

    for (let i = 0; i < partes.length; i++) {
      const parte = partes[i];

      if (parte === Operaciones.multiplicar) {
        const anterior = Number(cuentas.pop());
        const siguiente = Number(partes[i + 1]);
        cuentas.push(String(anterior * siguiente));
        i = i + 1;
      } else if (parte === Operaciones.dividir) {
        const anterior = Number(cuentas.pop());
        const siguiente = Number(partes[i + 1]);

        if (siguiente === 0) {
          return null;
        }

        cuentas.push(String(anterior / siguiente));

        i = i + 1;
      } else {
        cuentas.push(parte);
      }
    }

    let total = Number(cuentas[0]);

    for (let i = 1; i < cuentas.length; i = i + 2) {
      const signo = cuentas[i];
      const valor = Number(cuentas[i + 1]);

      if (signo === Operaciones.sumar) {
        total = total + valor;
      } else {
        total = total - valor;
      }
    }

    return total;
  }

  function armarNumero(texto: string) {
    if (esResultado) {
      setEsResultado(false);

      if (texto === '.') {
        setFormula('0.');
      } else {
        setFormula(texto);
      }
      return;
    }

    const ultimo = ultimoNumero();

    if (texto === '.') {
      if (ultimo.includes('.')) {
        return;
      }
      if (ultimo === '') {
        setFormula(formula + '0.');
      } else {
        setFormula(formula + '.');
      }
      return;
    }

    if (ultimo === '0') {
      setFormula(formula.slice(0, formula.length - 1) + texto);
      return;
    }

    setFormula(formula + texto);
  }

  function agregarOperador(signo: Operaciones) {
    if (formula === 'Error') {
      return;
    }

    setEsResultado(false);
    let base = formula;

    if (base[base.length - 1] === '.') {
      base = base.slice(0, base.length - 1);
    }

    if (esOperador(base[base.length - 1])) {
      base = base.slice(0, base.length - 1);
    }

    setFormula(base + signo);
  }

  function cambiarSigno() {
    if (formula === 'Error') {
      return;
    }

    const ultimo = ultimoNumero();

    if (ultimo === '' || ultimo === '0') {
      return;
    }

    if (formula[formula.length - 1] === ')') {
      const sinCierre = formula.slice(0, formula.length - 1);
      const antes = sinCierre.slice(0, sinCierre.length - ultimo.length - 1);
      setFormula(antes + ultimo.replace('-', ''));
      return;
    }

    const antes = formula.slice(0, formula.length - ultimo.length);

    if (ultimo.includes('-')) {
      setFormula(antes + ultimo.replace('-', ''));
      return;
    }

    setFormula(antes + '(-' + ultimo + ')');
  }

  function borrar() {
    setEsResultado(false);

    if (formula === 'Error') {
      setFormula('0');
      return;
    }

    if (formula[formula.length - 1] === ')') {
      const ultimo = ultimoNumero();
      const antes = formula.slice(0, formula.length - ultimo.length - 2);
      setFormula(antes + ultimo.replace('-', ''));
      return;
    }

    const recortado = formula.slice(0, formula.length - 1);

    if (recortado === '') {
      setFormula('0');
    } else {
      setFormula(recortado);
    }
  }

  function limpiar() {
    setFormula('0');
    setHistorial('');
    setEsResultado(false);
  }

  function calcular() {
    const ultimoCaracter = formula[formula.length - 1];

    if (esOperador(ultimoCaracter) || ultimoCaracter === '.') {
      return;
    }

    const partes = separar();

    if (partes.length < 3) {
      return;
    }

    const resultado = resolver(partes);

    setHistorial(formula);
    setEsResultado(true);

    if (resultado === null) {
      setFormula('Error');
      return;
    }

    setFormula(String(Number(resultado.toFixed(10))));
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style = {estilosGlobales.fondo}>
        <StatusBar style='light' hidden={false} animated></StatusBar>

        <View style = {estilosGlobales.visor}>
          <Text style = {estilosGlobales.textoVisor}>{formula}</Text>
          <Text style = {estilosGlobales.textoHistorial}>{historial}</Text>
        </View>

        <View style = {estilosGlobales.botonera}>

          <BotonCalculadora
          texto='C'
          color={colors.grisOscuro}
          colorTexto={colors.textoOscuro}
          presionar={limpiar}
          />
          <BotonCalculadora
          texto='+/-'
          color={colors.grisOscuro}
          colorTexto={colors.textoOscuro}
          presionar={cambiarSigno}
          />
          <BotonCalculadora
          texto='del'
          color={colors.grisOscuro}
          colorTexto={colors.textoOscuro}
          presionar={borrar}
          />
          <BotonCalculadora
          texto='/'
          color={colors.naranja}
          presionar={() => agregarOperador(Operaciones.dividir)}
          />

          <BotonCalculadora texto='7' presionar={() => armarNumero('7')} />
          <BotonCalculadora texto='8' presionar={() => armarNumero('8')} />
          <BotonCalculadora texto='9' presionar={() => armarNumero('9')} />
          <BotonCalculadora
          texto='x'
          color={colors.naranja}
          presionar={() => agregarOperador(Operaciones.multiplicar)}
          />

          <BotonCalculadora texto='4' presionar={() => armarNumero('4')} />
          <BotonCalculadora texto='5' presionar={() => armarNumero('5')} />
          <BotonCalculadora texto='6' presionar={() => armarNumero('6')} />
          <BotonCalculadora
          texto='-'
          color={colors.naranja}
          presionar={() => agregarOperador(Operaciones.restar)}
          />

          <BotonCalculadora texto='1' presionar={() => armarNumero('1')} />
          <BotonCalculadora texto='2' presionar={() => armarNumero('2')} />
          <BotonCalculadora texto='3' presionar={() => armarNumero('3')} />
          <BotonCalculadora
          texto='+'
          color={colors.naranja}
          presionar={() => agregarOperador(Operaciones.sumar)}
          />

          <BotonCalculadora texto='0' ancho='doble' presionar={() => armarNumero('0')} />
          <BotonCalculadora texto='.' presionar={() => armarNumero('.')} />
          <BotonCalculadora
          texto='='
          color={colors.naranja}
          presionar={calcular}
          />

        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
