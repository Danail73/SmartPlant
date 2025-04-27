import { View, Text, Image, Switch } from 'react-native'
import React from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const StatusCard = ({ label, labelStyles, value, valueStyles,
  showSwitch, iconSource, iconStyles, bonusIconStyles, otherStyles, bonusContainerStyles, onSwitchChange, valueContainerStyles, colorSwitch, isEnabled, invert, ...params }) => {
  return (
    <View className={`w-[140px] h-[160px] bg-notFullWhite m-2 p-4 rounded-xl items-center justify-center flex-col ${otherStyles}`} style={bonusContainerStyles}>

      {/* icon for the Status Card */}
      {iconSource && (
        <Image
          source={iconSource}
          className={`w-14 h-14 ${iconStyles}`}
          style={[{ tintColor: colorSwitch ? '#3bc492' : '#98989a' }, bonusIconStyles]}
          resizeMode="contain"
          testID='image-test'
        />
      )}
      <View className=" items-center justify-center">
        {invert && (
          <View className=" items-center" style={valueContainerStyles}>
            <Text className={`font-bold text-gray-statusCard ${valueStyles}`} style={{ fontSize: hp('2%') > 18 ? 18 : hp('2%') }}>{value}</Text>
            <Text className={`font-bold text-gray-statusCard`} style={{ fontSize: hp('2%') > 18 ? 18 : hp('2%') }}>{label}</Text>
          </View>
        )}

        {/* switch for lamp and water pump */}
        {showSwitch && (
          <View className="flex-row items-center ">
            <Text className="font-bold text-gray-statusCard" style={{ fontSize: hp('2%') > 18 ? 18 : hp('2%'), marginRight: hp('0.5%') }}>OFF</Text>
            <Switch
              trackColor={{ false: '#767577', true: '#bdf1e5' }}
              thumbColor={isEnabled ? '#14c3b9' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={onSwitchChange}
              value={isEnabled}
              testID='switch-toggle'
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