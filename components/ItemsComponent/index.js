import React from 'react'
import { View, Text } from 'react-native'
import styles from './styles'

export default function ItemsComponent(props) {
    const {text, value, magnitude} = props
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{text}{value}{magnitude}</Text>
        </View>
    )
}
