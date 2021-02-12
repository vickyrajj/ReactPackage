import React from 'react';
import {
  Image,Platform,ScrollView,StyleSheet,
  Text,TouchableOpacity,View,Slider,
  Dimensions, Alert, FlatList, AppState, BackHandler , AsyncStorage,ActivityIndicator,ToastAndroid,RefreshControl,StatusBar,Vibration,TouchableWithoutFeedback,TextInput,ViewPropTypes
} from 'react-native';
import { FontAwesome,FontAwesome5,MaterialCommunityIcons,Feather,MaterialIcons,Octicons ,AntDesign ,Entypo} from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { StackNavigator } from 'react-navigation';
import { Card ,CheckBox } from 'react-native-elements';
import  ModalBox from 'react-native-modalbox';
import Modal from "react-native-modal";
import {SearchBar}from 'react-native-elements';
import moment from 'moment';
import  { HttpsClient }  from './HttpsClient.js';
import PropTypes from 'prop-types';

const { width,height } = Dimensions.get('window');

export default class ViewNewContract extends React.Component{

    static propTypes = {
      ...ViewPropTypes,
      url:PropTypes.string,
      viewContact:PropTypes.array,
      item:PropTypes.object,
      navigateTo:PropTypes.string,
    };
    static defaultProps = {
      url: 'https://klouderp.com',
      viewContact: [],
      item: null,
      navigateTo:'NavigationScreen'
    }

