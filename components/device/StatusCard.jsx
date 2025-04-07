import { View, Text, Image } from 'react-native'
import React from 'react'
import SwitchButton from '../SwitchButton'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const StatusCard = ({ label, labelStyles, value, valueStyles,
  showSwitch, iconSource, iconStyles, bonusIconStyles, otherStyles, bonusContainerStyles, onSwitchChange, valueContainerStyles, colorSwitch, isEnabled, invert, ...params }) => {
  return (
    <View className={`w-[140px] h-[160px] bg-notFullWhite m-2 p-4 rounded-xl items-center justify-center flex-col ${otherStyles}`} style={bonusContainerStyles}>

      {iconSource && (
        <Image
          source={iconSource}
          className={`w-14 h-14 ${iconStyles}`}
          style={[{ tintColor: colorSwitch ? '#3bc492' : '#98989a' }, bonusIconStyles]}
          resizeMode="contain"
        />
      )}
      <View className=" items-center justify-center">
        {invert && (
          <View className=" items-center" style={valueContainerStyles}>
            <Text className={`font-bold text-gray-statusCard ${valueStyles}`} style={{ fontSize: hp('2%') > 18 ? 18 : hp('2%') }}>{value}</Text>
            <Text className={`font-bold text-gray-statusCard`} style={{ fontSize: hp('2%') > 18 ? 18 : hp('2%') }}>{label}</Text>
          </View>
        )}
        {showSwitch && (
          <View className="flex-row items-center ">
            <Text className="font-bold text-gray-statusCard" style={{ fontSize: hp('2%') > 18 ? 18 : hp('2%'), marginRight: hp('0.5%') }}>OFF</Text>
            <SwitchButton
              onValueChange={onSwitchChange}
              trackColor={{ false: "#ccc", true: "#4FD1C5" }}
              onSwitch={onSwitchChange}
              isEnabled={isEnabled}
            />
            <Text className="font-bold text-gray-statusCard" style={{ fontSize: hp('2%') > 18 ? 18 : hp('2%'), marginLeft: hp('0.5%') }}>ON</Text>
          </View>
        )}
        {!invert && (
          <View className=" items-center" style={valueContainerStyles}>
            <Text className={`font-bold text-gray-statusCard ${valueStyles}`} style={{ fontSize: hp('2%') > 18 ? 18 : hp('2%') }}>{value}</Text>
            <Text className={`font-bold text-gray-statusCard`} style={{ fontSize: hp('2%') > 18 ? 18 : hp('2%') }}>{label}</Text>
          </View>
        )}
      </View>



    </View>
  )
}

export default StatusCard