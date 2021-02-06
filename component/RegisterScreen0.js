
import React, { Component }  from 'react';
import { Alert, ScrollView, StyleSheet, View, Text, TextInput, Picker,StatusBar, TouchableHighlight,TouchableOpacity, ImageBackground, Image,AsyncStorage,Keyboard,Linking,PermissionsAndroid,ToastAndroid,Dimensions} from 'react-native';
import { StackNavigator } from 'react-navigation';
import Constants from 'expo-constants';
import SmsListener from 'react-native-android-sms-listener'
import GradientButton from "react-native-gradient-buttons";
import { FontAwesome } from '@expo/vector-icons';
import Setting from '../constants/Settings';
import * as Expo from 'expo';
import * as Permissions from 'expo-permissions';
import Loader from '../components/Loader';
import Svg, { Circle, Rect,Path,Defs,G,Mask} from 'react-native-svg';
import Toast, {DURATION} from 'react-native-easy-toast';

const { width,height } = Dimensions.get('window');
const SERVER_URL = Setting.url;

class RegisterScreen extends Component {
  static navigationOptions =  ({ navigation }) => {
  const { params = {} } = navigation.state
     return {
          header:null
    };
  }

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
         console.log(response.status,'KKKKKKKKKKKKKKKKKK');
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
          <View style={{height:Constants.statusBarHeight,backgroundColor:'#3bb3c8'}}>
             <StatusBar  translucent={true} barStyle="light-content" backgroundColor={'#3bb3c8'} networkActivityIndicatorVisible={false}    />
         </View>

           <View style={{flex:1,zIndex:2,}}>
               <View style={{flex:1}}>
                 <View style={{flex:0.9,zIndex:2,alignItems:'center',justifyContent:'center'}}>

                  <View style={{marginVertical:15,alignItems:'center'}}>
                    <Text style={{fontWeight: 'bold',fontSize: 25,color:'#000'}}> REGISTER </Text>
                  </View>

                  <View style={{marginHorizontal:30,width:width-60,marginVertical:15,}}>
                    <View style={{position:'absolute',top:-9,left:20,zIndex:2,backgroundColor:'#f2f2f2'}}>
                      <Text style={{fontSize:12,paddingHorizontal:5,color:'#000'}}>Enter Name</Text>
                    </View>
                    <TextInput style={{height: 45,borderWidth:1,borderColor:'#000',width:'100%',borderRadius:10,color:'#000',paddingHorizontal:15}}
                       placeholder=""
                       selectionColor={'#000'}
                       onChangeText={query => { this.setState({ name: query }) }}
                       value ={this.state.name}
                    />
                  </View>

                  <View style={{marginHorizontal:30,width:width-60,marginVertical:15,}}>
                    <View style={{position:'absolute',top:-9,left:20,zIndex:2,backgroundColor:'#f2f2f2'}}>
                      <Text style={{fontSize:12,paddingHorizontal:5,color:'#000'}}>Enter Company Name</Text>
                    </View>
                    <TextInput style={{height: 45,borderWidth:1,borderColor:'#000',width:'100%',borderRadius:10,color:'#000',paddingHorizontal:15}}
                      placeholder=""
                      selectionColor={'#000'}
                      onChangeText={query => { this.setState({ companyName: query }) }}
                      value={this.state.companyName}
                    />
                  </View>

                  <TouchableOpacity onPress={()=>{this.saveDetails()}} style={{backgroundColor:'#3bb3c8',borderRadius:20,paddingVertical:8,paddingHorizontal:20,marginVertical:15}}>
                    <Text style={{fontSize:16,color:'#fff',fontWeight:'700'}}>SAVE</Text>
                  </TouchableOpacity>

                 </View>
               </View>
           </View>
        </View>
    );
  }else{
    return(
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <Loader modalVisible = {true} animationType="fade" />
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


export default RegisterScreen
