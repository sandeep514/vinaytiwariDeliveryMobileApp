import React, {Component} from 'react';
import {
StyleSheet,
Image,
View,
Dimensions,
ScrollView,
TouchableHighlight,
Text,
TextInput,
Pressable
} from 'react-native';
import {Colors} from './../components/Colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import {ListItem, Avatar, Header, Button, Input} from 'react-native-elements';
import MainScreen from '../layout/MainScreen';
import {useState, useEffect} from 'react';
import {generateRandString, getCartItemDetails, getDiverId, getListInvoices, getVehicle, imagePrefix} from '../api/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {searchBuyerByInvoiceNumber, getSaleItemByInvoice} from '../api/apiService';
import { ActivityIndicator } from 'react-native';
import { useRef } from 'react';
import { BluetoothManager,BluetoothEscposPrinter,BluetoothTscPrinter } from 'react-native-bluetooth-escpos-printer';
import { StarPRNT } from 'react-native-star-prnt';

const win = Dimensions.get('window');

let setTotalAmount = 0;
let setUpdatedDataArray = [];
let currentSelectedId = '';
let currentSelectedLoadName = '';
let selectedVehicle = '';
let selectedRoute = '';
let selectedDriver = '';
let selectedBuyerId = '';
let valuetem = '';
let updatedValue= '';
let initalPaymentStatus = 'cash';
let unableToConnect = 0;
let commandsArray = [];

export default function ListInvoices({navigation}) {
    const [printingIndicator , setPrintingIndicator] = useState(false);
    const [selectedLoadCount , setSelectedLoadCount] = useState();
    const [ActInd , setActInd] = useState();

    useEffect(() => {
        getListInvoice();
    } , []);

    function getListInvoice(){
        AsyncStorage.getItem('selectedVehicleNo').then((value) => {
            let selectedVehNo  = value;
            AsyncStorage.getItem('user_id').then((value) => {
                let driverId =  value;
                getListInvoices(driverId , selectedVehNo).then((data) => {
                    setSelectedLoadCount(data.data.data)
                });
            });
        });
    }
return (
    <MainScreen>
        <View style={{flex:1}}>
            {(ActInd == true) ?
                <View style={{ flex:1,position:'absolute',justifyContent:'center',height:'100%',width: '100%',backgroundColor: '#ededed',zIndex:9999,opacity: 0.5}} >
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            :
                <View style={styles.itemListSection}>
                    {(printingIndicator)?
                        <View style={{ position: 'absolute',height: win.height,width: win.width,backgroundColor: '#e8e8e8',zIndex: 9999,opacity: 0.5,justifyContent: 'center',alignItems: 'center'}}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                            <Text>Printing your invoice ,Please wait...</Text>
                        </View>
                    :
                        <View></View>
                    }
                    {/* <TextInput placeholder="Search Buyer By Invoice no" placeholderTextColor="lightgrey" style={styles.textInput} onChange={(value) => { searchBuyer(value.nativeEvent.text) } } /> */}
                    <ScrollView vertical='true'>
                        {(selectedLoadCount != undefined && selectedLoadCount != null) ?
                            Object.values(selectedLoadCount).map((l, i) => (
                                (l != null)?
                                <TouchableHighlight key={i}>
                                        <ListItem bottomDivider key={i}>
                                            <ListItem.Content key={i}>
                                                <ListItem.Title key={i} style={{fontSize: 14}} allowFontScaling={false}>
                                                    {l[0]["buyer_rel"].name}
                                                </ListItem.Title>
                                                <ListItem.Subtitle allowFontScaling={false} >
                                                    <Text style={{fontSize: 10}}>{l[0].invoice_no}</Text>
                                                </ListItem.Subtitle>
                                            </ListItem.Content>
                                            <View>
                                                <Pressable style={{backgroundColor: Colors.primary,paddingHorizontal: 10,paddingVertical: 5}} onPress={() => { ViewPrintableReciept(l) }} >
                                                    <Text style={{color: 'white'}}>Cash</Text>
                                                </Pressable>
                                            </View>
                                            <View>
                                                <Pressable style={{backgroundColor: Colors.primary,paddingHorizontal: 10,paddingVertical: 5}} onPress={() => { ViewPrintableReciept(l) }} >
                                                    <Text style={{color: 'white'}}>Credit</Text>
                                                </Pressable>
                                            </View>
                                            <View>
                                                <Pressable style={{backgroundColor: Colors.primary,paddingHorizontal: 10,paddingVertical: 5}} onPress={() => { setPrintingIndicator(true); printReceipt(l) }} >
                                                    <Text style={{color: 'white'}}>Bank Transfer</Text>
                                                </Pressable>
                                            </View>
                                        </ListItem>
                                    </TouchableHighlight>
                                :
                                    <View></View>
                            ))
                        : 
                            <View>
                                <ActivityIndicator size="large" color={Colors.primary} />
                            </View>
                        }
                    </ScrollView>
                </View>
            }
        </View>
    </MainScreen>
);
}

const styles = StyleSheet.create({
vehicleImage: {width: 50, height: 50, resizeMode: 'contain'},
plusButton: {
position: 'relative',
backgroundColor: Colors.parrotGreen,
alignSelf: 'center',
},
minisButton: {
position: 'relative',
backgroundColor: Colors.redMaroon,
alignSelf: 'center',
},
mainBox: {
flex: 1,
flexDirection: 'row',
justifyContent: 'center',
borderColor: 'red',
height: 90,
paddingHorizontal: 5,
},
itemBox: {
flex: 1.9,
flexDirection: 'row',
// justifyContent: 'space-evenly',
alignItems: 'center',
borderColor: 'blue',
height: 90,
},
buttonBox: {
flex: 1,
justifyContent: 'space-around',
flexDirection: 'row',
alignItems: 'center',
borderColor: Colors.primary,
borderWidth: 0.8,
paddingVertical: 10,
borderRadius: 10,
},
inputBox: {
flex: 1,
flexDirection: 'row',
justifyContent: 'center',
alignItems: 'center',
borderColor: 'dodgerblue',
height: 90,
},
activeStatus: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    borderRadius: 15,
    paddingVertical: 10,
    borderColor: Colors.primary ,
    borderWidth: 2
},
deActiveStatus: {
    paddingHorizontal: 18,
    borderRadius: 15,
    paddingVertical: 10,
    marginHorizontal: 10 ,
    borderColor: Colors.primary ,
    borderWidth: 2
},
activeStatusText: {
    color: 'white'
},
deActiveStatusText: {
    color: Colors.primary
},
textInput:{
    borderColor: 'lightgrey',
    borderWidth: 1,
    marginHorizontal: 17,
    paddingHorizontal: 17,
    borderRadius: 100,
    color: '#000'
}
});