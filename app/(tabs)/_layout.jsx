import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Animated, Alert } from 'react-native';
import { Tabs } from 'expo-router';
import { icons } from '../../constants';
import { LinearGradient } from 'expo-linear-gradient';
import { PaperProvider, Modal } from 'react-native-paper';
import FormField from '../../components/FormField';
import { getCurrentUser } from '../../lib/appwrite';
import { createPlant } from '../../lib/appwrite';

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View
      className="items-center justify-center gap-1 min-w-[50px]
      flex-col"
      style={{ paddingTop: focused ? 1 : 11 }}
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
  const [menuVisible, setMenuVisible] = useState(false);
  const translateY = useRef(new Animated.Value(400)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [form, setForm] = useState({
    plantId: '',
    name: '',
  });
  const [user, setUser] = useState(null);

  const getUser = async () => {
    setUser(await getCurrentUser())
  }

  const clearForm = () => {
    setForm({ plantId: '', name: '' })
  }

  const handleCreatePlant = async () => {
    if (!form.plantId || !form.name) {
      Alert.alert("You must fill all forms")
    }
    try {
      await createPlant(form.plantId, form.name, [user.$id]);
    }
    catch (error) {
      console.log(error);
    }
    finally {
      clearForm();
    }
  }

  useEffect(() => {
    getUser()
  }, [])

  const showModal = () => {
    setMenuVisible(true);
    Animated.parallel([
      Animated.timing(translateY, { toValue: 430, duration: 300, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const hideModal = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 600, duration: 300, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setMenuVisible(false);
    });
  };

  return (
    <PaperProvider>
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
            paddingTop: 12,
            zIndex: 30,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          style={{ paddingTop: 20 }}
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
                onPress={() => {
                  if (menuVisible) {
                    handleCreatePlant();
                    hideModal();
                  } else {
                    showModal();
                  }

                }}
                style={{
                  position: 'absolute',
                  bottom: '60%',
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
                  colors={['#fdb442', '#f69f2c']}
                  start={[0, 0]}
                  end={[1, 1]}
                  style={{ borderRadius: 30 }}
                  className="items-center justify-center w-full h-full"
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
          style={{ paddingTop: 20 }}
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

      {/* Modal for the Create Menu */}

      <Modal
        visible={menuVisible}
        onDismiss={hideModal}
      >
        <Animated.View
          className={`bg-notFullWhite items-center justify-center`}
          style={[
            styles.createMenu,
            {
              transform: [
                { translateY: translateY },
                { scale: scale }
              ]
            },
          ]}
        >
          <FormField
            title="plantId"
            placeholder={"Enter plantId"}
            textStyles={''}
            inputStyles={''}
            handleChangeText={(e) => { setForm({ ...form, plantId: e }) }}
          />
          <FormField
            title="name"
            placeholder={"Enter name"}
            handleChangeText={(e) => { setForm({ ...form, name: e }) }}
          />
        </Animated.View>
      </Modal>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  closeButton: {
    color: '#2b65e3',
    marginTop: 20,
    fontSize: 16,
  },
  createMenu: {
    position: 'absolute',
    bottom: 100,
    right: 60,
    left: 60,
    height: 250,
    borderRadius: 20,
  }
});

export default TabsLayout;
