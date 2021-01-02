
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

class LoginScreen extends Component {

    constructor(props) {
      super(props);
      this.state = {
          needOTP : false,
          username:'',
          sessionid:'',
          name:'',
          token:'',
          loginname:'',
          password:'',
          url:props.url,
          loader:false,
          mobileNo:'',
      }
      Keyboard.addListener('keyboardDidHide',this.showKeyboard)
      Keyboard.addListener('keyboardDidShow', this.hideKeyboard)
    }

    showKeyboard =()=>{
      this.setState({keyboardOpen : false})
      this.setState({scrollHeight:this.state.scrollHeight+500})
      setTimeout(()=> {
        if (this.refs == undefined || this.refs._scrollView == undefined || this.refs._scrollView.scrollToEnd == undefined) {
          return
        }
        this.refs._scrollView.scrollToEnd({animated: true});
      }, 500);
    }

    hideKeyboard =(e)=>{
      this.setState({keyboardOpen : true})
      this.setState({keyboardHeight:e.endCoordinates.height+30});
      try {
        this.setState({scrollHeight:this.state.scrollHeight-500})
      } catch (e) {} finally {}
      setTimeout(()=> {
        if (this.refs == undefined || this.refs._scrollView == undefined || this.refs._scrollView.scrollToEnd == undefined) {
          return
        }
        this.refs._scrollView.scrollToEnd({animated: true});
        }, 500);
    }

    componentDidMount(){

    }

    getOtp() {
       if(this.state.mobileNo == undefined){
         this.refs.toast.show('Mobile no was incorrect ');
       }
       else{
         var data = new FormData();
         data.append( "mobile", this.state.mobileNo );
         fetch( this.state.url + '/api/homepage/registration/', {
           method: 'POST',
           body: data
         }).then((response)=>{
           if(response.status == 200 || response.status==201 ){
             var d = response.json()
             return d
           }else{
             this.refs.toast.show('Mobile No Already register with user ');
           }
         })
         .then((responseJson) => {
            // this.setState({ userPk: responseJson.pk,token:responseJson.token,mobile:responseJson.mobile,username:this.state.mobile });
            // AsyncStorage.setItem("userpk", responseJson.pk + '')
            // this.props.navigation.navigate('OtpScreen',{
            //   username:this.state.mobileNo,
            //   screen:'',
            //   userPk:responseJson.pk,
            //   token:responseJson.token,
            //   mobile:responseJson.mobileNo,
            //   csrf:responseJson.csrf,
            //   url:this.state.url,
            //   mobileOTP:'',
            // });
          })
         .catch((error) => {
           return
         });
       }
   }

    sendOtp() {
    var mob = /^[1-9]{1}[0-9]{9}$/;
    if (this.state.mobileNo == undefined || mob.test(this.state.mobileNo) == false) {
      this.refs.toast.show('Enter Correct Mobile No');
    } else {
      this.refs.toast.show('OTP request sent.');
      var data = new FormData();
      data.append("id", this.state.mobileNo);
      fetch(this.state.url + '/generateOTP/?mobile='+this.state.mobileNo, {
        method: 'GET',
      })
        .then((response) => {
          if (response.status == 200) {
            this.setState({ username: this.state.mobileNo })
            return true
          }else{
            return false
          }
        })
        .then((responseJson) => {
          if (!responseJson){
            this.getOtp()
          }else{
            this.props.sendOtp()
            return
          }
        })
        .catch((error) => {
          this.refs.toast.show(error.toString());
          return
        });
    }
}


