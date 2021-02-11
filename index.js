import  {StyledText}   from './component/StyledText.js';
import  {LoginScreen}   from './component/LoginScreen.js';
import  {OtpScreen}   from './component/OtpScreen.js';
import  {RegisterScreen}   from './component/RegisterScreen.js';
import  ContactCreation    from './component/ContactCreation.js';
import  ViewNewContract    from './component/ViewNewContract.js';
import  { HttpsClient }   from './component/HttpsClient.js';


import React, { Component } from 'react';
import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer} from 'react-navigation';


const LoginStack =  createStackNavigator({
      LoginScreen: {
        screen: LoginScreen,
        navigationOptions: {
        header: null
        },
      },
      OtpScreen: {
        screen: OtpScreen,
        navigationOptions: {
        header: null
      }
    }
  })

  export {
    LoginStack,
    RegisterScreen,
    ContactCreation,
    ViewNewContract,
    HttpsClient
  }
