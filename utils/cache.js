import AsyncStorage from '@react-native-async-storage/async-storage';

const store = async (key, value) => {
  try {
    console.log(key + ' store method Call');
    console.log(JSON.stringify(value));
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(e);
  }
};

const get = async key => {
  try {
    0;
    AsyncStorage.getAllKeys().then(keyArray => {
      AsyncStorage.multiGet(keyArray).then(keyValArray => {
        let myStorage = {};
        for (let keyVal of keyValArray) {
          myStorage[keyVal[0]] = keyVal[1];
        }

        console.log('CURRENT STORAGE: ', myStorage);
      });
    });

    const value = await AsyncStorage.getItem(key);
    const data = value != null ? JSON.parse(value) : null;

    console.log(key + ' get method Called');
    console.log(data);

    return value != null ? JSON.parse(value) : null;
  } catch (e) {
    console.log(e);
  }
};

export default {
  store,
  get,
};