    logIn(){
        this.setState({loader:true})
        var serverURL = this.state.url;
        if(this.state.needOTP == false){
          var data = new FormData();
           data.append( "username", this.state.username );
           data.append( "password", this.state.otp );
           fetch(this.state.url + '/login/?mode=api', {
             method: 'POST',
             body: data,
             headers : {
             }
           })
           .then((response) =>{
           if (response.status == 200){
             var sessionid = response.headers.get('set-cookie').split(';')[0].split('=')[1]
             this.setState({sessionid:sessionid})
             AsyncStorage.setItem("sessionid", JSON.stringify(sessionid))
             return response.json()
           }else{
             ToastAndroid.show('Incorrect Username or Password', ToastAndroid.SHORT);
             return
           }})
           .then((responseJson) => {
             var csrf = responseJson.csrf_token
             var url = this.state.url
             AsyncStorage.setItem("SERVER_URL", this.state.url)
             AsyncStorage.setItem("csrf", responseJson.csrf_token)
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
         })
         .catch((error) => {
           this.setState({loader:false})
           ToastAndroid.show('Incorrect Username or Password', ToastAndroid.SHORT);
         });
       }else{
         var data = new FormData();
         data.append( "username", this.state.username );
         data.append( "otp", this.state.otp );
         fetch(this.state.url + '/login/?otpMode=True&mode=api', {
           method: 'POST',
           body: data,
           headers : {
           }
         })
         .then((response) =>{
           console.log(response.status, 'otpmode login');
           if (response.status == 200){
             var sessionid = response.headers.get('set-cookie').split(';')[0].split('=')[1]

             this.setState({sessionid:sessionid})
             AsyncStorage.setItem("sessionid", sessionid)
             return response.json()
           }
           else{
             ToastAndroid.show('Mobile no was incorrect...', ToastAndroid.SHORT);
           }})
           .then((responseJson) => {
             // console.log(responseJson.csrf_token,'kkkkkkkkkkkkkkkkkkkkkkkkkk');
             AsyncStorage.setItem("csrf", responseJson.csrf_token)
             AsyncStorage.setItem("SERVER_URL", this.state.url)
             console.log(AsyncStorage.setItem("SERVER_URL", this.state.url),'url');
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
                   ToastAndroid.show(' no was incorrect...', ToastAndroid.SHORT);
                 }
                 else if(response.status == 200){
                   return response.json()
                 }
               })
               .then((responseJson) => {
                 console.log(responseJson,'mode sucesss');
                 this.setState({needOTP:false})
                 AsyncStorage.setItem("userpk", JSON.stringify(responseJson[0].pk))

                 AsyncStorage.setItem("SERVER_URL", this.state.url)
                 console.log(this.state.url,'urllllllll');
                 AsyncStorage.setItem("login", JSON.stringify(true)).then(res => {
                 return  this.props.navigation.navigate('Main',{sendurl:this.state.url});
             });
           })
         })
         .catch((error) => {
           ToastAndroid.show('Incorrect OTP', ToastAndroid.SHORT);
         });
       }
   }

   askDelete=(index)=>{
     Alert.alert(
        'Delete Invoice',
        'Do you want to Delete?',
        [
          {text: 'Cancel', onPress: () => {
            return null
          }},
          {text: 'Confirm', onPress: () => {
             var invoice = this.state.invoice
             invoice.splice(index,1)
             this.setState({invoice:invoice})
           }},
      ],
      { cancelable: false }
    )
   }

  submit() {
    this.props.navigation.navigate('Tab')
    // fetch('http://192.168.1.6:8000/login', {
    //   method: 'POST',
    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     username: this.state.username,
    //     password: this.state.password,
    //   }),
    // }).then((response) => response.json())
    //     .then((responseJson) => {
    //     Alert.alert('here')
    //     this.props.navigation.navigate('Tab')
    //     })
    //     .catch((error) => {
    //       console.error(error);
    //     });
  }

  renderSvg=()=>{
    return(
      <View style={{backgroundColor:'transparent',position:'absolute',top:0,left:0,right:0,zIndex:1 }}>
        <Svg height={height*0.8} width={width} viewBox={`0 0 500 150`} preserveAspectRatio="none">
                <Path
                  d="M-7.34,133.52 C151.23,152.27 344.24,154.23 505.07,133.53 L500.00,0.00 L0.00,0.00 Z"
                  fill={'#f2f2f2'}
                  stroke={'#f2f2f2'}
                />
          </Svg>
      </View>
    )
  }

  render(){
     const {navigate} = this.props.navigation;
     if(!this.state.loader){
     return (
        <View style={{flex:1,backgroundColor:'#f2f2f2',}}>
        <Toast style={{backgroundColor: '#000'}} textStyle={{color: '#fff'}} ref="toast" position = 'bottom'/>
          <View style={{height:Constants.statusBarHeight,backgroundColor:'#3bb3c8'}}>
             <StatusBar  translucent={true} barStyle="light-content" backgroundColor={'#3bb3c8'} networkActivityIndicatorVisible={false}  />
         </View>

           <View style={{flex:1,zIndex:2,}}>
               <View style={{flex:1}}>
                 <View style={{flex:0.9,zIndex:2,alignItems:'center',justifyContent:'center'}}>

                   <View style={{marginVertical:15,alignItems:'center'}}>
                      <Text style={{fontWeight: 'bold',fontSize: 25,color:'#000'}}> Welcome back ! </Text>
                      <Text style={{fontSize: 14,color:'#000',marginTop:5}}> Great To See You Again </Text>
                   </View>

                   <View style={{marginHorizontal:30,width:width-60,marginVertical:15,}}>
                     <View style={{position:'absolute',top:-9,left:20,zIndex:2,backgroundColor:'#f2f2f2'}}>
                        <Text style={{fontSize:12,paddingHorizontal:5,color:'#000'}}>Enter your mobile no</Text>
                     </View>
                     <TextInput style={{height: 45,borderWidth:1,borderColor:'#000',width:'100%',borderRadius:10,color:'#000',paddingHorizontal:15}}
                         placeholder=""
                         selectionColor={'#000'}
                         onChangeText={query => { this.setState({ mobileNo: query });this.setState({ username: query }) }}
                         value={this.state.mobileNo}
                         keyboardType={'numeric'}
                      />
                    </View>

                    <TouchableOpacity onPress={()=>{this.sendOtp()}} style={{backgroundColor:'#3bb3c8',borderRadius:20,paddingVertical:8,paddingHorizontal:20,marginVertical:15}}>
                      <Text style={{fontSize:16,color:'#fff',fontWeight:'700'}}>Send OTP</Text>
                    </TouchableOpacity>

                 </View>
               </View>
           </View>
        </View>
    );
  }else{
    return(
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <ActivityIndicator size="small" color="#3bb3c8" />
      </View>
    )
  }
}
}

