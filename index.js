import  {StyledText}   from './component/StyledText.js';
import  {LoginScreen}   from './component/LoginScreen.js';
import  {OtpScreen}   from './component/OtpScreen.js';
import  {HttpsClient}   from './component/HttpsClient.js';


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
    HttpsClient
  }

  // export  {
  //   StyledText,
  //   LoginScreen
  // };
