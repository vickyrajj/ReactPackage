import React, { Component }  from 'react';
import {
  Image,Platform,ScrollView,StyleSheet,
  Text,TouchableOpacity,View,Slider,
  Dimensions, Alert, FlatList, AppState, BackHandler , AsyncStorage,ActivityIndicator,ToastAndroid,RefreshControl,StatusBar,Vibration,TouchableWithoutFeedback,TextInput,ViewPropTypes
} from 'react-native';
import { FontAwesome,FontAwesome5,MaterialCommunityIcons,Feather,MaterialIcons,Octicons ,AntDesign ,Entypo} from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card ,CheckBox } from 'react-native-elements';
import  ModalBox from 'react-native-modalbox';
import Modal from "react-native-modal";
import {SearchBar}from 'react-native-elements';
import moment from 'moment';
import  { HttpsClient }  from './HttpsClient.js'


import { StackNavigator } from 'react-navigation';
import GradientButton from "react-native-gradient-buttons";
import * as Expo from 'expo';
import * as Permissions from 'expo-permissions';
import Svg, { Circle, Rect,Path,Defs,G,Mask} from 'react-native-svg';
import Toast, {DURATION} from 'react-native-easy-toast';
import PropTypes from 'prop-types';
const { width,height } = Dimensions.get('window');



class ContactCreation extends React.Component{

  static propTypes = {
    ...ViewPropTypes,
    url:PropTypes.string,
    redirect:PropTypes.bool,
    navigateTo:PropTypes.string,
  };
  static defaultProps = {
    url: 'https://klouderp.com',
    redirect:true,
    navigateTo:'ViewNewContract'
  }

    constructor(props) {
      super(props);

      this.state = {
         SERVER_URL:'',
         firstName:'',
         companyName:'',
         phone:'',
         email:'',
         location:'',
         pincode:'',
         companyList:[],
         show:false,
         isSez:false,
         showMore:false,
         selectedCompany:null,
         selectedPincode:null,
         designation:'',
         gstin:'',
         createdoc:false,
         newdoc:false,
         viewContact:[]
      };
      willFocus = props.navigation.addListener(
     'didFocus',
       payload => {

         }
      );
  }

    setUrl=async()=>{
      var SERVER_URL =  await AsyncStorage.getItem('SERVER_URL');
      this.setState({SERVER_URL})
    }

    componentDidMount=()=>{
      console.log(this.props.url,'gkhfkhkofk');
      this.setUrl()
    }

    getCompany=async(text)=>{
      this.setState({ companyName: text,selectedCompany:null })
      if(text.length==0){
        this.setState({companyList:[],show:false,})
        return
      }
      var SERVER_URL =  await AsyncStorage.getItem('SERVER_URL');
      var url = SERVER_URL + '/api/ERP/service/?limit=10&name__icontains='+text
      var data = await HttpsClient.get(url)
      console.log(SERVER_URL + '/api/ERP/service/?limit=10&name__icontains='+text,data);
      if(data.type=='success'){
        console.log(data.data.results,'dfbsbn');
        this.setState({companyList:data.data.results})
        if(data.data.results.length>0){
          this.setState({show:true})
        }else{
          this.setState({show:false})
        }
      }else{
        return
      }
    }

    renderHeader=()=>{
      return(
        <View style={{flexDirection: 'row',height:55,alignItems: 'center',}}>
           <TouchableOpacity onPress={()=>{this.props.navigation.goBack()}} style={{justifyContent: 'center', alignItems: 'center',width:width*0.15,}}>
            <MaterialIcons name="arrow-back" size={24} color="black" />
           </TouchableOpacity>
           <View style={{width:width*0.7,alignItems:'center',justifyContent:'center'}}>
            <Text style={{fontSize:20,color:'#000'}}>Create Contact</Text>
           </View>
           <TouchableOpacity onPress={()=>{this.save()}} style={{justifyContent: 'center', alignItems: 'center',width:width*0.15,}}>
            <MaterialIcons name="check" size={24} color="black" />
           </TouchableOpacity>
       </View>
      )
    }

    changeShowMore=(showMore)=>{
      this.setState({showMore:!showMore})
      var showMore = !showMore
      if(showMore){
        setTimeout(() => {
          this.scrollView.scrollToEnd({ animated: true })
        }, 100)
      }
    }

