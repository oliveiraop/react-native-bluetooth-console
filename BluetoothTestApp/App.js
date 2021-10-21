/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useRef, useState} from 'react';
import RNBluetoothClassic, {
  BluetoothDevice,
  BluetoothEventType
} from 'react-native-bluetooth-classic';
import {
  FlatList,
  PermissionsAndroid,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import NormalButton from './NormalButton';

const Section = ({children, title}) => {
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? 'white' : 'black',
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? 'white' : 'black',
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

function App() {
  const [available, setAvailable] = useState(false)
  const [error, setError] = useState('er')
  const [obs, setObs] = useState('er')
  const [paired, setPaired] = useState([])
  const [selected, setSelected] = useState('-1')
  const [bluetoothLog, setBluetoothLog] = useState([])
  const [bluetoothSend, setBluetoothSend] = useState('')
  const [bluetoothDvc, setBluetoothDvc] = useState({})
  const [connection, setConnection] = useState('connect')
  const [readSubscription, setReadSubscription] = useState({})
  const scrollViewRef = useRef();
  const textInputRef = useRef();

  const backgroundStyle = {
    backgroundColor: 'white',
  };

  // Função para garantir permissões no android
  async function permission() {
    try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Permission Bluetooth',
        message: 'Requirement for Bluetooth',
        buttonNeutral: 'Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
      setError(granted)
    } catch(err) {
      setError(JSON.stringify(err))
    }
  }

  function log(str) {
    if (typeof str == 'string') {
      str = str.replace("\n", "\\n")
      str = str.replace("\r", "\\r")
      //setBluetoothLog((state) => {return state.push((new Date().toLocaleTimeString())+': '+str+'\n')})
      setBluetoothLog((state) => {return [...state, ((new Date().toLocaleTimeString())+': '+str)]})
    } else {
      //setBluetoothLog((state) => {return state.push((new Date().toLocaleTimeString())+': '+'not a string'+'\n')})
      setBluetoothLog((state) => {return [...state, ((new Date().toLocaleTimeString())+': '+'not a string')]})
    }
  }
  
  async function onReceivedData(BluetoothReadEvent) {
    log(BluetoothReadEvent.data)
    }
  
  async function onDeviceConnected(BluetoothReadEvent) {
    console.log(BluetoothReadEvent)
    log(BluetoothReadEvent.data)
  }
  // atualizar o console do bluetooth
  async function sendBluetooth() {
    try{
      var teste = await bluetoothDvc.isConnected()
      if (teste){
        if (bluetoothSend != '') {
          log(bluetoothSend)
          bluetoothDvc.write(bluetoothSend)
        }
      }
    } catch(err) {
      log(err)
      console.log(err)
    }
  }

  function clearLog(){
    setBluetoothLog([])
  }

  async function connect() {
    try {
      var dvc = paired.find((data) => data.id === selected)
      if (dvc) {
        setBluetoothDvc(dvc)
      }
      var teste = await dvc.isConnected()
      if (!teste) {
        log('connecting '+ dvc.name + ' address: ' + dvc.address)
        await dvc.connect()
        refreshAvailable()
        //const readSubscription = dvc.onDataReceived((data) => this.onReceivedData(data));
        setReadSubscription(dvc.onDataReceived((data) => onReceivedData(data)));
      } else {
        log('disconnecting '+ dvc.name + ' address: ' + dvc.address)
        readSubscription.remove()
        await dvc.disconnect()
        setConnection('connect')
        refreshAvailable()
      }
    } catch(err) {
      log(' error' +': '+err)
      console.log(err)
    }
  }

  // da um refresh para mostrar os dispositivos pareados
  async function refreshAvailable() {
    setObs('trying')
    try {
      var avail = await RNBluetoothClassic.isBluetoothAvailable();
      setAvailable(avail)
      var connected = await RNBluetoothClassic.getConnectedDevices()
      if (connected.length > 0) {
        setPaired(connected)
        setObs('connected')
        setConnection('disconnect')
      } else {
      var pair = await RNBluetoothClassic.getBondedDevices();
        const connectionSubs = RNBluetoothClassic.onDeviceConnected(onDeviceConnected)
        setPaired(pair)
        setObs('pair')
      }
    } catch(err) {
      setError(JSON.stringify(err))
      console.log(err)
    }
  }

  return (
    <View style={backgroundStyle}>
    <ScrollView nestedScrollEnabled>
    <ScrollView nestedScrollEnabled>
          <Text style={styles.sectionTitle}>Bluetooth App Test</Text>
          <Text style={styles.sectionDescription}>Bluetooth: {available.toString()}</Text>
          <Text style={styles.sectionDescription}>Msg: {error}</Text>
          <Text style={styles.sectionDescription}>Obs: {obs}</Text>
          {paired? paired.map((obj) => {
              var text = '';
              Object.entries(obj).forEach(([key, value]) => {
                text = text + key + ': '
                if (typeof value === 'object') {
                text = text + Object.entries(value).forEach(([key2, value2]) => {return ' ' + key2 + ' ' + JSON.stringify(value2) + ' '})
                } else {
                  text = text + value + ' '
                }
                text = text + '\n';
              }); 
              //var text = JSON.stringify(obj)
              return (<TouchableNativeFeedback key={obj.id} onPress={() => {
                if (selected === obj.id) {
                  setSelected('-1')
                } else {
                  setSelected(obj.id)
                }
                }}>
                <View style={{
                borderColor: 'gray',
                borderWidth: 2,
                width: '100%',
                alignSelf: 'center',
                alignItems: 'center',
                borderRadius: 10,
                margin: 2,
                backgroundColor: selected === obj.id ? 'gray' : 'white'
              }}>
                  <Text>{text}</Text>
                </View>
              </TouchableNativeFeedback>
              );
            }) : 'not'}
          <View style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            marginBottom: 10,
            alignSelf: 'center',
          }}>
            <NormalButton onPress={() => {refreshAvailable()}} title='refresh'/>
            <NormalButton onPress={() => {permission()}} title='permission'/>
            <NormalButton onPress={() => {connect()}} title={connection}/>
          </View>
      </ScrollView>
      <ScrollView 
      nestedScrollEnabled
      style={{
        backgroundColor: 'gray',
        flex: 1,
        minHeight: 200,
        maxHeight: 200,
      }}
      ref={scrollViewRef}
      onContentSizeChange={() => {scrollViewRef.current.scrollToEnd({ animated: true})}}
      >
        <View style={{
              backgroundColor: 'gray',
            }}>
              <View>
                {bluetoothLog.map((obj, index) => {return (<Text key={index}>{obj}</Text>)})}
              </View>
        </View>
      </ScrollView>
      <View style={{
        flexDirection: 'row'
      }}>
      <TextInput 
          ref={textInputRef}
          blurOnSubmit={false}
					style={{
            borderRadius: 10,
            borderColor: 'gray',
            borderWidth: 2,
            backgroundColor: 'black',
            alignItems: 'center',
            padding: 5,
            flex: 1,
          }}
          onSubmitEditing={() => {
              sendBluetooth()
              textInputRef.current.focus()
          }}
					placeholder="Send"
					onChangeText={setBluetoothSend}
					value={bluetoothSend}
			/>
      <NormalButton onPress={() => {
            sendBluetooth()
            textInputRef.current.focus()  
          }} title='send'/>
      </View>
      <NormalButton onPress={clearLog} title='clear'/>
      </ScrollView>
    </View>
    
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
