import React, { useState, useEffect, useCallback } from 'react'
import { Platform, Text, View, ScrollView, StyleSheet, RefreshControl, Dimensions } from 'react-native'
import Constants from 'expo-constants'
import * as Location from 'expo-location'
import Header from './components/Header'
import ItemsComponent from './components/ItemsComponent'

const wait = timeout => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}

export default function App() {
  const [location, setLocation] = useState(null)
  const [data, setData] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    setErrorMsg(null)
    getData()
    wait(2000).then(() => setRefreshing(false))
  }, []);

  useEffect(() => {
    getData()
  }, []);

  const getData = async () => {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      setErrorMsg('Dispositivo no compatible!')
      return;
    }
    let { status } = await Location.requestPermissionsAsync()
    if (status !== 'granted') {
      setErrorMsg('Permisos denegados!')
      return;
    }
    let { coords, altitude } = await Location.getCurrentPositionAsync({ accuracy: 6 })
    await setLocation(coords)
    if (coords !== null && errorMsg === null) {
      getDataFromOpenWeatherMaps(coords)
    }
  }

  const getDataFromOpenWeatherMaps = async (location) => {
    await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&units=metric&appid=fb228059cd79a2e758028fcd08f5d067`)
      .then((response) => response.json())
      .then((json) => {
        setData(json)
      })
      .catch((error) => {
        setErrorMsg('El servidor no responde, espere un par de minutos.')
      })
  };

  let text = 'Buscando..'
  let [city, temp, tempSensation, humidity, pressure, wind] = ''
  let tempMax = ''
  let tempMin = ''
  let height = 0

  if (errorMsg) {
    text = errorMsg
  }
  else if (data) {
    text = ''
    city = data.name
    temp = data.main.temp
    tempSensation = data.main.feels_like
    humidity = data.main.humidity
    pressure = data.main.pressure
    tempMax = data.main.temp_max
    tempMin = data.main.temp_min
    wind = data.wind.speed
    height = location.altitude === null ? 0 : location.altitude.toFixed(2)
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Header />
        <Text>{text}</Text>
        <ItemsComponent value={city} />
        <ItemsComponent text={'Temperatura: '} value={temp} magnitude={'ºC'} />
        <ItemsComponent text={'Sensación: '} value={tempSensation} magnitude={'ºC'} />
        <ItemsComponent text={`Max: ${tempMax}ºC | Min: ${tempMin}ºC`} />
        <ItemsComponent text={'Humedad: '} value={humidity} magnitude={'%'} />
        <ItemsComponent text={'Presión: '} value={pressure} magnitude={'Pa'} />
        <ItemsComponent text={'Viento: '} value={wind} magnitude={'m/s'} />
        <ItemsComponent text={'Altura: '} value={height} magnitude={'m'} />
      </ScrollView>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9E9783',
    marginTop: Constants.statusBarHeight,
  },
  scrollView: {
    alignItems: 'center',
    justifyContent: 'space-between',
    height: Dimensions.get('screen').height - 80
  },
});