    save=async()=>{

      if(this.state.firstName.length==0){
        ToastAndroid.showWithGravityAndOffset("Enter Name",ToastAndroid.LONG,ToastAndroid.BOTTOM,25,50);
        return
      }
      if(this.state.phone.length!=10){
        ToastAndroid.showWithGravityAndOffset("Enter Correct Mobile No",ToastAndroid.LONG,ToastAndroid.BOTTOM,25,50);
        return
      }
      if(this.state.email.length==0){
        ToastAndroid.showWithGravityAndOffset("Enter Email",ToastAndroid.LONG,ToastAndroid.BOTTOM,25,50);
        return
      }
      if(this.state.companyName.length==0&&this.state.selectedCompany==null){
        ToastAndroid.showWithGravityAndOffset("Enter Company",ToastAndroid.LONG,ToastAndroid.BOTTOM,25,50);
        return
      }
      if(this.state.selectedPincode==null){
        ToastAndroid.showWithGravityAndOffset("Enter Correct Pincode",ToastAndroid.LONG,ToastAndroid.BOTTOM,25,50);
        return
      }
      var sendData = {
        name:this.state.firstName,
        email:this.state.email,
        mobile:this.state.phone,
        street:this.state.location,
        pincode:this.state.pincode,
        city:this.state.city,
        state:this.state.state,
        country:this.state.country,
        isGst:this.state.isSez,
        company:this.state.companyName
      }
      if(this.state.selectedCompany!=null){
        sendData.company = this.state.selectedCompany
        sendData.companypk = this.state.selectedCompany.pk
      }
      if(this.state.gstin!=null&&this.state.gstin.length>0){
        sendData.gstin = this.state.gstin
      }
      if(this.state.designation.length>0){
        sendData.designation = this.state.designation
      }
      // return
      var url = this.state.SERVER_URL + '/api/clientRelationships/createContact/'
      var data = await HttpsClient.post(url,sendData)
      console.log(sendData,data,'dfbsbn');
      if(data.type=='success'){
        this.setState({viewContact:data.data})
        if(!this.props.redirect){
          this.setState({newdoc:true})
        }else{
          this.props.navigation.goBack()
        }
      }else{
        return
      }

    }


