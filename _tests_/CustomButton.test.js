import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomButton from '../components/CustomButton';

test('renders button title', () => {
  const { getByText } = render(<CustomButton title="Click me" />);
  expect(getByText('Click me')).toBeTruthy();
});

test('calls handlePress on press', () => {
  const mockPress = jest.fn();
  const { getByText } = render(<CustomButton title="Click me" handlePress={mockPress} />);
  fireEvent.press(getByText('Click me'));
  expect(mockPress).toHaveBeenCalled();
});
