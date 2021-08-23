import React, {useState} from 'react';
import {Image,ImageBackground,StyleSheet,Text,View,ToastAndroid,Keyboard,Pressable,ActivityIndicator,ScrollView,Dimensions,Modal} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { useRef } from 'react';
import { BeforeOrderDetails, getDiverId, getSaleItemByInvoice, SaveOrder } from '../api/apiService';
import {Colors} from './../components/Colors';

let totalAmount = 0;

export default function ViewPDF({navigation , route , text, onOK}) {
    var totalAmountVat = 0;
    var totalAmountWithoutVat = 0;
    var AmountVat = 0;
    let commandsArray = [];

    const ref = useRef();
	const win = Dimensions.get('window');

	const [ savedOrderResonce ,setSavedOrderResponce ] = useState();
	const [ hasNonVatProducts ,setHasNonVatProducts ] = useState(false);
	const [ hasVatProducts ,setHasVatProducts ] = useState(false);
	const [savedBuyerData , setSavedBuyerData] = useState();
	const [showVAT , setShowVAT] = useState(false);
    const [VatProductTotal , setVatProductTotal] = useState(0);
    const [VATTotal , setVATTotal] = useState(0);
    const [WithoutVatProductTotal , setWithoutVatProductTotal] = useState(0);
    const [invoiceNumber , setInvoiceNumber] = useState();
    const [selectedDriverId , setselectedDriverId] = useState();
    const [loader , setLoader] = useState(false);


    let setBase64Image = '';
    function getSaleItemByInv (invoiceNo) {
        setLoader(true)
        return new Promise( (resolve , reject) => {
            getSaleItemByInvoice(invoiceNo).then((res) => {
                resolve(res.data.data);
                setLoader(false)
            });
        } ,(err) =>{
            reject(err)
        })
    }
    useEffect(() => {
        setInvoiceNumber(route.params.invoiceNo);

        getPrinterNameByDriver();
        AsyncStorage.getItem('user_id').then((driverId) => {
            setselectedDriverId(driverId)
        });
        
        getSaleItemByInv(route.params.invoiceNo).then( (result) => {
            console.log(result)
            setSavedBuyerData(result[0].buyer_rel);
            let parsedData = result;

            setSavedOrderResponce(parsedData);
            for(let i = 0 ; i < parsedData.length ; i++){
                console.log("here")
                if( parsedData[i]['has_vat'] == 1 || parsedData[i]['sale_item_rel']['itemcategory'] == 'EGGS'){
                    if(parsedData[i]['sale_item_rel']['itemcategory'] == 'EGGS'){
                        let qty = parsedData[i]['qty'];
                        let sale_price = parsedData[i]['sale_price'];
                        
                        // setVatProductTotal( (parseFloat(VatProductTotal) + (parseFloat(qty)*parseFloat(sale_price))) );
                        totalAmountVat = (parseFloat(totalAmountVat) + (parseFloat(qty)*parseFloat(sale_price))) 
                        AmountVat = (parseFloat(AmountVat) + (parseFloat(qty)*parseFloat(sale_price))) 

                        setVatProductTotal(totalAmountVat);
                        setVATTotal(AmountVat)
                    }
                    if( parsedData[i]['has_vat'] == 1 ){
                        let qty = parsedData[i]['qty'];
                        let sale_price = parsedData[i]['sale_price'];
                        let totalPriceAfterVAT = (((qty*sale_price) *1.20));
                        let amount = (qty*sale_price);

                        AmountVat = (parseFloat(AmountVat) + (parseFloat(qty)*parseFloat(sale_price))) 
                        totalAmountVat = (parseFloat(totalAmountVat) + parseFloat(totalPriceAfterVAT)) 

                        setVatProductTotal(totalAmountVat);
                        setVATTotal(AmountVat)

                    }
                }

                if( parsedData[i]['has_vat'] == 0 && parsedData[i]['sale_item_rel']['itemcategory'] != 'EGGS' ){
                    
                    if( parsedData[i]['has_vat'] == 0 ){
                        let qty = parsedData[i]['qty'];
                        let sale_price = parsedData[i]['sale_price'];
                        let totalPriceAfterVAT = ( (qty*sale_price) );
                        
                        totalAmountWithoutVat = (parseFloat(totalAmountWithoutVat) + parseFloat(totalPriceAfterVAT)) 
                        setWithoutVatProductTotal(totalAmountWithoutVat)
                    }
                }

                if( parsedData[i]['sale_item_rel']['itemcategory'] == 'EGGS' || parsedData[i]['sale_item_rel']['itemcategory'] == 'eggs' || parsedData[i].has_vat == 1 ){
                    setHasNonVatProducts(true);
                }else{
                    setHasVatProducts(true);
                }

                let amount = ((parsedData[i]['sale_price'] * parsedData[i]['qty']).toFixed(2)).toString();
                totalAmount = (parseFloat(totalAmount)+parseFloat(amount));
            }
            setSavedOrderResponce(parsedData);

        })

        AsyncStorage.setItem('selectedLoadedItemsByQty', JSON.stringify({}));
        AsyncStorage.getItem('currentVATstatus').then((res) => {
            if( res == '1' ){
                setShowVAT(true);
            }else{
                setShowVAT(false);
            }
        });
        totalAmountVat = 0;
        AmountVat = 0;
        totalAmountWithoutVat = 0;
      
    }, []);
    function handleBackButtonClick() {
        navigation.navigate('Dashboard');
    }
    function parseIntt(string){
        return parseInt(string);
    }
    
    function parseFloatt(string){
        return parseFloat(string);
    }
	
	return (
        <View style={styles.bodyContainer}>
             {( loader ) ?
                <ActivityIndicator color={Colors.primary} size={30}></ActivityIndicator>
            : 
                <></>
            }
            {( win.width > 550)?
                <View >
                    <View style={{flexDirection: 'row',height: '100%'}}>
                        <View style={{width: '50%'}} >
                            <ScrollView>
                                <View >
                                    <Text style={{fontSize: 20, color: 'black', fontWeight: '700',backgroundColor: 'white',textAlign: 'center'}}>
                                        Invoice
                                    </Text>
                                    <Text style={{ fontSize: 30,textAlign: 'center'}}>UK Inch</Text>
                                    <Text style={{ fontSize: 15,textAlign: 'center'}}>Unit 12C, Bridge Industrial Estate,RH6 9HU</Text>
                                    <Text style={{ fontSize: 15,textAlign: 'center'}}>Phone: 07917105510</Text>
                                    <Text style={{ fontSize: 15,textAlign: 'center'}}>Email: Ukinch2@gmail.com</Text>
                                    <Text style={{ fontSize: 15,textAlign: 'left',marginLeft: 20}}>INVOICE: {(invoiceNumber != undefined)? invoiceNumber : ''}</Text>
                                    <View style={{ flex: 0.2, flexDirection:'row',justifyContent: 'space-between',paddingHorizontal: 20,marginTop: 20,borderBottomColor:'black',borderTopColor:'black',borderLeftColor:'transparent',borderRightColor:'transparent',borderWidth: 1,padding: 10 }}>
                                        <Text style={{fontWeight: 'bold',width: 100}}>Customer</Text>
                                        <Text style={{fontWeight: 'bold'}}></Text>
                                        <Text style={{fontWeight: 'bold'}}></Text>
                                        <Text style={{fontWeight: 'bold'}}>Date: { (savedOrderResonce != undefined) ? savedOrderResonce[0]['idate'] : ''   }</Text>
                                    </View>
                                    <View style={{ flex: 0.2, flexDirection:'row',paddingHorizontal: 20,marginTop: 20}}>
                                        <Text style={{width: 100}}>Name: </Text>
                                        <Text style={{}}>{(savedBuyerData != undefined) ? savedBuyerData['name'] : ''} </Text>
                                    </View>
                                    <View style={{ flex: 0.2, flexDirection:'row',paddingHorizontal: 20,marginTop: 20}}>
                                        <Text style={{width: 100}}>Address: </Text>
                                        <Text style={{textAlign: 'left'}}>{(savedBuyerData != undefined) ? savedBuyerData['address'] : ''} </Text>
                                    </View>
                                    <View style={{ flex: 0.2, flexDirection:'row',paddingHorizontal: 20,marginTop: 20}}>
                                        <Text style={{width: 100}}>Phone: </Text>
                                        <Text style={{}}>{(savedBuyerData != undefined) ? savedBuyerData['contact_no'] : ''} </Text>
                                    </View>
                                    {( hasNonVatProducts ) ?
                                        <View>
                                            {/* <View style={{marginTop: 20,paddingTop: 10,borderTopColor: 'black', borderTopWidth: 1}}><Text style={{justifyContent: 'center',textAlign: 'center',fontWeight:'bold'}}>Items without VAT</Text></View> */}
                                            <View style={{ flex: 0.2,borderTopColor: 'black', borderTopWidth: 1, flexDirection:'row',justifyContent: 'space-between',paddingHorizontal: 20,borderBottomColor:'black',marginTop: 20,borderLeftColor:'transparent',borderRightColor:'transparent',borderWidth: 1 ,padding: 10}}>
                                                <Text style={{fontWeight: 'bold'}}>Qty</Text>
                                                <Text style={{fontWeight: 'bold'}}>Price</Text>
                                                <Text style={{fontWeight: 'bold'}}>Amount</Text>
                                                <Text style={{fontWeight: 'bold'}}>VAT</Text>
                                                <Text style={{fontWeight: 'bold'}}>Total(inc)</Text>
                                            </View>
                                            <View style={{marginTop: 10}}>
                                            </View>
                                        </View>                                
                                    :
                                        <View></View>
                                    }
                                            
                                        {(savedOrderResonce != undefined) ?
                                            savedOrderResonce.map((value , key) => {
                                                return (
                                                    <View key={key} >
                                                        {( value['sale_item_rel'].itemcategory == 'EGGS' ) ?
                                                            <View style={{ borderBottomColor: '#ededed', borderBottomWidth: 1,paddingVertical: 15 }}>
                                                                <Text style={{ width: '100%',marginLeft: 20}}><Text style={{ fontWeight: 'bold' }}> </Text>{value['sale_item_rel'].name}</Text>
                                                                <View key={key} style={{flex: 0.2,flexDirection: 'row',justifyContent:'space-between',paddingHorizontal: 20}}>
                                                                    <Text style={{ }}>{parseFloatt(value['qty'])}</Text>
                                                                    <Text style={{ }}>£{(value['sale_price'])}</Text>
                                                                    <Text style={{ }}>£{(value['sale_price'] * parseFloatt(value['qty'])).toFixed(2)}</Text>
                                                                    <Text style={{ }}>£ 0</Text>
                                                                    <Text style={{ }}>£{((value['sale_price'] * parseFloatt(value['qty'])).toFixed(2)).toString()}</Text>
                                                                </View>
                                                            </View>
                                                        :
                                                            <View></View>
                                                        } 
                                                        {( value['sale_item_rel'].itemcategory != 'EGGS' && value.has_vat ) ?
                                                            <View>
                                                                <View style={{ borderBottomColor: '#ededed', borderBottomWidth: 1,paddingVertical: 15 }}>
                                                                    <Text style={{ width: '100%',marginLeft: 20}}><Text style={{ fontWeight: 'bold' }}> </Text>{value['sale_item_rel'].name}</Text>
                                                                    <View key={key} style={{flex: 0.2,flexDirection: 'row',justifyContent:'space-between',paddingHorizontal: 20}}>
                                                                        {/* <Text style={{ width: 90}}>{value['sale_item_rel'].name}</Text> */}
                                                                        <Text style={{ }}>{parseFloatt(value['qty'])}</Text>
                                                                        <Text style={{ }}>£{(value['sale_price'])}</Text>
                                                                        <Text style={{ }}>£{(value['sale_price'] * parseFloatt(value['qty'])).toFixed(2)}</Text>
                                                                        <Text style={{ }}>£{((((parseFloatt(value['qty']) * value['sale_price'])*1.20)) -  (parseFloatt(value['qty']) * value['sale_price'])).toFixed(2)}</Text>
                                                                        <Text style={{ }}>£{( parseFloat((value['sale_price'] * parseFloatt(value['qty'])).toFixed(2)) * 1.20).toFixed(2)}</Text>
                                                                    </View>
                                                                </View>
                                                                {/* <View style={{flexDirection:'row' ,justifyContent: 'space-between',marginTop: 20}}>
                                                                    <Text></Text>
                                                                    <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}>Total:</Text></Text>
                                                                    <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}></Text> </Text>
                                                                    <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VATTotal).toFixed(2)}</Text></Text>
                                                                    <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VatProductTotal-VATTotal).toFixed(2)}</Text></Text>
                                                                    <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VatProductTotal).toFixed(2)}</Text></Text>
                                                                </View> */}
                                                            </View>
                                                        :
                                                            <View></View>
                                                        } 
                                                    </View>
                                                )
                                            })
                                            
                                        : 
                                            <View></View>
                                        }
                                        {(hasNonVatProducts) ? 
                                            <View>
                                                <View style={{flexDirection:'row' ,justifyContent: 'flex-end',marginTop: 20}}>
                                                    <Text></Text>
                                                    <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}>Amount Before VAT:</Text></Text>
                                                    <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VATTotal).toFixed(2)}</Text></Text>
                                                </View>
                                                <View style={{flexDirection:'row' ,justifyContent: 'flex-end'}}>
                                                    <Text></Text>
                                                    <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}>VAT:</Text></Text>
                                                    <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VatProductTotal-VATTotal).toFixed(2)}</Text></Text>
                                                </View>
                                                <View style={{flexDirection:'row' ,justifyContent: 'flex-end'}}>
                                                    <Text></Text>
                                                    <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}>Total:</Text></Text>
                                                    <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VatProductTotal).toFixed(2)}</Text></Text>
                                                </View>
                                            </View>
                                        : 
                                            <View></View>    
                                        }
                                        
                                        {( WithoutVatProductTotal > 0 ) ?
                                            <View>
                                                <Text style={{textAlign: 'center',marginTop: 30,marginBottom: 10}}>*******************************</Text>
                                                <View style={{ flex: 0.2, flexDirection:'row',justifyContent: 'space-between',borderTopColor: 'black', borderTopWidth: 1,paddingHorizontal: 20,borderBottomColor:'black',borderLeftColor:'transparent',borderRightColor:'transparent',borderWidth: 1 ,padding: 10}}>
                                                    <Text style={{fontWeight: 'bold'}}>Qty</Text>
                                                    <Text style={{fontWeight: 'bold'}}>Price</Text>
                                                    {/* <Text style={{fontWeight: 'bold'}}>VAT</Text> */}
                                                    <Text style={{fontWeight: 'bold'}}>Amt(inc)</Text>
                                                </View>
                                                <View style={{marginTop: 10}}>
                                                </View>
                                            </View>
                                        :
                                            <View></View>
                                        }
                                        
                                        {(savedOrderResonce != undefined) ?
                                            savedOrderResonce.map((value , key) => {

                                                return (
                                                    <View key={key} >
                                                        {( value['sale_item_rel'].itemcategory != 'EGGS' && !value.has_vat  ) ?
                                                            <View key={key} style={{ borderBottomColor: '#ededed', borderBottomWidth: 1,paddingVertical: 15 }}>
                                                                <Text style={{ width: '100%',marginLeft: 20}}><Text style={{ fontWeight: 'bold' }}></Text>{value['sale_item_rel'].name}</Text>
                                                                <View key={key} style={{flex: 0.2,flexDirection: 'row',justifyContent:'space-between',paddingHorizontal: 20}}>
                                                                    <Text style={{ }}>{(parseFloatt(value['qty'])).toFixed(2)}</Text>
                                                                    <Text style={{ }}>£{(value['sale_price'])}</Text>
                                                                    {/* <Text style={{ }}>£ 0</Text> */}
                                                                    <Text style={{ }}>£{((value['sale_price'] * parseFloatt(value['qty'])).toFixed(2)).toString()}</Text>
                                                                </View>
                                                                {/* <View key={key} style={{flex: 0.2,flexDirection: 'row',justifyContent:'space-between',paddingHorizontal: 20}}>
                                                                    <Text style={{ width: 90}}>{}</Text>
                                                                    <Text style={{ }}>{}</Text>
                                                                    <Text style={{ fontWeight: 'bold'}}>VAT</Text>
                                                                    <Text style={{ }}>£{((value['sale_price']*100) / 120).toFixed(2)}</Text>
                                                                </View> */}

                                                            </View>
                                                        :
                                                            <View></View>
                                                        }
                                                    </View>
                                                )
                                            })
                                        : 
                                            <View></View>
                                        }
                                        {(WithoutVatProductTotal > 0)?    
                                            <View style={{flexDirection:'row' ,justifyContent: 'space-between',marginTop: 20}}>
                                                <Text></Text>
                                                {/* <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}>Total:</Text> £{(totalAmountWithoutVat).toFixed(2)}</Text> */}
                                                <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}>Total: £{(WithoutVatProductTotal).toFixed(2)}</Text></Text>
                                            </View>
                                        :
                                            <View></View>
                                        }
                                    <View style={{ flex: 0.2, flexDirection:'row',justifyContent: 'space-between',paddingHorizontal: 20,marginTop: 20}}>
                                        <Text style={{fontWeight: 'bold',width: 100}}></Text>
                                        <Text style={{fontWeight: 'bold'}}></Text>
                                        <Text style={{fontWeight: 'bold'}}>Grand Total:</Text>
                                        <Text style={{fontWeight: 'bold'}}>£{(VatProductTotal + WithoutVatProductTotal).toFixed(2)}</Text>
                                    </View>
                                </View>
                            </ScrollView>

                        </View>
                        <View style={{ width: '50%'}}>
        

                            <View style={{flex: 2}}></View>
        
                        </View>
                    </View>
                </View>
        
            :
                <View style={{flex:1}}>
                    <View style={{ height: '100%' ,width: '100%' }}>
                        <ScrollView>
                            <View >
                                <Text style={{fontSize: 20, color: 'black', fontWeight: '700',backgroundColor: 'white',textAlign: 'center'}}>
                                    Invoice
                                </Text>
                                <Text style={{ fontSize: 30,textAlign: 'center'}}>UK Inch</Text>
                                <Text style={{ fontSize: 15,textAlign: 'center'}}>Unit 12C, Bridge Industrial Estate,RH6 9HU</Text>
                                <Text style={{ fontSize: 15,textAlign: 'center'}}>Phone: 07917105510</Text>
                                <Text style={{ fontSize: 15,textAlign: 'center'}}>Email: Ukinch2@gmail.com</Text>
                                <Text style={{ fontSize: 15,textAlign: 'left',marginLeft: 20}}>INVOICE: {(invoiceNumber != undefined)? invoiceNumber : ''}</Text>
                                <View style={{ flex: 0.2, flexDirection:'row',justifyContent: 'space-between',paddingHorizontal: 20,marginTop: 20,borderBottomColor:'black',borderTopColor:'black',borderLeftColor:'transparent',borderRightColor:'transparent',borderWidth: 1,padding: 10 }}>
                                    <Text style={{fontWeight: 'bold',width: 100}}>Customer</Text>
                                    <Text style={{fontWeight: 'bold'}}></Text>
                                    <Text style={{fontWeight: 'bold'}}></Text>
                                    <Text style={{fontWeight: 'bold'}}>Date: { (savedOrderResonce != undefined) ? savedOrderResonce[0]['idate'] : ''   }</Text>
                                </View>
                                <View style={{ flex: 0.2, flexDirection:'row',paddingHorizontal: 20,marginTop: 20}}>
                                    <Text style={{width: 100}}>Name: </Text>
                                    <Text style={{}}>{(savedBuyerData != undefined) ? savedBuyerData['name'] : ''} </Text>
                                </View>
                                <View style={{ flex: 0.2, flexDirection:'row',paddingHorizontal: 20,marginTop: 20}}>
                                    <Text style={{width: 100}}>Address: </Text>
                                    <Text style={{textAlign: 'left'}}>{(savedBuyerData != undefined) ? savedBuyerData['address'] : ''} </Text>
                                </View>
                                <View style={{ flex: 0.2, flexDirection:'row',paddingHorizontal: 20,marginTop: 20}}>
                                    <Text style={{width: 100}}>Phone: </Text>
                                    <Text style={{}}>{(savedBuyerData != undefined) ? savedBuyerData['contact_no'] : ''} </Text>
                                </View>
                                {( hasNonVatProducts ) ?
                                    <View>
                                        {/* <View style={{marginTop: 20,paddingTop: 10,borderTopColor: 'black', borderTopWidth: 1}}><Text style={{justifyContent: 'center',textAlign: 'center',fontWeight:'bold'}}>Items without VAT</Text></View> */}
                                        <View style={{ flex: 0.2,borderTopColor: 'black', borderTopWidth: 1, flexDirection:'row',justifyContent: 'space-between',paddingHorizontal: 20,borderBottomColor:'black',marginTop: 20,borderLeftColor:'transparent',borderRightColor:'transparent',borderWidth: 1 ,padding: 10}}>
                                            <Text style={{fontWeight: 'bold'}}>Qty</Text>
                                            <Text style={{fontWeight: 'bold'}}>Price</Text>
                                            <Text style={{fontWeight: 'bold'}}>Amount</Text>
                                            <Text style={{fontWeight: 'bold'}}>VAT</Text>
                                            <Text style={{fontWeight: 'bold'}}>Total(inc)</Text>
                                        </View>
                                        <View style={{marginTop: 10}}>
                                        </View>
                                    </View>                                
                                :
                                    <View></View>
                                }
                                        
                                    {(savedOrderResonce != undefined) ?
                                        savedOrderResonce.map((value , key) => {
                                            return (
                                                <View key={key} >
                                                    {( value['sale_item_rel'].itemcategory == 'EGGS' ) ?
                                                        <View style={{ borderBottomColor: '#ededed', borderBottomWidth: 1,paddingVertical: 15 }}>
                                                            <Text style={{ width: '100%',marginLeft: 20}}><Text style={{ fontWeight: 'bold' }}> </Text>{value['sale_item_rel'].name}</Text>
                                                            <View key={key} style={{flex: 0.2,flexDirection: 'row',justifyContent:'space-between',paddingHorizontal: 20}}>
                                                                <Text style={{ }}>{parseFloatt(value['qty'])}</Text>
                                                                <Text style={{ }}>£{(value['sale_price'])}</Text>
                                                                <Text style={{ }}>£{(value['sale_price'] * parseFloatt(value['qty'])).toFixed(2)}</Text>
                                                                <Text style={{ }}>£ 0</Text>
                                                                <Text style={{ }}>£{((value['sale_price'] * parseFloatt(value['qty'])).toFixed(2)).toString()}</Text>
                                                            </View>
                                                        </View>
                                                    :
                                                        <View></View>
                                                    } 
                                                    {( value['sale_item_rel'].itemcategory != 'EGGS' && value.has_vat ) ?
                                                        <View>
                                                            <View style={{ borderBottomColor: '#ededed', borderBottomWidth: 1,paddingVertical: 15 }}>
                                                                <Text style={{ width: '100%',marginLeft: 20}}><Text style={{ fontWeight: 'bold' }}> </Text>{value['sale_item_rel'].name}</Text>
                                                                <View key={key} style={{flex: 0.2,flexDirection: 'row',justifyContent:'space-between',paddingHorizontal: 20}}>
                                                                    {/* <Text style={{ width: 90}}>{value['sale_item_rel'].name}</Text> */}
                                                                    <Text style={{ }}>{parseFloatt(value['qty'])}</Text>
                                                                    <Text style={{ }}>£{(value['sale_price'])}</Text>
                                                                    <Text style={{ }}>£{(value['sale_price'] * parseFloatt(value['qty'])).toFixed(2)}</Text>
                                                                    <Text style={{ }}>£{((((parseFloatt(value['qty']) * value['sale_price'])*1.20)) -  (parseFloatt(value['qty']) * value['sale_price'])).toFixed(2)}</Text>
                                                                    <Text style={{ }}>£{( parseFloat((value['sale_price'] * parseFloatt(value['qty'])).toFixed(2)) * 1.20).toFixed(2)}</Text>
                                                                </View>
                                                            </View>
                                                            {/* <View style={{flexDirection:'row' ,justifyContent: 'space-between',marginTop: 20}}>
                                                                <Text></Text>
                                                                <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}>Total:</Text></Text>
                                                                <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}></Text> </Text>
                                                                <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VATTotal).toFixed(2)}</Text></Text>
                                                                <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VatProductTotal-VATTotal).toFixed(2)}</Text></Text>
                                                                <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VatProductTotal).toFixed(2)}</Text></Text>
                                                            </View> */}
                                                        </View>
                                                    :
                                                        <View></View>
                                                    } 
                                                </View>
                                            )
                                        })
                                        
                                    : 
                                        <View></View>
                                    }
                                    {(hasNonVatProducts) ? 
                                        <View>
                                            <View style={{flexDirection:'row' ,justifyContent: 'flex-end',marginTop: 20}}>
                                                <Text></Text>
                                                {/* <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}>Totall:</Text> £{totalAmountVat.toFixed(2)}</Text> */}
                                                <Text><Text style={{fontWeight: 'bold'}}>Amount Before VAT:</Text></Text>
                                                {/* <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}></Text> </Text> */}
                                                <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VATTotal).toFixed(2)}</Text></Text>
                                                {/* <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VatProductTotal-VATTotal).toFixed(2)}</Text></Text>
                                                <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VatProductTotal).toFixed(2)}</Text></Text> */}
                                            </View>
                                            <View style={{flexDirection:'row' ,justifyContent: 'flex-end'}}>
                                                <Text></Text>
                                                {/* <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}>Totall:</Text> £{totalAmountVat.toFixed(2)}</Text> */}
                                                <Text><Text style={{fontWeight: 'bold'}}>VAT:</Text></Text>
                                                {/* <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}></Text> </Text> */}
                                                {/* <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VATTotal).toFixed(2)}</Text></Text> */}
                                                <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VatProductTotal-VATTotal).toFixed(2)}</Text></Text>
                                                {/* <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VatProductTotal).toFixed(2)}</Text></Text> */}
                                            </View>
                                            <View style={{flexDirection:'row' ,justifyContent: 'flex-end'}}>
                                                <Text></Text>
                                                {/* <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}>Totall:</Text> £{totalAmountVat.toFixed(2)}</Text> */}
                                                <Text ><Text style={{fontWeight: 'bold'}}>Total:</Text></Text>
                                                {/* <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}></Text> </Text> */}
                                                {/* <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VATTotal).toFixed(2)}</Text></Text>
                                                <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VatProductTotal-VATTotal).toFixed(2)}</Text></Text> */}
                                                <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VatProductTotal).toFixed(2)}</Text></Text>
                                            </View>
                                        </View>
                                    : 
                                        <View></View>    
                                    }
                                    
                                    {( WithoutVatProductTotal > 0 ) ?
                                        <View>
                                            <Text style={{textAlign: 'center',marginTop: 30,marginBottom: 10}}>*******************************</Text>
                                            {/* <View style={{marginTop: 20,paddingTop: 10,borderTopColor: 'black', borderTopWidth: 1}}><Text style={{justifyContent: 'center',textAlign: 'center',fontWeight:'bold'}}>Items with VAT</Text></View> */}
                                            <View style={{ flex: 0.2, flexDirection:'row',justifyContent: 'space-between',borderTopColor: 'black', borderTopWidth: 1,paddingHorizontal: 20,borderBottomColor:'black',borderLeftColor:'transparent',borderRightColor:'transparent',borderWidth: 1 ,padding: 10}}>
                                                <Text style={{fontWeight: 'bold'}}>Qty</Text>
                                                <Text style={{fontWeight: 'bold'}}>Price</Text>
                                                {/* <Text style={{fontWeight: 'bold'}}>VAT</Text> */}
                                                <Text style={{fontWeight: 'bold'}}>Amt(inc)</Text>
                                            </View>
                                            <View style={{marginTop: 10}}>
                                            </View>
                                        </View>
                                    :
                                        <View></View>
                                    }
                                    
                                    {(savedOrderResonce != undefined) ?
                                        savedOrderResonce.map((value , key) => {
                                            return (
                                                <View key={key} >
                                                    {( value['sale_item_rel'].itemcategory != 'EGGS' && !value.has_vat  ) ?
                                                        <View key={key} style={{ borderBottomColor: '#ededed', borderBottomWidth: 1,paddingVertical: 15 }}>
                                                            <Text style={{ width: '100%',marginLeft: 20}}><Text style={{ fontWeight: 'bold' }}></Text>{value['sale_item_rel'].name}</Text>
                                                            <View key={key} style={{flex: 0.2,flexDirection: 'row',justifyContent:'space-between',paddingHorizontal: 20}}>
                                                                {/* <Text style={{ }}>{(parseIntt(value['qty']))}</Text> */}
                                                                <Text style={{ }}>{(parseFloatt(value['qty'])).toFixed(2)}</Text>
                                                                <Text style={{ }}>£{(value['sale_price'])}</Text>
                                                                {/* <Text style={{ }}>£ 0</Text> */}
                                                                <Text style={{ }}>£{((value['sale_price'] * parseFloatt(value['qty'])).toFixed(2)).toString()}</Text>
                                                            </View>
                                                            {/* <View key={key} style={{flex: 0.2,flexDirection: 'row',justifyContent:'space-between',paddingHorizontal: 20}}>
                                                                <Text style={{ width: 90}}>{}</Text>
                                                                <Text style={{ }}>{}</Text>
                                                                <Text style={{ fontWeight: 'bold'}}>VAT</Text>
                                                                <Text style={{ }}>£{((value['sale_price']*100) / 120).toFixed(2)}</Text>
                                                            </View> */}

                                                        </View>
                                                    :
                                                        <View></View>
                                                    }
                                                </View>
                                            )
                                        })
                                    : 
                                        <View></View>
                                    }
                                    {(WithoutVatProductTotal > 0)?    
                                        <View style={{flexDirection:'row' ,justifyContent: 'space-between',marginTop: 20}}>
                                            <Text></Text>
                                            {/* <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}>Total:</Text> £{(totalAmountWithoutVat).toFixed(2)}</Text> */}
                                            <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}>Total: £{(WithoutVatProductTotal).toFixed(2)}</Text></Text>
                                        </View>
                                    :
                                        <View></View>
                                    }
                                <View style={{ flex: 0.2, flexDirection:'row',justifyContent: 'space-between',paddingHorizontal: 20,marginTop: 20}}>
                                    <Text style={{fontWeight: 'bold',width: 100}}></Text>
                                    <Text style={{fontWeight: 'bold'}}></Text>
                                    <Text style={{fontWeight: 'bold'}}>Grand Total:</Text>
                                    <Text style={{fontWeight: 'bold'}}>£{(VatProductTotal + WithoutVatProductTotal).toFixed(2)}</Text>
                                </View>
                            </View>
                        </ScrollView>

                    </View>
                </View>
            }

           
        </View>
	);
}
const styles = StyleSheet.create({
    bodyContainer: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#fff'
        // justifyContent: 'space-around',
    },
    container: {
        // alignItems: 'center',
        height: 200,
        padding: 10,
        flex: 1
    },
    row: {
        display: "flex",
        flexDirection: "row",
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
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
		color: 'white',
        fontSize: 12
	},
	deActiveStatusText: {
		color: Colors.primary,
        fontSize: 12
	},
     centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 15
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
     textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  buttonClose: {
    backgroundColor: Colors.primary,
  },
});