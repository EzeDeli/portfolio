import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={{flex: 1}}>
      <View style={{flex:1, justifyContent: 'center', alignItems:'center', backgroundColor:'blue',  paddingHorizontal: 50}}>
        <Text style= {{fontSize:18,color: 'white', textTransform: 'uppercase', textDecorationLine:'underline', textAlign: 'center'}}>Bienvenidos a desarrollo de aplicativos moviles!!!</Text>
      </View>
      <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'yellow'}}>
        <Text style={{fontSize: 18,fontWeight:'bold', textAlign:'left', textDecorationLine:'line-through'}}>Bienvenidos a desarrollo de aplicativos moviles!!!</Text>
      </View>
      <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'green'}}>
        <Text style={{fontSize: 18,fontWeight:'bold',color:'yellow', textAlign:'right', textDecorationLine:'line-through'}}>Bienvenidos a desarrollo de aplicativos moviles!!!</Text>
      </View>
      <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'red'}}>
        <Text style= {{fontSize:18,color: 'white', textTransform:'capitalize', textAlign: 'center'}}>Bienvenidos a desarrollo de aplicativos moviles!!!</Text>
      </View>
    </View>
  );
}

