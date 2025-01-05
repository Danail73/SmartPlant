import { View, Text , Image} from 'react-native'
import React from 'react'
import SwitchButton from './SwitchButton'

const StatusCard = ({label, labelStyles, value, valueStyles, 
    showSwitch, iconSource, iconStyles, otherStyles, onSwitchChange, colorSwitch, isEnabled, invert, ...params}) => {
  return (
    <View className={`w-[140px] h-[160px] bg-notFullWhite m-2 p-4 rounded-xl items-center justify-center flex-col ${otherStyles}`}>
      
      {iconSource && (
        <View className="h-13">
          {(showSwitch && !colorSwitch) ? (
            <Image
              source={iconSource} 
              className={`w-14 h-14 ${iconStyles}`}
              style={{tintColor: '#98989a' }}
              resizeMode="contain"
            />
          ) : (
            <Image
              source={iconSource} 
              className={`w-14 h-14 ${iconStyles}`}
              style={{tintColor: '#3bc492' }}
              resizeMode="contain"
            />
          )}
        </View>
      )}

      {!showSwitch && (
        <View className=" items-center justify-center pt-6">
          <Text className={`text-lg font-bold text-gray-statusCard ${valueStyles}`}>{value}</Text>
          <Text className={`text-lg font-bold text-gray-statusCard`}>{label}</Text>
        </View>
      )}

      {showSwitch && (
        <View className="items-center justify-center flex-col h-26">
          {!invert ? (
            <View className="items-center justify-center flex-col">
              <View className="flex-row items-center">
                <Text className="text-lg font-bold text-gray-statusCard mr-2">OFF</Text>
                <SwitchButton
                  onValueChange={onSwitchChange}
                  trackColor={{ false: "#ccc", true: "#4FD1C5" }}
                  onSwitch={onSwitchChange}
                  isEnabled={isEnabled}
                />
                <Text className="text-lg font-bold text-gray-statusCard ml-2">ON</Text>
              </View>
              {value && (<Text className={`text-lg font-bold text-gray-statusCard ${valueStyles}`}>{value}</Text>)}
              <Text className={`text-lg font-bold text-gray-statusCard`}>{label}</Text>
            </View>
          ) : (
            <View className="items-center justify-center flex-col">
              {value && (<Text className={`text-lg font-bold text-gray-statusCard ${valueStyles}`}>{value}</Text>)}
              <Text className={`text-lg font-bold text-gray-statusCard mt-2 ${labelStyles}`}>{label}</Text>
              <View className="flex-row items-center">
                <Text className="text-lg font-bold text-gray-statusCard mr-2">OFF</Text>
                <SwitchButton
                  onValueChange={onSwitchChange}
                  trackColor={{ false: "#ccc", true: "#4FD1C5" }}
                  onSwitch={onSwitchChange}
                  isEnabled={isEnabled}
                />
                <Text className="text-lg font-bold text-gray-statusCard ml-2">ON</Text>
              </View>
            </View>
          )}
        </View>
      )}

      
    </View>
  )
}

export default StatusCard