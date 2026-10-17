import React from 'react';
import {View, Image, StyleSheet, ImageSourcePropType, ColorValue,} from 'react-native';
import { estilosGlobales } from '../estilos-globales';

type Props = {
  imagen?: ImageSourcePropType;
  color: ColorValue;
};

export default function Casilla({imagen, color}: Props){
    return (
        <View style = {[estilosGlobales.casilla, {backgroundColor: color}]}>
            {imagen &&(
                <Image
                source={imagen}
                style = {estilosGlobales.tamanoFigura}
                resizeMode='contain'>
                </Image>

            )}

        </View>
    )
}