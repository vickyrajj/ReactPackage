
import React, { Component }  from 'react';
import { Alert, ScrollView, StyleSheet, View, Text, TextInput, Picker,StatusBar, TouchableHighlight,TouchableOpacity, ImageBackground, Image,AsyncStorage,Keyboard,Linking,PermissionsAndroid,ToastAndroid,Dimensions,ActivityIndicator} from 'react-native';
import { StackNavigator } from 'react-navigation';
import Constants from 'expo-constants';
import GradientButton from "react-native-gradient-buttons";
import { FontAwesome } from '@expo/vector-icons';
import * as Expo from 'expo';
import * as Permissions from 'expo-permissions';
import Svg, { Circle, Rect,Path,Defs,G,Mask} from 'react-native-svg';
import Toast, {DURATION} from 'react-native-easy-toast';
import PropTypes from 'prop-types';

const { width,height } = Dimensions.get('window');


class RegisterScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
        loader:false,
        name:'',
        companyName:'',
        serverURL:null
    }
  }

  componentDidMount() {
    this.setUrl()
  }

  setUrl=async()=>{
    const SERVER_URL = await AsyncStorage.getItem('SERVER_URL');
    this.setState({SERVER_URL:SERVER_URL})
  }

saveDetails=async()=>{

   const SERVER_URL = await AsyncStorage.getItem('SERVER_URL');
   const sessionid = await AsyncStorage.getItem('sessionid');
   const csrf = await AsyncStorage.getItem('csrf');
   const pk = await AsyncStorage.getItem('userpk');
   if(this.state.name.length==0){
     ToastAndroid.showWithGravityAndOffset('Enter Name',ToastAndroid.SHORT,ToastAndroid.CENTER,25,50);
     return
   }
   if(this.state.companyName.length==0){
     ToastAndroid.showWithGravityAndOffset('Enter Company Name',ToastAndroid.SHORT,ToastAndroid.CENTER,25,50);
     return
   }

     var dataSend ={
       pk:pk,
       name:this.state.name,
       company:this.state.companyName,
     }

     fetch(SERVER_URL+'/api/HR/regNewUser/', {
       method: 'POST',
       headers: {
         "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
         'Content-Type': 'application/json',
         'X-CSRFToken':csrf,
         'Referer': SERVER_URL,
       },
       body:JSON.stringify(dataSend),
     }).then((response) =>{
         if(response.status == '200'||response.status == '201'){
           return response.json();
         }
     }).then((json) => {
        this.props.navigation.navigate ('Main')
        return
        console.log(json,'response added company address');
     })
     .catch((error) => {
        console.log(error)
     });
  }

  render(){

     if(!this.state.loader){
     return (
        <View style={{flex:1,backgroundColor:'#f2f2f2',}}>
        <Toast style={{backgroundColor: '#000'}} textStyle={{color: '#fff'}} ref="toast" position = 'bottom'/>

          <View style={{height:Constants.statusBarHeight,backgroundColor:'#f2f2f2'}}>
            <StatusBar  translucent={true} barStyle="light-content" backgroundColor={'#f2f2f2'} networkActivityIndicatorVisible={false}    />
          </View>

           <View style={{flex:1,zIndex:2,}}>
               <View style={{flex:1}}>
                  <View style={{flex:0.2,zIndex:2,flexDirection:'row',alignItems:'center',marginHorizontal:30}}>
                    <Image style={{width:width*0.45,height:width*0.25,resizeMode:'contain'}} source={require('./Images/erplogo.png')} />
                 </View>

                 <View style={{flex:0.8,zIndex:2,justifyContent:'flex-start'}}>

                   <View style={{marginVertical:15,marginHorizontal:30,marginTop:height*0.15}}>
                      <Text style={{fontWeight: 'bold',fontSize: 25,color:'#000'}}> Login </Text>
                   </View>



                    <View style={{marginHorizontal:30,width:width-60,marginVertical:15,}}>
                      <TextInput style={{height: 50,borderWidth:1,borderColor:'rgba(0, 0, 0, 0.1)',width:'100%',borderRadius:10,backgroundColor:'rgba(0, 0, 0, 0.1)',paddingHorizontal:15,fontSize:16}}
                         placeholder="Name"
                         placeholderTextColor='rgba(0, 0, 0, 0.5)'
                         selectionColor={'#000'}
                         onChangeText={query => { this.setState({ name: query }) }}
                         value ={this.state.name}
                      />
                    </View>

                      <View style={{marginHorizontal:30,width:width-60,marginVertical:15,}}>
                        <TextInput style={{height: 50,borderWidth:1,borderColor:'rgba(0, 0, 0, 0.1)',width:'100%',borderRadius:10,backgroundColor:'rgba(0, 0, 0, 0.1)',paddingHorizontal:15,fontSize:16}}
                          placeholder="Company Name"
                          placeholderTextColor='rgba(0, 0, 0, 0.5)'
                          selectionColor={'#000'}
                          onChangeText={query => { this.setState({ companyName: query }) }}
                          value={this.state.companyName}
                        />
                      </View>

                    <TouchableOpacity onPress={()=>{this.saveDetails()}} style={{alignItems:'center',justifyContent:'center',marginHorizontal:30,width:width-60,borderRadius:10,marginVertical:15,paddingVertical:12,backgroundColor:'#286090'}}>
                      <Text style={{fontSize:18,color:'#fff',fontWeight:'600'}}>Complete Sign In</Text>
                    </TouchableOpacity>

                </View>


               </View>
           </View>
        </View>
    );
  }else{
    return(
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <ActivityIndicator size="small" color={'#f2f2f2'} />
      </View>
    )
  }
}
}


const styles = StyleSheet.create({
  submit:{
      marginRight:40,
      marginLeft:40,
      marginTop:10,
      paddingTop:10,
      paddingBottom:10,
      borderRadius:50,
  },

  imgBackground: {
    width: '100%',
    height: '100%',
    flex: 1
  },
  });

export {
  RegisterScreen
}
