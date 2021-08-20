import React, {useState,useEffect} from 'react';
import {ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, TouchableHighlight, View} from 'react-native';
import {Icon, ListItem} from 'react-native-elements';
import {Colors} from '../components/Colors';
import MainScreen from '../layout/MainScreen';
import {heightToDp} from '../utils/Responsive';
// import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPriorityDrivers  } from '../api/apiService';
import { Text } from 'react-native';
// import { BoardRepository , Board } from 'react-native-draganddrop-board'

const data = [
    {
        id: 1,
        name: "Today's routes",
        rows: [
            {
                id: '1',
                name: 'Analyze your audience',
                // description: 'Learn more about the audience to whom you will be speaking'
            },
   
        ]
    }
]

    export default function DashboardRoutes({navigation , route}) {
        const [coord , setCoord] = useState({
            latitude: 31.6206,
            longitude: 74.8801,
            latitudeDelta: 1,
            longitudeDelta: 1,
        })
        const [listRoutes , setListRoutes] = useState();
        const [listRoute , setListRoute] = useState();
        const [boardRepo , setBoardRepo] = useState();
        const [hasRoutes , setHasRoutes] = useState(false);
        // let boardRepository = new BoardRepository(route.params.myRoutes);
        useEffect(() => {
            AsyncStorage.removeItem('selectedLoadedItemsByQty');
            AsyncStorage.removeItem('cartItems')
            AsyncStorage.removeItem('itemsAddedInCart')
            AsyncStorage.setItem('selectedLoadedItemsByQty',JSON.stringify({}));
            getRoutes()
            // AsyncStorage.getItem('location').then( (data) => {
            //     let currentLoc = JSON.parse(data)
            //     setCoord({  latitude: currentLoc.latitude,
            //                 longitude: currentLoc.longitude,
            //                 latitudeDelta: 1,
            //                 longitudeDelta: 1
            //             })
            // })
            

            return ( AsyncStorage.removeItem('selectedInvoiceId'))
        } , [])

        function getRoutes(){
            AsyncStorage.getItem('selectedRoute').then((routeId) => {
                AsyncStorage.getItem('user_id').then((driverid) => {
                    getPriorityDrivers(driverid , routeId).then((res) => {
                        setHasRoutes(true)
                        
                        setListRoute(res.data.data);
                    } , (err) =>{
    
                    })
                }) 
            })	
        }

        const [coordinates ,setcoordinates] = useState([
            {
                
            },
            {
                latitude: 31.6206,
                longitude: 74.8801,
                latitudeDelta: 1,
                longitudeDelta: 1,
            }
        ]);
        const [active, setActive] = new useState();

        const listClicked = (listData) => {
            setActive(listData.id);
            AsyncStorage.setItem( 'selectedBuyerRouteId', (listData.id).toString());
            // setcoordinates([{} ,{    latitude: parseFloat(listData.latitude),
            //                         longitude: parseFloat(listData.longitude),
            //                         latitudeDelta: 1,
            //                         longitudeDelta: 1
            //                     }])


        };

        return (
          <MainScreen>
            <View style={styles.container}>
              {/* <Board
                            boardRepository={boardRepository}
                            open={() => {}}
                            onDragEnd={() => {}}
        cl                    isWithCountBadge={ true }
                            boardBackground="no"
                        /> */}
              <View style={styles.nextButton}>
                <Pressable
                  onPress={() => {
                    if (active != undefined) {
                      AsyncStorage.setItem(
                        'selectedLoadedItemsByQty',
                        JSON.stringify({}),
                      );
                      navigation.push('ItemsScreenWithQty');
                    } else {
                      alert('Please select any buyer');
                    }
                  }}>
                  <Icon
                    name="chevron-right"
                    type="font-awesome"
                    color="white"
                    style={{padding: 10}}
                  />
                </Pressable>
              </View>
              <View style={{padding: 0, margin: 0}}>
                <ScrollView>
                  {hasRoutes != false && listRoute != undefined ? (
                    listRoute.map((l, i) => (
                      <TouchableHighlight
                        key={i}
                        onPress={event => listClicked(l)}>
                        <ListItem
                          containerStyle={
                            active == l.id
                              ? styles.active
                              : l.delivery_status == 0
                              ? {backgroundColor: '#ff6363'}
                              : l.delivery_status == 1
                              ? {backgroundColor: 'white'}
                              : {backgroundColor: 'blue'}
                          }
                          key={i}
                          bottomDivider>
                          <Image
                            source={require('../assets/images/map.png')}
                            style={styles.Avatar}
                          />
                          <ListItem.Content>
                            <ListItem.Title
                              style={
                                l.delivery_status == 0
                                  ? {color: 'white'}
                                  : l.delivery_status == 1
                                  ? null
                                  : {color: 'white'}
                              }>
                              {l.name}
                            </ListItem.Title>
                            <ListItem.Title
                              style={
                                l.delivery_status == 0
                                  ? {color: 'white', fontSize: 12}
                                  : l.delivery_status == 1
                                  ? null
                                  : {color: 'white', fontSize: 12}
                              }>
                              {l.address}
                            </ListItem.Title>
                          </ListItem.Content>
                        </ListItem>
                      </TouchableHighlight>
                    ))
                  ) : (
                    <View>
                      <ActivityIndicator
                        color={Colors.primary}
                        size="large"></ActivityIndicator>
                    </View>
                  )}
                </ScrollView>
              </View>
            </View>
          </MainScreen>
        );
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            // justifyContent: 'space-between',
            // paddingBottom: '20%',
        },
        nextButton: {
            alignSelf: 'flex-end',
            alignItems: 'center',
            justifyContent:'center',
            position: 'absolute',
            width: 70,
            height: 70,
            zIndex: 9999,
            bottom: 0,
            right: 3,
            // padding: 18,
            backgroundColor: Colors.primary,
            borderRadius: 100,
            margin: 10,
        },
        refreshBottom: {
            alignSelf: 'flex-end',
            alignItems: 'center',
            justifyContent:'center',
            position: 'absolute',
            width: 70,
            height: 70,
            zIndex: 9999,
            top: 1,
            padding: 18,
            backgroundColor: 'lightgrey',
            borderRadius: 100,
            margin: 10,
        },
        list: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        Avatar: {width: 50, height: 50, resizeMode: 'contain'},
    
        listValues: {
            color: Colors.dark,
            fontSize: heightToDp('2.5%'),
            fontWeight: '800',
        },
        titleKey: {
            color: Colors.primary,
            fontSize: heightToDp('2.5%'),
            fontWeight: '900',
        },
        logoutButton: {
            position: 'relative',
            backgroundColor: Colors.redMaroon,
            paddingHorizontal: '10%',
            borderRadius: 10,
            alignSelf: 'center',
        },
        active: {
            backgroundColor: 'pink',
            color: 'white',
        },
        unactive: {
            backgroundColor: 'white',
            color: 'white',
        },
        maps: {
            width: '100%',
            height: 310
        }
    });