LoginScreen.propTypes = {
  url:PropTypes.string,
  sendOtp: PropTypes.func.isRequired,
};

LoginScreen.defaultProps = {
  url: 'https://klouderp.com',
};


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


export default LoginScreen



  // You can declare that a prop is a specific JS primitive. By default, these
  // are all optional.
  // needOTP : PropTypes.bool,
  // username:PropTypes.string,
  // loader:PropTypes.bool,

  // optionalArray: PropTypes.array,
  // optionalBool: PropTypes.bool,
  // optionalFunc: PropTypes.func,
  // optionalNumber: PropTypes.number,
  // optionalObject: PropTypes.object,
  // optionalString: PropTypes.string,
  // optionalSymbol: PropTypes.symbol,

  // Anything that can be rendered: numbers, strings, elements or an array
  // (or fragment) containing these types.
  // optionalNode: PropTypes.node,

  // A React element (ie. <MyComponent />).
  // optionalElement: PropTypes.element,

  // A React element type (ie. MyComponent).
  // optionalElementType: PropTypes.elementType,

  // You can also declare that a prop is an instance of a class. This uses
  // JS's instanceof operator.
  // optionalMessage: PropTypes.instanceOf(Message),

  // You can ensure that your prop is limited to specific values by treating
  // it as an enum.
  // optionalEnum: PropTypes.oneOf(['News', 'Photos']),

  // An object that could be one of many types
  // optionalUnion: PropTypes.oneOfType([
  //   PropTypes.string,
  //   PropTypes.number,
  //   PropTypes.instanceOf(Message)
  // ]),

  // An array of a certain type
  // optionalArrayOf: PropTypes.arrayOf(PropTypes.number),

  // An object with property values of a certain type
  // optionalObjectOf: PropTypes.objectOf(PropTypes.number),

  // You can chain any of the above with `isRequired` to make sure a warning
  // is shown if the prop isn't provided.

  // An object taking on a particular shape
  // optionalObjectWithShape: PropTypes.shape({
  //   optionalProperty: PropTypes.string,
  //   requiredProperty: PropTypes.number.isRequired
  // }),

  // An object with warnings on extra properties
  // optionalObjectWithStrictShape: PropTypes.exact({
  //   optionalProperty: PropTypes.string,
  //   requiredProperty: PropTypes.number.isRequired
  // }),

  // requiredFunc: PropTypes.func.isRequired,

  // A value of any data type
  // requiredAny: PropTypes.any.isRequired,

  // You can also specify a custom validator. It should return an Error
  // object if the validation fails. Don't `console.warn` or throw, as this
  // won't work inside `oneOfType`.
  // customProp: function(props, propName, componentName) {
  //   if (!/matchme/.test(props[propName])) {
  //     return new Error(
  //       'Invalid prop `' + propName + '` supplied to' +
  //       ' `' + componentName + '`. Validation failed.'
  //     );
  //   }
  // },

  // You can also supply a custom validator to `arrayOf` and `objectOf`.
  // It should return an Error object if the validation fails. The validator
  // will be called for each key in the array or object. The first two
  // arguments of the validator are the array or object itself, and the
  // current item's key.
  // customArrayProp: PropTypes.arrayOf(function(propValue, key, componentName, location, propFullName) {
  //   if (!/matchme/.test(propValue[key])) {
  //     return new Error(
  //       'Invalid prop `' + propFullName + '` supplied to' +
  //       ' `' + componentName + '`. Validation failed.'
  //     );
  //   }
  // })

  // {
  //   "presets": ["module:metro-react-native-babel-preset"]
  // }
