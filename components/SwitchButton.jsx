import React, { useState } from 'react';
import { SafeAreaView, Text, Switch, View } from 'react-native';

const SwitchButton = ({onSwitch, isEnabled}) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Switch
        trackColor={{ false: '#767577', true: '#bdf1e5' }}
        thumbColor={isEnabled ? '#14c3b9' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={onSwitch}
        value={isEnabled}
        />
    </View>
  );
};

export default SwitchButton;
