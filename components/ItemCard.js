	import AsyncStorage from '@react-native-async-storage/async-storage';
	import React, {useEffect , useState} from 'react';
	import {View, Text, Image, StyleSheet, Pressable , TextInput ,Button,Dimensions } from 'react-native';
	import {Input} from 'react-native-elements';
	import Icon from 'react-native-vector-icons/FontAwesome';
	import {Colors} from '../components/Colors';
	import {widthToDp, heightToDp} from '../utils/Responsive';
	let selectedLoadArray = {};

	export default DashboardCard = ({ backgroundColor, cardName, imageUrl, onPress, styleData, qty, cardId ,loadName }) => {

		const [ UpdateQtyofItem , setUpdateQtyofItem] = useState({});
		const [ UpdateQtyofItems , setUpdateQtyofItems] = useState(0);
		const [ cartData , setCartData ] = useState();
		const win = Dimensions.get('window');
		
		useEffect(() => {
			selectedLoadArray = {};
			getPendingOrderResponce();
			// AsyncStorage.getItem('itemsAddedInCart').then((data) => {
			// 	if( data != null ){
			// 	}
			// })

			AsyncStorage.getItem('undeliveredItems').then((items) => {

			})
			// AsyncStorage.getItem('selectedLoadedItemsByQty').then((res) => {
			// 	selectedLoadArray = JSON.parse(res);
			// })
			return() => { selectedLoadArray = {}; AsyncStorage.removeItem('itemsAddedInCart'); AsyncStorage.setItem('selectedLoadedItemsByQty', JSON.stringify({})); }
			// AsyncStorage.setItem('selectedLoadedItemsByQty', JSON.stringify({}));
		},[])
		function getPendingOrderResponce () {
			AsyncStorage.getItem('cartItems').then((data) => {
				let myRecords = {};
				let myRecordsFinal = {};
				let relData = JSON.parse(data);
				if( data != undefined ){
					for(let i = 0 ; i < relData.length; i++){
						let dnum = relData[i].dnum;
						let sitem = relData[i].sitem;
						let qty = relData[i].qty;

						myRecords[relData[i].dnum+'_'+relData[i].sitem] = qty;
						myRecordsFinal[relData[i].dnum+'__'+relData[i].sitem] = {'value' : JSON.parse(qty) , 'cardId' :relData[i].sitem,'VATstatus': false };
						AsyncStorage.setItem('selectedLoadedItemsByQty' , JSON.stringify(myRecordsFinal) )
						
						
						AsyncStorage.setItem('itemsAddedInCart' , JSON.stringify(myRecords))
					}
					setCartData(myRecords)
					selectedLoadArray = myRecordsFinal;
				}
			})
		}
		function DirectUpdateQTY(loadName , cardId ,qty){

			if( qty.substring(0 ,1) == '.' ){
				qty = '0'+qty;
			}

			if(cartData != undefined){
				if(loadName+'_'+cardId in cartData){
					cartData[loadName+'_'+cardId] = (qty).toString()
					setCartData(cartData)
				}
			}
			qty = parseFloat(qty);

			AsyncStorage.getItem('selectedBuyerRouteId').then((buyerId) => {
				selectedLoadArray[loadName+'__'+cardId] = {'value' : qty,'cardId' : cardId,'VATstatus': false, 'buyerId' : buyerId};
				setUpdateQtyofItem(selectedLoadArray)
				
				setUpdateQtyofItems((qty));
				AsyncStorage.setItem('selectedLoadedItemsByQty' , JSON.stringify(selectedLoadArray));
			});
		}

		function addQtyItem(loadName , cardId){
			let loadedName = loadName+'__'+cardId;

			if(cartData != undefined){
				if(loadName+'_'+cardId in cartData){
					cartData[loadName+'_'+cardId] = (parseInt(cartData[loadName+'_'+cardId])+1).toString()
					// selectedLoadArray[loadedName].value = (parseInt(cartData[loadName+'_'+cardId])+1);
					setCartData(cartData)
				}
			}

			if( selectedLoadArray[loadedName] != undefined ){
				selectedLoadArray[loadedName].value = (parseFloat(selectedLoadArray[loadedName].value)+1);
				setUpdateQtyofItem(selectedLoadArray)

				AsyncStorage.setItem('selectedLoadedItemsByQty' , JSON.stringify(selectedLoadArray));
			}else{
				AsyncStorage.getItem('selectedBuyerRouteId').then((buyerId) => {
					selectedLoadArray[loadName+'__'+cardId] = {value: 1 ,'cardId' : cardId,'VATstatus': false, 'buyerId' : buyerId};

					setUpdateQtyofItem(selectedLoadArray)
					AsyncStorage.setItem('selectedLoadedItemsByQty' , JSON.stringify(selectedLoadArray));
				});
			}
			
			if( UpdateQtyofItems == undefined ){
				setUpdateQtyofItems(1);
			}else{
				setUpdateQtyofItems((UpdateQtyofItems+1));
			}

		}

		function minusQtyItem(loadName , cardId){
			let loadedName = loadName+'__'+cardId;
			
			if(cartData != undefined){
				if(loadName+'_'+cardId in cartData){
					cartData[loadName+'_'+cardId] = (parseInt(cartData[loadName+'_'+cardId])-1).toString()

					setCartData(cartData)
				}
			}
			if( selectedLoadArray[loadedName] != undefined ){
				if( selectedLoadArray[loadedName].value != 0 ){
					selectedLoadArray[loadedName].value = (selectedLoadArray[loadedName].value-1);
					if( (selectedLoadArray[loadedName].value) <= 0 ){
						delete selectedLoadArray[loadedName];
					}
					setUpdateQtyofItem(selectedLoadArray)
				}
			}else{
				// if( (selectedLoadArray[loadedName].value-1) <= 0 ){
				// 	delete selectedLoadArray[loadedName];
				// }
				// selectedLoadArray[loadName+'__'+cardId] = {'value' : 0 ,'cardId' : cardId};
				setUpdateQtyofItem(selectedLoadArray)
			}

			if( UpdateQtyofItems == undefined ){
				setUpdateQtyofItems(0);
			}else{
				if( UpdateQtyofItems != 0){
					setUpdateQtyofItems((UpdateQtyofItems-1));
				}
			}
		
			AsyncStorage.setItem('selectedLoadedItemsByQty' , JSON.stringify(selectedLoadArray));
		}

		return (
			(qty == 'true') ?
				<View>

					<View style={[(win.width > 550) ? styles.cardBackgroundtab : styles.cardBackground, {backgroundColor: backgroundColor} , styleData]}>
						<View style={styles.itemImageContainer}>
							<Image source={{uri:imageUrl}} style={(win.width > 550) ? styles.itemImageTab : styles.itemImage} />
							<Text style={styles.cardName ,{height: 'auto',fontSize: 12,marginTop: 6,marginBottom: 6}} allowFontScaling={false}>
								{ ((cardName).length > 15) ? 
									(((cardName).substring(0,15-3)) + '...') : 
									cardName }
							</Text>
						</View>
						<View style={{flex:1 ,flexDirection: 'row', backgroundColor: '#ebedf087',width: '100%' }} >
							<View  style={ (win.width > 550) ? {width: '20%'} : {width: '20%'} }>
								<Pressable onPress={ () => { minusQtyItem( loadName , cardId ) } } style={{backgroundColor: 'red',padding:8, height: 50}}>
									<Icon name='minus' type='font-awesome' style={(win.width > 500) ? {fontSize: 20,color: 'white', textAlign: 'center'} : {fontSize: 12,color: 'white', textAlign: 'center'}} />
								</Pressable>
								{/* <Button title="clickme" onPress={() => {clickme()}}></Button> */}
							</View>
							<View style={ (win.width > 550) ? {width: '60%'} : {width: '60%'} }>
								<TextInput keyboardType="numeric"  
									defaultValue={ (cartData != undefined && cartData[loadName+'_'+cardId] != undefined) ? cartData[loadName+'_'+cardId] : (UpdateQtyofItems != undefined) ? UpdateQtyofItems.toString() :'0'} 
									key={cardId} placeholder="Qty" style={{textAlign: 'center',color: '#000'}} onChange={(value) => { (value.nativeEvent.text != '') ? DirectUpdateQTY(loadName , cardId , value.nativeEvent.text) : '' }} />
							</View>
							<View  style={ (win.width > 550) ? {width: '20%'} : {width: '20%'} }>
								<Pressable onPress={ () => { addQtyItem( loadName , cardId ) } } style={{backgroundColor: Colors.primary,padding:7, height: 50}}>
									<Icon name='plus' type='font-awesome' style={(win.width > 500) ? {fontSize: 20,color: 'white', textAlign: 'center'} : {fontSize: 12,color: 'white', textAlign: 'center'}} />
								</Pressable>
							</View>
						</View>
					</View>
				</View>
			: 
				<Pressable onPress={onPress} style={[(win.width > 550) ? styles.cardBackgroundtab : styles.cardBackground, {backgroundColor: backgroundColor} , styleData]}>
					<View style={styles.itemImageContainer}>
						<Image source={{uri:imageUrl}} style={(win.width > 550) ? styles.itemImageTab : styles.itemImage} />
					</View>

					<View style={styles.cardFooterBackground}>
						<Text style={styles.cardName} allowFontScaling={false}>
							{ ((cardName).length > 15) ? 
								(((cardName).substring(0,15-3)) + '...') : 
								cardName }</Text>
					</View>
				</Pressable>

		);
	};

	const styles = StyleSheet.create({
		cardName: {
			color: Colors.dark,
			fontWeight: 'bold',
			fontSize: 12,		
		},
		cardFooterBackground: {
			backgroundColor: '#ebedf087',
			height: 40,
			width: '100%',
			position: 'absolute',
			bottom: 0,
			alignItems: 'center',
			justifyContent: 'center',
			borderBottomRightRadius: 10,
			borderBottomLeftRadius: 10,
			flexDirection: 'row',
			padding: 8,
		},
		iconBackground: {
			alignItems: 'center',
			backgroundColor: Colors.secondry,
			height: 60,
			width: 60,
			resizeMode: 'stretch',
			position: 'absolute',
			top: 15,
			justifyContent: 'center',
			borderRadius: 100,
		},
		cardBackgroundtab: {
			width: widthToDp('25%'),
			height: heightToDp('12%'),
			borderRadius: 8,
			marginTop: 20,
			marginHorizontal: 5,
			alignItems: 'center',
			elevation: 2,
			overflow: 'hidden',
			height: 230
		},
		cardBackground: {
			width: widthToDp('30%'),
			height: heightToDp('22%'),
			borderRadius: 8,
			marginTop: 15,
			marginHorizontal: 5,
			alignItems: 'center',
			elevation: 2,
			overflow: 'hidden',
			height: 150
		},
		itemImage: {
			// flex: 1,
			height: heightToDp('10.7%'),
			width: widthToDp('20%'),
			// resizeMode: 'contain',
		},
		itemImageTab: {
			// flex: 1,
			height: heightToDp('12.7%'),
			width: widthToDp('25%'),
			// resizeMode: 'contain',
		},
		itemImageContainer: {
			justifyContent: 'center',
			alignItems: 'center',
		},
		
	});