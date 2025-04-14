import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FormField from '../components/FormField';
import { icons } from '../constants';

test('renders title when provided', () => {
  const { getByText } = render(<FormField title="Username" />);
  expect(getByText('Username')).toBeTruthy();
});

test('handles text input change', () => {
  const mockChangeText = jest.fn();
  const { getByPlaceholderText } = render(
    <FormField placeholder="Enter text" handleChangeText={mockChangeText} />
  );
  const input = getByPlaceholderText('Enter text');
  fireEvent.changeText(input, 'Hello World');
  expect(mockChangeText).toHaveBeenCalledWith('Hello World');
});

test('shows and hides text when hideText is true', () => {
  const { getByTestId } = render(
    <FormField 
      hideText={true}
      value="password123"
      handleChangeText={() => {}}
    />
  );

  // Check if secureTextEntry is enabled
  const input = getByTestId('passwordInput');
  expect(input.props.secureTextEntry).toBe(true);

  // Tap the eye icon to toggle visibility
  const eyeIcon = getByTestId('eyeIcon');
  fireEvent.press(eyeIcon);

  // Now, the input should be visible (not secure)
  expect(input.props.secureTextEntry).toBe(false);
});