    renderModalCreateDoc=()=>{
      if(this.state.createdoc){
        return(
          <Modal isVisible={this.state.createdoc} propagateSwipe={true}  animationIn="fadeIn" useNativeDriver={true} animationOut="fadeOut" hasBackdrop={true} useNativeDriver={true} propagateSwipe={true} onRequestClose={()=>{this.setState({createdoc:false})}} onBackdropPress={()=>{this.setState({createdoc:false})}} >
              <View style={[styles.modalViewUpdate,{maxHeight:height*0.8,overflow:'hidden',}]}>
              <ScrollView>
              {this.state.createdoc&&this.state.allDocs.length>0&&
                <View style={{borderWidth:1,borderColor:'rgba(0, 0, 0, 0.1)',borderRadius:5,borderTopWidth:0,}}>
                  <View style={{margin:10,}}>
                    <FlatList contentContainerStyle={{borderWidth:0,borderColor:'rgba(0, 0, 0, 0.1)',borderRadius:5,borderTopWidth:0,}}
                    data={this.state.allDocs}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item,index})=>{
                    return(
                      <View style={{marginVertical:4,backgroundColor:'#000',borderRadius:15,borderColor:'#f2f2f2',paddingHorizontal:10,height:40,justifyContent:'center',borderBottomWidth:1,borderColor:'#f2f2f2'}} >
                        <TouchableOpacity onPress={()=>{this.setState({createdoc:false});this.props.navigation.navigate(this.props.navigateTo,{item:item,viewContact:this.state.viewContact})}}>
                          <View  style={{}} >
                            <Text style={{color:'#fff',fontSize:14,fontWeight:'600',}} numberOfLines={2}>{item.heading}</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    )}}
                    />
                  </View>
                </View>
              }
              </ScrollView>
              </View>
            </Modal>
        )
      }else{
        return null
      }
    }

    createDoc=async()=>{
      var url = this.state.SERVER_URL + '/api/clientRelationships/crmtermsAndConditions/'
      var data = await HttpsClient.get(url)
      console.log(data);
      if(data.type=='success'){
        this.setState({allDocs:data.data,createdoc:true})
      }else{
        this.setState({allDocs:[],createdoc:false})
      }
    }

    setCompany=(item)=>{
      this.setState({selectedCompany:item,companyName:item.name,city:item.address.city,country:item.address.country,pincode:item.address.pincode,state:item.address.state,location:item.address.street,gstin:item.tin,companyList:[],show:false,selectedPincode:item.address})

    }

    getPincode=async(query)=>{
      this.setState({ pincode: query });
      if(query.length==6){
        var url = this.state.SERVER_URL + '/api/ERP/genericPincode/?pincode='+query
        var data = await HttpsClient.get(url)
        console.log(data);
        if(data.type=='success'){
          if(data.data.length>0){
            this.setState({city:data.data[0].city,state:data.data[0].state,country:data.data[0].country,pincode:data.data[0].pincode,selectedPincode:data.data[0]})
          }
        }else{
          return
        }
      }else{
        this.setState({city:'',state:'',country:'',selectedPincode:null})
      }
    }

    render(){
        return(
          <View style={{flex:1,backgroundColor:"#f2f2f2"}}>
            <View style={{height:Constants.statusBarHeight,backgroundColor:'#f2f2f2'}}>
               <StatusBar   translucent={true} barStyle="dark-content" backgroundColor={'#f2f2f2'} networkActivityIndicatorVisible={false}    />
            </View>
            {this.renderHeader()}
            {this.renderModalCreateDoc()}

            <View style={{flex:1,}}>
               <ScrollView  ref={(view) => {
                  this.scrollView = view;
                }}>

                 <View style={{marginTop:30,marginHorizontal:25,marginVertical:10,}}>
                  <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>Name</Text>
                  <View style={{flexDirection:'row',}}>
                    <View style={{flex:0.15,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(0, 0, 0, 0.1)',borderTopLeftRadius:10,borderBottomLeftRadius:10,}}>
                      <Feather name="user" size={20} color="black" />
                    </View>
                    <View style={{flex:0.85,alignItems:'center',justifyContent:'center',}}>
                       <TextInput style={{height: 50,borderWidth:1,borderColor:'rgba(0, 0, 0, 0.1)',width:'100%',borderTopRightRadius:10,borderBottomRightRadius:10,backgroundColor:'#fff',paddingHorizontal:15,fontSize:16}}
                           placeholder="Name"
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           selectionColor={'#000'}
                           onChangeText={query => { this.setState({ firstName: query }); }}
                           value={this.state.firstName}
                        />

                    </View>
                  </View>
                </View>

                  <View style={{marginHorizontal:25,marginVertical:10,}}>
                    <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>Mobile</Text>
                    <View style={{flexDirection:'row',}}>
                      <View style={{flex:0.15,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(0, 0, 0, 0.1)',borderTopLeftRadius:10,borderBottomLeftRadius:10,}}>
                        <MaterialIcons name="phone" size={20} color="black" />
                      </View>
                      <View style={{flex:0.85,alignItems:'center',justifyContent:'center',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'rgba(0, 0, 0, 0.1)',width:'100%',borderTopRightRadius:10,borderBottomRightRadius:10,backgroundColor:'#fff',paddingHorizontal:15,fontSize:16}}
                           placeholder="Mobile"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.setState({ phone: query }); }}
                           value={this.state.phone}
                           maxLength={10}
                           keyboardType={'numeric'}
                          />

                      </View>
                    </View>
                  </View>

                  <View style={{marginHorizontal:25,marginVertical:10,}}>
                    <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>Email</Text>
                    <View style={{flexDirection:'row',}}>
                      <View style={{flex:0.15,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(0, 0, 0, 0.1)',borderTopLeftRadius:10,borderBottomLeftRadius:10,}}>
                        <MaterialCommunityIcons name="email-outline" size={22} color="black" />
                      </View>
                      <View style={{flex:0.85,alignItems:'center',justifyContent:'center',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'rgba(0, 0, 0, 0.1)',width:'100%',borderTopRightRadius:10,borderBottomRightRadius:10,backgroundColor:'#fff',paddingHorizontal:15,fontSize:16}}
                           placeholder="Email"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.setState({ email: query }); }}
                           value={this.state.email}
                          />
                      </View>
                    </View>
                  </View>

                  <View style={{marginHorizontal:25,marginVertical:10}}>
                    <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>Company</Text>
                    <View style={{flexDirection:'row',}}>
                      <View style={{flex:0.15,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(0, 0, 0, 0.1)',borderTopLeftRadius:10,borderBottomLeftRadius:10,}}>
                        <FontAwesome5 name="building" size={20} color="black" />
                      </View>
                      <View style={{flex:0.85,alignItems:'center',justifyContent:'center',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'rgba(0, 0, 0, 0.1)',width:'100%',borderTopRightRadius:10,borderBottomRightRadius:this.state.show&&this.state.companyList.length>0?0:10,backgroundColor:'#fff',paddingHorizontal:15,fontSize:16}}
                           placeholder="Company"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.getCompany(query)  }}
                           value={this.state.companyName}
                          />


                      </View>
                    </View>
                    <View style={{flexDirection:'row'}}>
                      <View style={{flex:0.15,}} />
                      <View style={{flex:0.85,}} >
                        {this.state.show&&this.state.companyList.length>0&&
                          <View style={{}}>
                            <View style={{}}>
                              <FlatList contentContainerStyle={{borderWidth:1,borderColor:'rgba(0, 0, 0, 0.1)',borderBottomLeftRadius:5,borderBottomRightRadius:5,borderTopWidth:0,}}
                              data={this.state.companyList}
                              keyExtractor={(item, index) => index.toString()}
                              renderItem={({item,index})=>{
                              return(
                                <View style={{marginVertical:0,backgroundColor:'#fff',borderRadius:5,borderColor:'#f2f2f2',paddingHorizontal:10,height:40,justifyContent:'center'}} >
                                  <TouchableOpacity onPress={()=>{this.setCompany(item)}}>
                                    <View  style={{}} >
                                      <Text style={{color:'#000',fontSize:16,fontWeight:'600'}}>{item.name}</Text>
                                    </View>
                                  </TouchableOpacity>
                                </View>
                              )}}
                              />
                            </View>
                          </View>
                        }
                      </View>
                    </View>
                  </View>



                  <View style={{marginHorizontal:25,marginVertical:10}}>
                    <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>Address</Text>
                    <View style={{flexDirection:'row'}}>
                      <View style={{flex:0.15,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(0, 0, 0, 0.1)',borderTopLeftRadius:10,borderBottomLeftRadius:10,}}>
                        <Octicons name="location" size={20} color="black" />
                      </View>
                      <View style={{flex:0.85,alignItems:'center',justifyContent:'center',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'rgba(0, 0, 0, 0.1)',width:'100%',borderTopRightRadius:10,borderBottomRightRadius:10,backgroundColor:'#fff',paddingHorizontal:15,fontSize:16}}
                           placeholder="Address"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.setState({ location: query }); }}
                           value={this.state.location}
                          />

                      </View>
                    </View>
                  </View>

                  <View style={{marginHorizontal:25,marginVertical:10}}>
                    <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>Pincode</Text>
                    <View style={{flexDirection:'row',}}>
                      <View style={{flex:0.15,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(0, 0, 0, 0.1)',borderTopLeftRadius:10,borderBottomLeftRadius:10,}}>
                        <Octicons name="location" size={20} color="black" />
                      </View>
                      <View style={{flex:0.85,alignItems:'center',justifyContent:'center',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'rgba(0, 0, 0, 0.1)',width:'100%',borderTopRightRadius:10,borderBottomRightRadius:10,backgroundColor:'#fff',paddingHorizontal:15,fontSize:16}}
                           placeholder="Pincode"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.getPincode(query)  }}
                           value={typeof this.state.pincode == 'number'?JSON.stringify(this.state.pincode):this.state.pincode}
                           keyboardType={'numeric'}
                          />

                      </View>
                    </View>
                  </View>
                  {this.state.selectedPincode!=null&&
                    <View style={{marginHorizontal:25,marginVertical:15}}>
                      <Text style={{color:'rgba(0, 0, 0, 0.7)',fontSize:18}}>{this.state.city} {this.state.state} {this.state.country}</Text>
                    </View>

                  }

                  <View style={{flexDirection:'row',marginHorizontal:25,marginVertical:15,marginBottom:0,marginLeft:10}}>
                    <CheckBox
                      center
                      title='SEZ Customer'
                      containerStyle={{backgroundColor:'#f2f2f2',borderColor:'#f2f2f2',margin:0,paddingVertical:0}}
                      checked={this.state.isSez}
                      checkedColor={'green'}
                      onPress={() => this.setState({isSez: !this.state.isSez})}
                    />
                  </View>

                  <TouchableOpacity style={{marginHorizontal:25,paddingTop:20,paddingBottom:10}} onPress={()=>{this.changeShowMore(this.state.showMore) }}>
                    <Text style={{color:'#306f8a',fontSize:15}}>{this.state.showMore?'Show Less':'Show More'}</Text>
                  </TouchableOpacity>

                  {this.state.showMore&&
                    <View>
                      <View style={{marginHorizontal:25,marginVertical:10,}}>
                       <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>GSTIN</Text>
                        <View style={{flexDirection:'row',}}>
                          <View style={{flex:0.15,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(0, 0, 0, 0.1)',borderTopLeftRadius:10,borderBottomLeftRadius:10,}}>
                            <AntDesign name="paperclip" size={20} color="black" />
                          </View>
                          <View style={{flex:0.85,alignItems:'center',justifyContent:'center',}}>
                             <TextInput style={{height: 50,borderWidth:1,borderColor:'rgba(0, 0, 0, 0.1)',width:'100%',borderTopRightRadius:10,borderBottomRightRadius:10,backgroundColor:'#fff',paddingHorizontal:15,fontSize:16}}
                               placeholder="GSTIN"
                               selectionColor={'#000'}
                               placeholderTextColor='rgba(0, 0, 0, 0.5)'
                               onChangeText={query => { this.setState({ gstin: query }); }}
                               value={this.state.gstin}
                              />
                          </View>
                        </View>
                      </View>

                      <View style={{marginHorizontal:25,marginVertical:10,marginBottom:30}}>
                        <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>Designation</Text>
                        <View style={{flexDirection:'row',}}>
                          <View style={{flex:0.15,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(0, 0, 0, 0.1)',borderTopLeftRadius:10,borderBottomLeftRadius:10,}}>
                            <Entypo name="briefcase" size={20} color="black" />
                          </View>
                          <View style={{flex:0.85,alignItems:'center',justifyContent:'center',}}>
                             <TextInput style={{height: 50,borderWidth:1,borderColor:'rgba(0, 0, 0, 0.1)',width:'100%',borderTopRightRadius:10,borderBottomRightRadius:10,backgroundColor:'#fff',paddingHorizontal:15,fontSize:16}}
                               placeholder="Designation"
                               selectionColor={'#000'}
                               placeholderTextColor='rgba(0, 0, 0, 0.5)'
                               onChangeText={query => { this.setState({ designation: query }); }}
                               value={this.state.designation}
                              />
                          </View>
                        </View>
                      </View>
                    </View>
                  }
               </ScrollView>
               {this.state.newdoc&&
               <View>
               {this.renderFooter()}
               </View>}
            </View>
          </View>
      );
    }
    renderFooter=()=>{
      return(
        <View style={{height:50,position:'absolute',bottom:0,left:0,right:0}}>
          <TouchableOpacity onPress={()=>{this.createDoc();}} style={{flex:1,justifyContent: 'center', alignItems: 'center',backgroundColor:'#CD0000'}}>
            <Text style={{color:'#fff',fontWeight:'700',fontSize:18}}>Create Documents</Text>
          </TouchableOpacity>
       </View>
      )
    }
  }

  const styles = StyleSheet.create({
     container: {
       flex: 1,
     },
     shadow: {
       shadowColor: "#000",
       shadowOffset: {
         width: 0,
         height: 2,
       },
       shadowOpacity: 0.25,
       shadowRadius: 3.84,
       elevation: 0,
       borderColor:'#fff'
     },
     center:{
       alignItems:'center',
       justifyContent:'center'
     },
     iconStyle:{
       width:width*0.2,
       height:width*0.15,
       resizeMode:'contain'
     },
     iconContainer:{
       width: width*0.3,height:width*0.3,margin:0,padding:15,marginHorizontal:0,borderRadius:10,
     },
     iconText:{
       fontWeight:'700',color:'#444',fontSize:18,marginVertical:5
     },
     modalViewUpdate: {
       backgroundColor: '#fff',
       marginHorizontal: width*0.05 ,
       borderRadius:5,
    },

   });

  export default ContactCreation
