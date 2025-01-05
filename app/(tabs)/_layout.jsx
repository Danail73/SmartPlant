import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Tabs } from 'expo-router';

import { icons } from '../../constants';
import { LinearGradient } from 'expo-linear-gradient';

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View
      className="items-center justify-center gap-1 min-w-[50px]
      flex-col"
      style={{paddingTop: focused ? 1 : 11}}
    >
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        className="w-8 h-8"
      />
      {!focused ? (
        <Text
        className={`${focused ? 'font-psemibold' : 'font-pregular'} text-xs`}
        style={{ color: color }}
      >
        {name}
      </Text>
      ) : null}
    </View>
  );
};

const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#2b65e3',
          tabBarInactiveTintColor: '#BFBFBF',
          tabBarStyle: {
            position: 'absolute',
            bottom: 30,
            marginHorizontal: 38,
            width: '80%',
            alignSelf: 'center',
            backgroundColor: '#f2f9f1',
            borderRadius: 40,
            height: 70,
            flexDirection: 'row',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 5, 
            paddingHorizontal: 20,
            paddingTop:12,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          style={{paddingTop:20}}
          options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.home}
                color={color}
                name="Home"
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="create"
          options={{
            title: 'Create',
            headerShown: false,
            tabBarButton: (props) => (
              <TouchableOpacity
                {...props}
                style={{
                  position: 'absolute',
                  bottom:'60%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                  width: 60,
                  height: 60,
                  borderRadius: 35,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.1,
                  shadowRadius: 10,
                  elevation: 5,
                }}
              >
                <LinearGradient
                    colors={["#fdb442", "#f69f2c"]} 
                    start={[0,0]} 
                    end={[1,1]} 
                    style={{borderRadius:30}}
                    className="items-center justify-center w-full h-full "
                >
                    <Image
                        source={icons.plus}
                        resizeMode="contain"
                        className="w-8 h-8"
                        style={{ tintColor: '#f2f9f1' }}
                    />
                </LinearGradient>
              </TouchableOpacity>
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          style={{paddingTop: 20}}
          options={{
            title: 'Profile',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.profile}
                color={color}
                name="Profile"
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

export default TabsLayout;
