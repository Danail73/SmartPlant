import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

const AuthLayout = () => {

  //defining the two authentication pages - login and registration
  return (
    <>
      <Stack>
        {/* login page */}
        <Stack.Screen
          name="login"
          options={{
            headerShown: false
          }}
        />

        {/* registration page */}
        <Stack.Screen
          name="sign-up"
          options={{
            headerShown: false
          }}
        />
      </Stack>

      {/* configure a color for the phone's status bar */}
      <StatusBar backgroundColor='#161622'
      style="light"/>
    </>
  )
}

export default AuthLayout