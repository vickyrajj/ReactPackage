
import React, { Component }  from 'react';
import { Alert, ScrollView, StyleSheet, View,StatusBar, Text, TextInput, Picker, TouchableHighlight,TouchableOpacity, ImageBackground, Image,AsyncStorage,Keyboard,Linking,PermissionsAndroid,ToastAndroid,Dimensions , ActivityIndicator} from 'react-native';
import Constants from 'expo-constants';
import SmsListener from 'react-native-android-sms-listener'
import GradientButton from "react-native-gradient-buttons";
import { FontAwesome } from '@expo/vector-icons';
import * as Expo from 'expo';
import * as Permissions from 'expo-permissions';
import Svg, { Circle, Rect,Path,Defs,G,Mask} from 'react-native-svg';
import Toast, {DURATION} from 'react-native-easy-toast';
import { Notifications } from 'expo';

const { width,height } = Dimensions.get('window');

class OtpScreen extends Component {


  constructor(props) {
    super(props);
      this.state = {
        username:'',
        otp:[],
        needOTP:true,
        text:'',
        screen:'',
        mobileNo:'',
        checked:true,
        csrf:null,
        sessionid:null,
        loadingVisible:false,
        url:''
      }
      this.otpTextInput = []
}


componentDidMount(){
  var screen = this.props.navigation.getParam('screen',null)
  var username = this.props.navigation.getParam('username',null)
  var userPk = this.props.navigation.getParam('userPk',null)
  var token = this.props.navigation.getParam('token',null)
  var mobile = this.props.navigation.getParam('mobile',null)
  var csrf = this.props.navigation.getParam('csrf',null)
  var url = this.props.navigation.getParam('url',null)

  if(screen == 'LogInScreen'){
    this.setState({text:'Login',screen:'login',username:username,url:url})
  }else{
    this.setState({text:'Register',screen:'register',username:username,mobileNo:username,url:url})
    this.setState({userPk: userPk,token:token,mobile:mobile,mobileNo:username,csrf:csrf,url:url})
  }
}


renderVerify=()=>{
  return(
    <View style={{flexDirection: 'row',width:width,alignItems: 'center',justifyContent:'center',marginBottom:15,}}>
          <TouchableOpacity onPress={()=>this.verify()} style={{ flex:1,borderRadius:3,borderWidth:1,borderColor:themeColor,height:45,alignItems:'center',justifyContent:'center',marginHorizontal:20,backgroundColor:themeColor}}>
            <Text style={{color:'#fff',fontWeight:'700',fontSize:20,}}>Verify</Text>
          </TouchableOpacity>
      </View>
  )
}

renderHeader=()=>{
  return(
    <View style={{flexDirection: 'row',height:55,alignItems: 'center',}}>
       <TouchableOpacity onPress={()=>this.props.navigation.goBack()} style={{ position:'absolute',left:0,top:0,bottom:0, justifyContent: 'center', alignItems: 'center',width:width*0.15,}}>
         <MaterialIcons name={'keyboard-backspace'} size={30} color={'#000'} />
       </TouchableOpacity>
 </View>
  )
}


resend(){
this.refs.toast.show('request sent!');
if(this.state.screen == 'login'){
 var data = new FormData();
 data.append("id", this.state.username);
 fetch(this.state.url + '/generateOTP/', {
   method: 'POST',
   body: data
 })
   .then((response) => {

     if (response.status == 200) {
       this.setState({ username: this.state.username })
       this.setState({ needOTP: true })
       return true
     }else{
       return false
     }

   })

   .then((responseJson) => {
     if (!responseJson){
       this.refs.toast.show('No user found , Please register');
     }else{
       return
     }
   })
   .catch((error) => {
     this.refs.toast.show(error.toString());
     return
   });
}else{
 var data = new FormData();
 data.append( "mobile", this.state.mobileNo );
 fetch( SERVER_URL + '/api/homepage/registration/', {
   method: 'POST',
   body: data
 })
 .then((response) =>{
   if(response.status == 200 || response.status==201 ){
     var d = response.json()
     this.setState({ needOTP: true })
     return d
   }else{
      this.refs.toast.show('Mobile No Already register with user');
   }
 })
 .then((responseJson) => {
    this.setState({ userPk: responseJson.pk,token:responseJson.token,mobile:responseJson.mobile,username:this.state.mobileNo })
     })
 .catch((error) => {
   return

 });
}

}


verify() {

  var otp = this.state.otp

 if(otp.length < 4){
   this.refs.toast.show('Enter 4 digits OTP');
   return
 }
 this.setState({loadingVisible:true})
  if(this.state.screen == 'login'){
   var data = new FormData();
   data.append("mobile", this.state.username);
   data.append("otp", otp);
   fetch(this.state.url + '/login/?otpMode=True&mode=api', {
     method: 'POST',
     body: data,
     headers: {
     }
   }).then((response) => {
     this.setState({loadingVisible:false})
     console.log(response.status,'llll');
     if (response.status == 200) {
       var sessionid = response.headers.get('set-cookie').split('sessionid=')[1].split(';')[0]
       this.setState({ sessionid: sessionid })
       AsyncStorage.setItem("sessionid", sessionid)
       return response.json()
     }
     else {
       // ToastAndroid.show('Mobile no was incorrect...');
       // this.setState({loadingVisible:false})
       return undefined
     }
   }).then((responseJson) => {
     // console.log(responseJson,'llll');
     // this.setState({ needOTP: false })
     // this.setState({loadingVisible:false})
     // if(responseJson!=undefined){
     //   AsyncStorage.setItem("csrf", responseJson.csrf_token)
     //   AsyncStorage.setItem("user_name", JSON.stringify(this.state.username))
     //   AsyncStorage.setItem("userpk", responseJson.pk+'')
     //   this.setState({ csrf: responseJson.csrf_token })
     //
     //   AsyncStorage.setItem("login", JSON.stringify(true)).then(res => {
     //         return  this.props.navigation.navigate('Home',{
     //           screen:'ProfileScreen'
     //         })
     //     });
     // }else{
     //   this.refs.toast.show('Incorrect OTP');
     // }
     var csrf = responseJson.csrf_token
     var url = this.state.url
     AsyncStorage.setItem("SERVER_URL", this.state.url)
     AsyncStorage.setItem("csrf", responseJson.csrf_token)
     AsyncStorage.setItem("userpk", JSON.stringify(responseJson.pk))
     console.log(responseJson,'kkkkkkkkkkkkkkkkkkkkkkkkkk ');
     console.log('OtpScreen',this.state.sessionid,csrf,responseJson.pk)
     // this.props.navigation.navigate('DefaultScreen')
     // this.props.redirect({serverUrl:url,csrf:responseJson.csrf_token,userPk:JSON.stringify(responseJson.pk),sessionid:this.state.sessionid})
     AsyncStorage.setItem("login", JSON.stringify(true)).then(res => {
      return  this.props.navigation.navigate ('DefaultScreen')
     });
     return
     fetch(this.state.url + '/api/HR/users/?mode=mySelf&format=json', {
       headers: {
         "Cookie" :"csrftoken="+responseJson.csrf_token+";sessionid=" + this.state.sessionid +";",
         'Accept': 'application/json',
         'Content-Type': 'application/json',
         'Referer': this.state.url,
         'X-CSRFToken': responseJson.csrf_token
       },
       method: 'GET'
        })
       .then((response) =>{
         if (response.status !== 200) {
          return;
        }
        else if(response.status == 200){
         return response.json()
        }
      })
   .then((responseJson) => {
     console.log(responseJson,'mode sucesss');
     responseJson[0].csrf = csrf
     responseJson[0].serverUrl  = url
     this.props.setUserDetails(responseJson[0])
     AsyncStorage.setItem("userpk", JSON.stringify(responseJson[0].pk))
     AsyncStorage.setItem("is_staff", JSON.stringify(responseJson[0].is_staff))
     AsyncStorage.setItem("userpic",JSON.stringify(responseJson[0].profile))
     AsyncStorage.setItem('mobile',JSON.stringify(responseJson[0].profile.mobile));
     AsyncStorage.setItem("first_name",JSON.stringify(responseJson[0].first_name))
     AsyncStorage.setItem("last_name",JSON.stringify(responseJson[0].last_name))
     AsyncStorage.setItem("SERVER_URL", this.state.url)
     this.setState({loader:false})
     AsyncStorage.setItem("login", JSON.stringify(true)).then(res => {
           if(responseJson[0].is_staff){
             this.props.navigation.navigate('ScannerScreen')
           }else{
             this.props.navigation.navigate('NavigationScreen')
           }
       });
   })
   .catch((error) => {
     this.setState({loader:false})
     this.refs.toast.show('Incorrect Mobile No');
    });
 })
   .catch((error) => {
     this.setState({loadingVisible:false})
     this.refs.toast.show('Incorrect OTP');
   });
 }else{
   if(this.state.otp == undefined){
     ToastAndroid.show('OTP was incorrect..');
     return
   }else{
     if(this.state.otp.length < 4){
       this.setState({otp:this.state.clipboard})
     }
     var data = new FormData();
     data.append( "token", this.state.token );
     data.append( "mobileOTP", this.state.otp );
     data.append( "mobile", this.state.username );
     data.append( "email", null );
     data.append( "is_staff", 'False');
     data.append( "password", this.state.username );
     data.append( "firstName", this.state.username );
     data.append( "csrf", this.state.csrf );
     fetch( SERVER_URL +'/api/homepage/registration/'+ this.state.userPk+'/', {
       method: 'PATCH',
       body: data
     })
     .then((response) =>{
       this.setState({loadingVisible:false})
       if(response.status == '200' || response.status == '201'){
         var sessionid = response.headers.get('set-cookie').split('sessionid=')[1].split(';')[0]
         AsyncStorage.setItem("sessionid", sessionid)
         this.setState({sessionid:sessionid})
         return response.json()
       }
     })
     .then((responseJson) => {
      AsyncStorage.setItem("csrf", responseJson.csrf)
       var result = responseJson
       AsyncStorage.setItem("user_name", JSON.stringify(this.state.username))
       AsyncStorage.setItem("userpk", JSON.stringify(result.pk))
       AsyncStorage.setItem("login", JSON.stringify(true)).then(res => {
         this.props.navigation.navigate('HomeScreen', {'login':true}, NavigationActions.navigate({ routeName: 'Home' }))
             // return  this.props.navigation.navigate('Home',{
             //   screen:'ProfileScreen'
             // })
         });

       })
     .catch((error) => {
       return
     });
  }
 }

}
  renderSvg=()=>{
    return(
      <View style={{backgroundColor:'transparent',position:'absolute',top:0,left:0,right:0,zIndex:1 }}>
        <Svg height={height*0.8} width={width} viewBox={`0 0 500 150`} preserveAspectRatio="none">
                <Path
                  d="M-7.34,133.52 C151.23,152.27 344.24,154.23 505.07,133.53 L500.00,0.00 L0.00,0.00 Z"
                  fill={'#140730'}
                  stroke={'#140730'}
                />
          </Svg>
      </View>
    )
  }

