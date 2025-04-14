import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StatusCard from '../components/device/StatusCard';
import { Image } from 'react-native';

const mockIcon = { uri: 'https://example.com/icon.png' };

describe('StatusCard', () => {
  it('renders label and value', () => {
    const { getByText } = render(
      <StatusCard label="Temperature" value="24°C" />
    );
    expect(getByText('Temperature')).toBeTruthy();
    expect(getByText('24°C')).toBeTruthy();
  });

  it('renders icon when iconSource is provided', () => {
    const { getByTestId } = render(
      <StatusCard iconSource={mockIcon} />
    );
    const icon = getByTestId('image-test');
    expect(icon).toBeTruthy();
  });

  it('calls onSwitchChange when switch is toggled', () => {
    const mockSwitchHandler = jest.fn();

    const { getByTestId } = render(
      <StatusCard showSwitch={true} isEnabled={false} onSwitchChange={mockSwitchHandler} />
    );

    const switchToggle = getByTestId('switch-toggle');
    fireEvent(switchToggle, 'valueChange', true);

    expect(mockSwitchHandler).toHaveBeenCalledWith(true);
  });
});
