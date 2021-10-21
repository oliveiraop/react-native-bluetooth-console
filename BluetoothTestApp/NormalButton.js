import React from 'react'
import { Text, Touchable, TouchableHighlight, TouchableNativeFeedback, View } from 'react-native'

export default function NormalButton(props) {
    return(
        <View>
            <TouchableHighlight onPress={props.onPress} disabled={props.disabled}>
                <View style={{
                    padding: 15,
                    alignItems: 'center',
                    borderRadius: 10,
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: 'gray',
                }}>
                    <Text style={props.textStyle}>{props.title}</Text>
                </View>
            </TouchableHighlight>
        </View>
    )
}