  focusPrevious=(key, index)=>{
       if (key === 'Backspace' && index !== 0)
           this.otpTextInput[index - 1].focus();
   }

   focusNext=(index, value)=>{
      if (index < this.otpTextInput.length - 1 && value) {
          this.otpTextInput[index + 1].focus();
      }
      if (index === this.otpTextInput.length - 1) {
          this.otpTextInput[index].blur();
      }
      const otp = this.state.otp;
      otp[index] = value;
      this.setState({ otp });
      console.log(this.state.otp,'ggggggggg');
      // this.props.getOtp(otp.join(''));
  }

  renderInputs=()=>{
        const inputs = Array(4).fill(0);
        const txt = inputs.map(
            (i, j) => <View key={j} style={{paddingHorizontal:10}}>
                <TextInput
                    style={[ { height:40,width:40,borderWidth:1,borderColor:'#fff',borderRadius: 10,paddingHorizontal:15,color:'#fff' }]}
                    keyboardType="numeric"
                    selectionColor={'#ffffff'}
                    maxLength={1}
                    onChangeText={v => this.focusNext(j, v)}
                    onKeyPress={e => this.focusPrevious(e.nativeEvent.key, j)}
                    ref={input => { this.otpTextInput[j] = input}}
                />
            </View>
        );
        return txt;
    }

