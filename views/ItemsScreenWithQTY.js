import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {
  checkIfBuyerHasVAT,
  getItemsByVehicleAndLoads,
  imagePrefix,
} from '../api/apiService';
import {Colors} from '../components/Colors';
import ItemCard from '../components/ItemCard';
import MainScreen from '../layout/MainScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

let itemList = [];

function renderSectionList({items}) {
  return null;
}

export default function ItemsScreenWithQty({navigation, route}) {
  const [activeIndicatorLoader, setActiveIndicatorLoader] = useState(true);
  const [activeIndicatorLoaderImages, setActiveIndicatorLoaderImages] =
    useState(false);
  const [ListItems, setListItems] = useState();
  const [requestSent, setRequestSent] = useState(false);
  const [hasUndeliveredItems, setHasUndeliveredItems] = useState(false);
  const [selectedItemsFromLoads, setSelectedItemsFromLoads] = useState();
  const [customerName, setCustomerName] = useState();
  const [myBuyerId, setMyBuyerId] = useState();
  const windowWidth = Dimensions.get('window').width;

  useEffect(() => {
    // getPendingOrderResponce();
  }, []);

  const renderCard = ({item}) => {
    return (
      <View>
        <FlatList
          data={item.list}
          numColumns={4}
          initialNumToRender={2}
          renderItem={({item}) => {
            return (
              <View style={{}}>
                <ItemCard
                  selectedData={item => {
                    setSelectedItemsFromLoads(item);
                  }}
                  qty="true"
                  backgroundColor="#fff"
                  loadName={item.loadname}
                  cardId={item.id}
                  salePrice={item.sale_price}
                  cardName={item.name}
                  imageUrl={imagePrefix + '' + item.img}
                />
              </View>
            );
          }}
          keyExtractor={item.id}
        />
      </View>
    );
  };

  // const [listUndelivered , setListUndelivered] = useState();
  useEffect(() => {
    if (route.params != undefined) {
      if (route.params.mySelectedItems != undefined) {
        setSelectedItemsFromLoads(route.params.mySelectedItems);
      }
    }
    AsyncStorage.getItem('selectedBuyerRouteName').then(buyerName => {
      setCustomerName(buyerName);
    });

    AsyncStorage.getItem('user_id').then(userId => {
      if (userId != 13 && userId != '13') {
      }
    });
    // setListUndelivered(undeliveredItems)

    AsyncStorage.setItem('selectedLoadedItemsByQty', JSON.stringify({}));

    AsyncStorage.getItem('selectedBuyerRouteId').then(buyerId => {
      checkIfBuyerHasVAT(buyerId).then(res => {
        // AsyncStorage.setItem('currentVATstatus' , status);
        AsyncStorage.setItem('VATStatus', res.data.message.toString());
      });
    });
    getItems();
  }, [route?.params]);

  function getItems() {
    AsyncStorage.getItem('selectedVehicleNo').then(value => {
      let vehicheId = value;
      AsyncStorage.getItem('selectedLoadsNumbers').then(value => {
        let load_numbers = value;
        getItemsByVehicleAndLoads(vehicheId, load_numbers).then(
          res => {
            setListItems(res?.data?.data);
            setActiveIndicatorLoader(false);
            setActiveIndicatorLoaderImages(true);
            setTimeout(() => {
              setActiveIndicatorLoaderImages(false);
            }, 8000);
          },
          err => {
            setActiveIndicatorLoader(false);
          },
        );
      });
    });
  }

  const updateCart = status => {
    setHasUndeliveredItems(false);
    AsyncStorage.setItem('UndeliveredItemsInCart', status);
  };
  return (
    <MainScreen>
      {activeIndicatorLoaderImages ? (
        <View
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            backgroundColor: '#ededed',
            zIndex: 99999,
            justifyContent: 'center',
            textAlign: 'center',
            opacity: 0.8,
          }}>
          <Text style={{textAlign: 'center', fontSize: 20}}>
            Please Wait, Fetching Images
          </Text>
          <ActivityIndicator size="large" color="#6c33a1" />
        </View>
      ) : null}

      <ScrollView vertical="true">
        <Text
          style={{color: Colors.primary, textAlign: 'center', fontSize: 18}}>
          Customer: {customerName}
        </Text>

        {activeIndicatorLoader == true ? (
          <ActivityIndicator size="large" color="#6c33a1" />
        ) : (
          <Text />
        )}

        {ListItems != undefined ? (
          Object.keys(ListItems).map((key, value) => {
            return (
              <View key={key} style={{marginBottom: 85}}>
                <Text
                  style={{
                    fontSize: 18,
                    paddingLeft: 30,
                    backgroundColor: Colors.primary,
                    color: 'white',
                    textAlign: 'center',
                    paddingVertical: 5,
                    marginLeft: 10,
                  }}>
                  {key}
                </Text>
                {Object.keys(ListItems[key]).map((k, v) => {
                  return (
                    <View key={k}>
                      <Text
                        key={k}
                        style={{
                          paddingHorizontal: 13,
                          paddingVertical: 10,
                          backgroundColor: '#ededed',
                          fontSize: 18,
                          marginTop: 15,
                        }}>
                        {k}
                      </Text>
                      <View
                        key={v}
                        style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          justifyContent: 'space-evenly',
                        }}>
                        {Object.keys(ListItems[key][k]).map((ke, val) => {
                          return (
                            <ItemCard
                              selectedData={data => {
                                setSelectedItemsFromLoads(data);
                              }}
                              key={ke}
                              qty="true"
                              backgroundColor="#fff"
                              loadName={key}
                              cardId={ListItems[key][k][ke].id}
                              cardName={ListItems[key][k][ke].name}
                              imageUrl={
                                imagePrefix + '' + ListItems[key][k][ke].img
                              }
                            />
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })
        ) : (
          <Text />
        )}
      </ScrollView>
      <Pressable
        onPress={() => {
          navigation.push('AddQuantity', {
            mySelectedItems: selectedItemsFromLoads,
          });
        }}
        style={{
          bottom: 10,
          position: 'absolute',
          justifyContent: 'center',
          padding: 10,
          height: 70,
          width: 70,
          backgroundColor: Colors.primary,
          borderRadius: 100,
          right: 10,
        }}>
        <Icon
          name="arrow-right"
          type="font-awesome"
          style={{fontSize: 25, color: 'white', textAlign: 'center'}}
        />
      </Pressable>
    </MainScreen>
  );
}

const styles = StyleSheet.create({
  itemsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    backgroundColor: Colors.white,
    padding: 8,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    height: 130,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: 'center',
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
  },
  header: {
    fontSize: 26,
    backgroundColor: '#fff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
  },
});