    constructor(props) {
      super(props);

      this.state = {
         SERVER_URL:'',
         item:this.props.item,
         viewContact:this.props.viewContact,
         contract:null,
         productList:[],
         termsAndCondition:this.props.item.body.split('||'),//termsAndCondition:data.data.termsAndConditionTxts.split('||')
         company:this.props.viewContact.company,
         showModal:false,
         name:'',
         serialNo:'',
         scheduleType:'Quaterly',
         noOfMaintance:1,
         date:moment(new Date()).format('YYYY-MM-DD'),
         notes:'',
         isSeparateAddress:false,
         address:'',
         pincode:'',
         city:'',
         state:'',
         country:'',
         selectedPincode:null,
         hsnCode:'',
         description:'',
         rate:'',
         quantity:'',
         showProducts:false,
         productSuggestion:[],
         selectedProduct:null,
         selectedProductMeta:null,
         productMetaList:[],
         editProduct:null,
         createdoc:false,
         allDocs:[]
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
      // this.getContract()
    }

    getContract=async(query)=>{
      var url = this.state.SERVER_URL + '/api/clientRelationships/contract/'+this.state.item.pk+'/'
      var data = await HttpsClient.get(url)
      if(data.type=='success'){
        console.log(data.data,'dsahbfb');
        this.setState({contract:data.data,productList:JSON.parse(data.data.data),termsAndCondition:data.data.termsAndConditionTxts.split('||'),company:data.data.contact.company})
      }else{
        return
      }
    }

    componentDidMount=()=>{
      console.log(this.state.item,'gfjbgfkfgflh');
      this.setUrl()
    }

    createProduct=async()=>{
      if(this.state.editProduct){
      var url = this.state.SERVER_URL + '/api/clientRelationships/contract/'+this.state.viewContact.pk+'/'
      if(this.state.description.length==0){
        ToastAndroid.showWithGravityAndOffset("Enter Description",ToastAndroid.LONG,ToastAndroid.BOTTOM,25,50);
        return
      }
      if(this.state.hsnCode.length==0){
        ToastAndroid.showWithGravityAndOffset("Enter HSN/SAC Code",ToastAndroid.LONG,ToastAndroid.BOTTOM,25,50);
        return
      }
      if(this.state.rate.length==0){
        ToastAndroid.showWithGravityAndOffset("Enter Rate",ToastAndroid.LONG,ToastAndroid.BOTTOM,25,50);
        return
      }
      if(this.state.quantity.length==0){
        ToastAndroid.showWithGravityAndOffset("Enter Quantity",ToastAndroid.LONG,ToastAndroid.BOTTOM,25,50);
        return
      }
      if(this.state.selectedProductMeta==null){
        ToastAndroid.showWithGravityAndOffset("Please search and select HSN/SAC Code",ToastAndroid.LONG,ToastAndroid.BOTTOM,25,50);
        return
      }
      // console.log(this.state.selectedProductMeta,'this.state.selectedProductMeta');
      // return
      var productData = this.state.productList
      var obj = {
        currency:'INR',
        desc:this.state.description,
        quantity:this.state.quantity,
        rate:this.state.rate,
        saleType:'Product',
        total:Number(this.state.quantity)*Number(this.state.rate),
        type:'',
        onetime:'',
        extraFieldOne:'',
        extraFieldTwo:'',
        subtotal:(Number(this.state.quantity)*Number(this.state.rate))+(((Number(this.state.quantity)*Number(this.state.rate))*this.state.selectedProductMeta.taxRate)/100),
        totalTax:((Number(this.state.quantity)*Number(this.state.rate))*this.state.selectedProductMeta.taxRate)/100,
        tax:this.state.selectedProductMeta.taxRate,
        taxCode:this.state.selectedProductMeta.code,
        editIndex:null
      }
      if(this.state.editProduct!=null){
        productData[this.state.editIndex] = obj
      }else{
        productData.push(obj)
      }
      var grandTotal = productData.reduce((a,b)=>{
        return a+(b.subtotal)
      },0)
      var sendData = {
        data:JSON.stringify(productData),
        grandTotal: grandTotal,
        value: grandTotal,
        contact:this.state.viewContact.pk,
        discount:0,
        heading:this.state.item.heading,
        termsAndCondition:this.state.item.pk,
        termsAndConditionTxts:this.state.item.body
      }
      // console.log(sendData,'gsfdgfd');
      // return
      console.log(sendData,'sendData');
      var data = await HttpsClient.patch(url,sendData)
      console.log(data,'fdjgkdn',sendData);
      if(data.type=='success'){
        this.getContract()
        this.setState({showModal:false})
      }else{
        return
      }
    }else{
      var url = this.state.SERVER_URL + '/api/clientRelationships/contract/'
      var productData = this.state.productList
      if(this.state.showModal){
      if(this.state.description.length==0){
        ToastAndroid.showWithGravityAndOffset("Enter Description",ToastAndroid.LONG,ToastAndroid.BOTTOM,25,50);
        return
      }
      if(this.state.hsnCode.length==0){
        ToastAndroid.showWithGravityAndOffset("Enter HSN/SAC Code",ToastAndroid.LONG,ToastAndroid.BOTTOM,25,50);
        return
      }
      if(this.state.rate.length==0){
        ToastAndroid.showWithGravityAndOffset("Enter Rate",ToastAndroid.LONG,ToastAndroid.BOTTOM,25,50);
        return
      }
      if(this.state.quantity.length==0){
        ToastAndroid.showWithGravityAndOffset("Enter Quantity",ToastAndroid.LONG,ToastAndroid.BOTTOM,25,50);
        return
      }
      if(this.state.selectedProductMeta==null){
        ToastAndroid.showWithGravityAndOffset("Please search and select HSN/SAC Code",ToastAndroid.LONG,ToastAndroid.BOTTOM,25,50);
        return
      }

      // console.log(this.state.selectedProductMeta,'this.state.selectedProductMeta');
      // return

      var obj = {
        currency:'INR',
        desc:this.state.description,
        quantity:this.state.quantity,
        rate:this.state.rate,
        saleType:'Product',
        total:Number(this.state.quantity)*Number(this.state.rate),
        type:'',
        onetime:'',
        extraFieldOne:'',
        extraFieldTwo:'',
        subtotal:(Number(this.state.quantity)*Number(this.state.rate))+(((Number(this.state.quantity)*Number(this.state.rate))*this.state.selectedProductMeta.taxRate)/100),
        totalTax:((Number(this.state.quantity)*Number(this.state.rate))*this.state.selectedProductMeta.taxRate)/100,
        tax:this.state.selectedProductMeta.taxRate,
        taxCode:this.state.selectedProductMeta.code,
        editIndex:null
      }
      if(this.state.editProduct!=null){
        productData[this.state.editIndex] = obj
      }else{
        productData.push(obj)
      }

      var grandTotal = productData.reduce((a,b)=>{
        return a+(b.subtotal)
      },0)

      }
      var sendData = {
        data:JSON.stringify(productData),
        grandTotal: grandTotal,
        value: grandTotal,
        contact:this.state.viewContact.pk,
        discount:0,
        heading:this.state.item.heading,
        termsAndCondition:this.state.item.pk,
        termsAndConditionTxts:this.state.item.body
      }
      // console.log(sendData,'gsfdgfd');
      // return
      console.log(sendData,'sendData');
      var data = await HttpsClient.post(url,sendData)
      console.log(data,'fdjgkdn',);
      if(data.type=='success'){
        this.getContract()
        this.setState({showModal:false})
        this.props.redirectPageTo()
        // this.props.navigation.navigate('NavigationScreen')
      }else{
        return
      }
    }
    }

    setModalShow=()=>{
      this.setState({showModal:true,editProduct:null,hsnCode:'',description:'', rate:'', quantity:'', showProducts:false, productSuggestion:[], selectedProduct:null, selectedProductMeta:null, productMetaList:[], editProduct:null,})


    }

    renderHeader=()=>{
      return(
        <View style={{flexDirection: 'row',height:55,alignItems: 'center',}}>
           <TouchableOpacity onPress={()=>{this.props.navigation.goBack()}} style={{justifyContent: 'center', alignItems: 'center',width:width*0.15,}}>
            <MaterialIcons name="arrow-back" size={24} color="black" />
           </TouchableOpacity>
           <View style={{width:width*0.55,justifyContent:'center'}}>
            <Text style={{fontSize:20,color:'#000'}}>{this.state.item.heading}</Text>
           </View>
           {
           <TouchableOpacity onPress={()=>{this.createProduct()}} style={{justifyContent: 'center', alignItems: 'center',width:width*0.3,}}>
              <MaterialIcons name="check" size={24} color="black" />
           </TouchableOpacity>
           }
        </View>
      )
    }

   setProductMeta=(item)=>{
     this.setState({selectedProductMeta:item,hsnCode:item.description,showProducts:false,showProductMeta:false})
   }

  renderModal=()=>{
    if(this.state.showModal){
      return(
        <Modal isVisible={this.state.showModal} propagateSwipe={true}  animationIn="fadeIn" useNativeDriver={true} animationOut="fadeOut" hasBackdrop={true} useNativeDriver={true} propagateSwipe={true} onRequestClose={()=>{this.setState({showModal:false})}} onBackdropPress={()=>{this.setState({showModal:false})}} >
            <View style={[styles.modalViewUpdate,{maxHeight:height*0.8,overflow:'hidden',}]}>
            <ScrollView>
              <View style={{padding:10}}>
                <Text style={{color:'#000',fontWeight:'700',fontSize:18}}>{this.state.editProduct!=null?'Edit':'Add'} Product</Text>
                <View style={{paddingVertical:10}}>
                  <Text style={{color:'#000',fontWeight:'600',fontSize:14,paddingBottom:5}}>Description</Text>
                  <TextInput style={{height: 40,borderWidth:1,borderColor:'rgba(0, 0, 0, 0.1)',width:'100%',borderRadius:5,backgroundColor:'#fff',paddingHorizontal:15,fontSize:16}}
                      placeholder="Description"
                      placeholderTextColor='rgba(0, 0, 0, 0.5)'
                      selectionColor={'#000'}
                      onChangeText={query => { this.getInventory(query)  }}
                      value={this.state.description}
                   />
                   {this.state.showProducts&&this.state.productSuggestion.length>0&&
                     <View style={{}}>
                       <View style={{}}>
                         <FlatList contentContainerStyle={{borderWidth:1,borderColor:'rgba(0, 0, 0, 0.1)',borderRadius:5,borderTopWidth:0,}}
                         data={this.state.productSuggestion}
                         keyExtractor={(item, index) => index.toString()}
                         renderItem={({item,index})=>{
                         return(
                           <View style={{marginVertical:0,backgroundColor:'#fff',borderRadius:5,borderColor:'#f2f2f2',paddingHorizontal:10,height:40,justifyContent:'center',borderBottomWidth:1,borderColor:'#f2f2f2'}} >
                             <TouchableOpacity onPress={()=>{this.setSelectedProduct(item)}}>
                               <View  style={{}} >
                                 <Text style={{color:'#000',fontSize:14,fontWeight:'600'}} numberOfLines={2}>{item.name}</Text>
                               </View>
                             </TouchableOpacity>
                           </View>
                         )}}
                         />
                       </View>
                     </View>
                   }
                </View>
                <View style={{paddingVertical:10}}>
                  <Text style={{color:'#000',fontWeight:'600',fontSize:14,paddingBottom:5}}>HSN/SAC Code</Text>
                  <TextInput style={{height: 40,borderWidth:1,borderColor:'rgba(0, 0, 0, 0.1)',width:'100%',borderRadius:5,backgroundColor:'#fff',paddingHorizontal:15,fontSize:16}}
                      placeholder="HSN/SAC Code"
                      placeholderTextColor='rgba(0, 0, 0, 0.5)'
                      selectionColor={'#000'}
                      onChangeText={query => { this.getProductMeta(query) }}
                      value={this.state.hsnCode}
                   />
                   {this.state.showProductMeta&&this.state.productMetaList.length>0&&
                     <View style={{}}>
                       <View style={{}}>
                         <FlatList contentContainerStyle={{borderWidth:1,borderColor:'rgba(0, 0, 0, 0.1)',borderRadius:5,borderTopWidth:0,}}
                         data={this.state.productMetaList}
                         keyExtractor={(item, index) => index.toString()}
                         renderItem={({item,index})=>{
                         return(
                           <View style={{marginVertical:0,backgroundColor:'#fff',borderRadius:5,borderColor:'#f2f2f2',paddingHorizontal:10,height:40,justifyContent:'center',borderBottomWidth:1,borderColor:'#f2f2f2'}} >
                             <TouchableOpacity onPress={()=>{this.setProductMeta(item)}}>
                               <View  style={{}} >
                                 <Text style={{color:'#000',fontSize:14,fontWeight:'600'}} numberOfLines={2}>{item.description}</Text>
                               </View>
                             </TouchableOpacity>
                           </View>
                         )}}
                         />
                       </View>
                     </View>
                   }
                </View>
                <View style={{paddingVertical:10}}>
                  <Text style={{color:'#000',fontWeight:'600',fontSize:14,paddingBottom:5}}>Rate</Text>
                  <TextInput style={{height: 40,borderWidth:1,borderColor:'rgba(0, 0, 0, 0.1)',width:'100%',borderRadius:5,backgroundColor:'#fff',paddingHorizontal:15,fontSize:16}}
                      placeholder="Rate"
                      placeholderTextColor='rgba(0, 0, 0, 0.5)'
                      selectionColor={'#000'}
                      onChangeText={query => { this.setState({ rate: query }); }}
                      value={typeof this.state.rate=='number'?JSON.stringify(this.state.rate):this.state.rate}
                      keyboardType={'numeric'}
                   />
                </View>
                <View style={{paddingVertical:10}}>
                  <Text style={{color:'#000',fontWeight:'600',fontSize:14,paddingBottom:5}}>Quantity</Text>
                  <TextInput style={{height: 40,borderWidth:1,borderColor:'rgba(0, 0, 0, 0.1)',width:'100%',borderRadius:5,backgroundColor:'#fff',paddingHorizontal:15,fontSize:16}}
                      placeholder="Quantity"
                      placeholderTextColor='rgba(0, 0, 0, 0.5)'
                      selectionColor={'#000'}
                      onChangeText={query => { this.setState({ quantity: query }); }}
                      value={typeof this.state.quantity=='number'?JSON.stringify(this.state.quantity):this.state.quantity}
                      keyboardType={'numeric'}
                   />
                </View>
                <View style={{paddingVertical:10}}>
                 <TouchableOpacity onPress={()=>{this.createProduct()}} style={{backgroundColor:'#000',alignItems:'center',justifyContent:'center',height:40,borderRadius:5}}>
                   <Text style={{color:'#fff',fontSize:18}}>{this.state.editProduct!=null?'Save':'Add'}</Text>
                 </TouchableOpacity>
               </View>
              </View>
            </ScrollView>
            </View>
          </Modal>
      )
    }else{
      return null
    }
  }




  getInventory=async(query)=>{
    this.setState({ description: query,selectedProduct:null,showproductMeta:false });
    var url = this.state.SERVER_URL + '/api/finance/inventory/?limit=10&name__icontains='+query
    var data = await HttpsClient.get(url)
    console.log(data);
    if(data.type=='success'){
      this.setState({productSuggestion:data.data.results,showProducts:true})
    }else{
      this.setState({productSuggestion:[],showProducts:false})
    }
  }

  getProductMeta=async(query)=>{
    this.setState({ hsnCode: query,selectedProductMeta:null,showProducts:false });
    var url = this.state.SERVER_URL + '/api/ERP/productMeta/?search='+query
    var data = await HttpsClient.get(url)
    console.log(data);
    if(data.type=='success'){
      this.setState({productMetaList:data.data,showProductMeta:true})
    }else{
      this.setState({productMetaList:[],showproductMeta:false})
    }
  }

  setSelectedProduct=(item)=>{
    this.setState({selectedProduct:item,description:item.name,showProducts:false})
  }

  setEditProduct=(item,index)=>{
    var obj = {
      taxRate:item.tax,
      code:item.taxCode,
    }
    this.setState({editProduct:item,hsnCode:JSON.stringify(item.taxCode),description:item.desc,rate:typeof item.rate=='number'?JSON.stringify(item.rate):item.rate,quantity:typeof item.quantity==Number?JSON.stringify(item.quantity):item.quantity,showModal:true,selectedProductMeta:obj,editIndex:index})
  }

    render(){
        return(
          <View style={{flex:1,backgroundColor:"#f2f2f2"}}>
            <View style={{height:Constants.statusBarHeight,backgroundColor:'#f2f2f2'}}>
               <StatusBar   translucent={true} barStyle="dark-content" backgroundColor={'#f2f2f2'} networkActivityIndicatorVisible={false}    />
            </View>
            {this.renderHeader()}
            <View style={{flex:1}}>
                <ScrollView  ref={(view)=>{this.scrollView = view }}>
                  {this.state.viewContact!=null&&
                    <View>
                      <View style={{paddingHorizontal:25,paddingVertical:15,borderBottomWidth:2,borderColor:'rgba(0,0,0,0.1)'}}>
                        <View style={{flexDirection:'row'}}>
                          <View style={{flex:0.7,justifyContent:'center'}}>
                            <Text style={{color:'#000',fontSize:18,fontWeight:'700'}}>{this.state.viewContact.name}</Text>
                          </View>
                          <View style={{flex:0.3,alignItems:'flex-end',justifyContent:'center'}}>
                            <Text style={{color:'rgba(0, 0, 0, 0.5)',fontSize:14,fontWeight:'600'}}>{moment(this.state.item.created).format('DD MMM YYYY')}</Text>
                          </View>
                        </View>
                        <View style={{flexDirection:'row',marginTop:10}}>
                          <View style={{flex:0.7,justifyContent:'center'}}>
                            <Text style={{color:'rgba(0, 0, 0, 0.5)',fontSize:16,fontWeight:'600'}}>{this.state.viewContact.company.name}</Text>
                          </View>
                          <View style={{flex:0.3,alignItems:'flex-end',justifyContent:'center'}}>
                            <Text style={{color:'#c2c2c2',fontSize:12,fontWeight:'600'}}>({this.state.item.timeAgo})</Text>
                          </View>
                        </View>
                        {this.state.company!=null&&
                        <View>
                          <Text style={{color:'rgba(0, 0, 0, 0.5)',fontSize:14,fontWeight:'600',marginTop:10}}>{this.state.viewContact.company.address.street}</Text>
                          <Text style={{color:'rgba(0, 0, 0, 0.5)',fontSize:14,fontWeight:'600',}}>{this.state.viewContact.company.address.city} ,</Text>
                          <Text style={{color:'rgba(0, 0, 0, 0.5)',fontSize:14,fontWeight:'600',}}>{this.state.viewContact.company.address.state} ,</Text>
                          <Text style={{color:'rgba(0, 0, 0, 0.5)',fontSize:14,fontWeight:'600',}}>{this.state.viewContact.company.address.country} ,</Text>
                          <Text style={{color:'rgba(0, 0, 0, 0.5)',fontSize:14,fontWeight:'600',}}>{this.state.viewContact.company.address.pincode} ,</Text>
                          <Text style={{color:'rgba(0, 0, 0, 0.5)',fontSize:14,fontWeight:'600',}}>{this.state.viewContact.email}</Text>
                        </View>
                       }
                    </View>

                    <View style={{paddingVertical:20,}}>
                      <View style={{flexDirection:'row',paddingHorizontal:25,}}>
                        <View style={{flex:0.45}}>
                          <TouchableOpacity onPress={()=>{}} style={{borderWidth:1,borderColor:'#f00',borderRadius:15,marginRight:5,flexDirection:'row',height:40,alignItems:'center',justifyContent:'center'}}>
                            <AntDesign name="pdffile1" size={20} color="#f00" />
                            <Text style={{color:'#f00',fontSize:14,marginLeft:5}}>Download PDF</Text>
                          </TouchableOpacity>
                        </View>
                        <View style={{flex:0.55,}}>
                          <TouchableOpacity onPress={()=>{}} style={{borderWidth:1,borderColor:'#378a3b',borderRadius:15,marginLeft:5,flexDirection:'row',height:40,alignItems:'center',justifyContent:'center'}}>
                            <FontAwesome name="whatsapp" size={20} color="#378a3b" />
                            <Text style={{color:'#378a3b',fontSize:14,marginLeft:5}}>Share on Whatsapp</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={{paddingTop:30,}}>
                        <View style={{flexDirection:'row',paddingHorizontal:25,}}>
                          <View style={{flex:1,justifyContent:'center'}}>
                            <Text style={{color:'#000',fontSize:16,}}>PRODUCTS</Text>
                          </View>
                          <View style={{flex:1,justifyContent:'center'}}>
                            <TouchableOpacity onPress={()=>{this.setModalShow()}} style={{backgroundColor:'rgba(0,0,0,0.8)',borderRadius:15,height:35,alignItems:'center',justifyContent:'center'}}>
                              <Text style={{color:'#fff',fontSize:14,fontWeight:'700'}}>Add more products</Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        <View style={{paddingHorizontal:15,borderBottomWidth:2,borderColor:'rgba(0,0,0,0.1)',paddingBottom:15}}>
                          <FlatList contentContainerStyle={{paddingVertical:10,paddingHorizontal:10}}
                          data={this.state.productList}
                          keyExtractor={(item, index) => index.toString()}
                          renderItem={({item,index})=>{
                          return(
                            <View style={[styles.shadow,{marginVertical:8,backgroundColor:'#EFF1FA',paddingHorizontal:10,paddingVertical:10,borderRadius:5}]} >
                              <TouchableWithoutFeedback onPress={()=>{this.setEditProduct(item,index)}}>
                                <View  style={{}} >
                                 <Text style={{color:'#000',fontWeight:'700',fontSize:16}}>{item.desc}</Text>
                                  <View  style={{flexDirection:'row',paddingTop:10}} >
                                    <View style={{flex:0.35,alignItems:'center',justifyContent:'center'}}>
                                      <Text style={{color:'#000',fontWeight:'700',fontSize:18}}>&#8377; {item.rate}</Text>
                                      <Text style={{color:'#c2c2c2',fontWeight:'600',fontSize:12}}>per item</Text>
                                    </View>
                                    <View style={{flex:0.05,alignItems:'center',justifyContent:'center'}}>
                                      <Text style={{color:'#c2c2c2',fontWeight:'700',fontSize:18}}>X</Text>
                                    </View>
                                    <View style={{flex:0.2,alignItems:'center',justifyContent:'center'}}>
                                      <Text style={{color:'#000',fontWeight:'700',fontSize:18}}>{item.quantity}</Text>
                                    </View>
                                    <View style={{flex:0.05,alignItems:'center',justifyContent:'center'}}>
                                      <Text style={{color:'#c2c2c2',fontWeight:'700',fontSize:22}}>=</Text>
                                    </View>
                                    <View style={{flex:0.35,alignItems:'center',justifyContent:'center'}}>
                                      <Text style={{color:'#000',fontWeight:'700',fontSize:18}}>&#8377; {item.total}</Text>
                                      <Text style={{color:'#c2c2c2',fontWeight:'600',fontSize:12,textAlign:'center'}}>Subtotal</Text>
                                    </View>
                                  </View>
                                  <View  style={{flexDirection:'row',paddingTop:15}} >
                                    <View style={{flex:0.6,alignItems:'flex-start',justifyContent:'center'}}>
                                      <Text style={{color:'#000',fontWeight:'600',fontSize:14}}>HSN Code : {item.taxCode}</Text>
                                      <Text style={{color:'#000',fontWeight:'600',fontSize:14,marginTop:5}}>Tax Rate : {item.tax}%</Text>
                                    </View>
                                    <View style={{flex:0.05,alignItems:'center',justifyContent:'center'}}>
                                    </View>
                                    <View style={{flex:0.35,alignItems:'center',justifyContent:'center'}}>
                                      <Text style={{color:'rgba(0,0,0,0.6)',fontWeight:'600',fontSize:22}}>+ {item.totalTax}</Text>
                                    </View>
                                  </View>
                                </View>
                              </TouchableWithoutFeedback>
                            </View>
                          )}}
                          />
                          {this.state.contract!=null&&
                          <View style={{marginHorizontal:10}}>
                            <View style={{flexDirection:'row'}}>
                              <View style={{flex:0.7}}>
                                <Text style={{color:'#000',fontWeight:'600',fontSize:18}}>Total before Discount</Text>
                              </View>
                              <View style={{flex:0.3,alignItems:'flex-end'}}>
                                <Text style={{color:'#000',fontWeight:'700',fontSize:16}}>&#8377; {this.state.contract.grandTotal}</Text>
                              </View>
                            </View>
                            <View style={{flexDirection:'row',marginTop:10,borderBottomWidth:2,borderColor:'rgba(0,0,0,0.1)',paddingBottom:15}}>
                              <View style={{flex:0.7}}>
                                <Text style={{color:'#000',fontWeight:'600',fontSize:18}}>Discount</Text>
                              </View>
                              <View style={{flex:0.3,alignItems:'flex-end'}}>
                                <Text style={{color:'#000',fontWeight:'700',fontSize:16}}>&#8377; {this.state.contract.discount}</Text>
                              </View>
                            </View>
                            <View style={{flexDirection:'row',marginTop:15}}>
                              <View style={{flex:0.7}}>
                                <Text style={{color:'#000',fontWeight:'600',fontSize:18}}>Total</Text>
                              </View>
                              <View style={{flex:0.3,alignItems:'flex-end'}}>
                                <Text style={{color:'#000',fontWeight:'700',fontSize:16}}>&#8377; {this.state.contract.value}</Text>
                              </View>
                            </View>
                          </View>
                            }
                        </View>


                        <View style={{paddingVertical:15}}>
                          <View style={{flexDirection:'row',paddingHorizontal:25,}}>
                            <View style={{flex:0.7,justifyContent:'center'}}>
                              <Text style={{color:'#000',fontSize:15,}}>TERMS AND CONDITIONS</Text>
                            </View>
                            <View style={{flex:0.3,justifyContent:'center',alignItems:'flex-end'}}>
                              <TouchableOpacity onPress={()=>{}} style={{height:35,alignItems:'center',justifyContent:'center'}}>
                                <Text style={{color:'#000',fontSize:14,fontWeight:'700',borderBottomWidth:1}}>change</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                          {
                          <FlatList contentContainerStyle={{paddingVertical:10,paddingHorizontal:10}}
                          data={this.state.termsAndCondition}
                          keyExtractor={(item, index) => index.toString()}
                          renderItem={({item,index})=>{
                          return(
                            <View style={[{marginVertical:5,paddingHorizontal:10,borderRadius:5,}]} >
                              <View  style={{flexDirection:'row'}} >
                                <Text style={{color:'rgba(0, 0, 0, 0.5)',fontWeight:'600',fontSize:14}}>{index+1} . </Text>
                                <Text style={{color:'rgba(0, 0, 0, 0.5)',fontWeight:'600',fontSize:14,lineHeight:22}}>{item}</Text>
                              </View>
                            </View>
                          )}}
                          />
                          }
                        </View>

                      </View>

                    </View>

                  </View>
                }
                </ScrollView>
            </View>
            {this.renderModal()}
          </View>
      );
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
       elevation: 3,
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
       marginHorizontal: width*0.01 ,
       borderRadius:5,
    },

   });