  render(){
     const {navigate} = this.props.navigation;
     if(!this.state.loader){
     return (
        <View style={{flex:1,backgroundColor:'#f2f2f2'}}>
        <Toast style={{backgroundColor: '#000'}} textStyle={{color: '#fff'}} ref="toast" position = 'bottom'/>
          <View style={{height:Constants.statusBarHeight,backgroundColor:'#f2f2f2'}}>
             <StatusBar  translucent={true} barStyle="light-content" backgroundColor={'#f2f2f2'} networkActivityIndicatorVisible={false}    />
          </View>

           <View style={{flex:1,zIndex:2,}}>
               <View style={{flex:1}}>
                 <View style={{flex:0.2,zIndex:2,flexDirection:'row',alignItems:'center',marginHorizontal:30}}>
                    <Image style={{width:width*0.45,height:width*0.25,resizeMode:'contain'}} source={require('./Images/erplogo.png')} />
                 </View>
                 <View style={{flex:0.8,zIndex:2,}}>

                 <View style={{marginVertical:15,marginHorizontal:30,}}>
                    <Text style={{fontWeight: 'bold',fontSize: 25,color:'#000'}}>Login </Text>
                 </View>


                   {
                    // <View style={{marginVertical:15,alignItems:'center'}}>
                    //   <Text style={{fontWeight: 'bold',fontSize: 25,color:'#000'}}> Enter OTP  </Text>
                    //   <Text style={{fontSize: 14,color:'#000',marginTop:5}}> OTP has been sent to +91 {this.state.username} </Text>
                    // </View>
                  }
                   {
                    //  <View style={{marginHorizontal:30,width:width-60,marginVertical:15,}}>
                    //  <View style={{position:'absolute',top:-9,left:20,zIndex:2,backgroundColor:'#f2f2f2'}}>
                    //     <Text style={{fontSize:12,paddingHorizontal:5,color:'#000'}}>Enter OTP</Text>
                    //  </View>
                    //  <TextInput style={{height: 45,borderWidth:1,borderColor:'#000',width:'100%',borderRadius:10,color:'#000',paddingHorizontal:15}}
                    //      placeholder=""
                    //      selectionColor={'#000'}
                    //      onChangeText={query => { this.setState({ otp: query });this.setState({ otp: query }) }}
                    //      value={this.state.otp}
                    //      keyboardType={'numeric'}
                    //   />
                    // </View>
                  }
                    <View style={{marginHorizontal:30,width:width-60,marginVertical:15,}}>
                      <View style={{height: 50,borderWidth:1,borderColor:'#dff0d8',width:'100%',borderRadius:10,backgroundColor:'#dff0d8',paddingHorizontal:15,justifyContent:'center'}}>
                        <Text style={{fontSize:16,color:'#3c763d',fontWeight:'600'}}>OTP Has been sent</Text>
                      </View>
                    </View>

                    <View style={{marginHorizontal:30,width:width-60,marginVertical:15,}}>
                      <TextInput style={{height: 50,borderWidth:1,borderColor:'rgba(0, 0, 0, 0.1)',width:'100%',borderRadius:10,backgroundColor:'rgba(0, 0, 0, 0.1)',paddingHorizontal:15,fontSize:16}}
                          placeholder="Mobile Number"
                          placeholderTextColor='rgba(0, 0, 0, 0.5)'
                          selectionColor={'#000'}
                          onChangeText={query => { this.setState({ mobileNo: query });this.setState({ username: query }) }}
                          value={this.state.username}
                          keyboardType={'numeric'}
                          editable={false}
                       />
                     </View>

                    <View style={{marginHorizontal:30,width:width-60,marginVertical:15,}}>
                      <TextInput style={{height: 50,borderWidth:1,borderColor:'rgba(0, 0, 0, 0.1)',width:'100%',borderRadius:10,backgroundColor:'rgba(0, 0, 0, 0.1)',paddingHorizontal:15,fontSize:16}}
                          placeholder="OTP"
                          placeholderTextColor='rgba(0, 0, 0, 0.5)'
                          selectionColor={'#000'}
                          onChangeText={query => { this.setState({ otp: query });this.setState({ otp: query })  }}
                          value={this.state.otp}
                          keyboardType={'numeric'}
                       />
                     </View>



                  {
                  //   <View style={{flexDirection:'row',marginTop:30}}>
                  //   <Text style={{fontSize: 14,color:'#000',}}> {`Did't receive any code?`}</Text>
                  //   <TouchableOpacity style={{marginLeft:10}} onPress={()=>{this.resend()}}>
                  //     <Text style={{fontSize:16,fontWeight:'700',color:'#000',textDecorationLine: 'underline'}}>RESEND</Text>
                  //   </TouchableOpacity>
                  // </View>
                  }

                  {
                    // <TouchableOpacity onPress={()=>{this.verify()}} style={{backgroundColor:'#3bb3c8',borderRadius:20,paddingVertical:8,paddingHorizontal:20,marginVertical:15}}>
                    // <Text style={{fontSize:16,color:'#fff',fontWeight:'700'}}>Login</Text>
                    // </TouchableOpacity>
                  }

                  <TouchableOpacity onPress={()=>{this.verify()}} style={{alignItems:'center',justifyContent:'center',marginHorizontal:30,width:width-60,borderRadius:10,marginVertical:15,paddingVertical:12,backgroundColor:'#286090'}}>
                    <Text style={{fontSize:18,color:'#fff',fontWeight:'600'}}>Sign In</Text>
                  </TouchableOpacity>

                 </View>
              </View>
           </View>
        </View>
    );
  }else{
    return(
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <ActivityIndicator size="small" color="#0000ff"  />
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
  OtpScreen
}
