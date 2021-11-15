import React , { useEffect , useState} from 'react';
import { ActivityIndicator } from 'react-native';
import {View, Text, StyleSheet,Dimensions} from 'react-native';
import {Icon, Input, ListItem} from 'react-native-elements';

export default function ItemComponent({defaultImage , listItems , sortedItm , buyerId}) {
	const [activeIndicatorLoader , setActiveIndicatorLoader] = useState(true);
	const [sortedData , setSortedData] = useState();

    const changeText = ( text , movedBuyerId ) => {
        if(  text != '' ){
            listItems.splice( listItems.indexOf(movedBuyerId) , 1)
            let checkIfAvaiable = listItems.indexOf(movedBuyerId);

            let changedOrder = (text - 1);
            let currentReplacebalebuyerId = listItems[changedOrder];
            let beforeArray = [];
            let replacedArray = [];
            let afterArray = [];
            if( text > listItems.length ){
                alert(" Max Number will be "+listItems.length);
                return false
            }
            for(let i = 0 ; i < listItems.length ; i++){

                if( i == changedOrder ){
                    replacedArray.push( movedBuyerId )
                    replacedArray.push(currentReplacebalebuyerId)
                }

                if(i < changedOrder) {
                    beforeArray.push( listItems[i] )
                }
                if(i > changedOrder) {
                    afterArray.push( listItems[i] )
                }
            }
            const contacttwo = beforeArray.concat(replacedArray)
            const contactthree = contacttwo.concat(afterArray)

            setSortedData(contactthree)
            sortedItm(contactthree)
        }	
    }
    


	return (
			<Input
                allowFontScaling={false}
                onChangeText={(text) => {
                    changeText( text , buyerId)
                }}
                // onBlur={handleBlur('username')}
                // value={values.username}
                keyboardType="number-pad"
                defaultValue={defaultImage}
                style={{backgroundColor: 'white', width: 60}}
            />
	);							
}

const styles = StyleSheet.create({
  
});
