import React from 'react';
import { render } from '@testing-library/react-native';
import PlantBoardComponent from '../components/plants/PlantBoardComponent';

//mocking the images of plants for the PlantBoardComponent
jest.mock('../constants/plantImages', () => ({
  plant1: 'plant1-img',
  plant2: 'plant2-img',
  plant3: 'plant3-img'
}));

//mocking the needed icons for the component
jest.mock('../constants', () => ({
  icons: {
    clock: 'clock-icon',
    drop: 'drop-icon',
    menu: 'menu-icon',
    edit: 'edit-icon',
    addFriend: 'add-icon',
    del: 'delete-icon'
  }
}));

//mocking the PlantBoardMenu
jest.mock('../components/plants/PlantBoardMenu', () => 'PlantBoardMenu');

//mocking the functions for scaling the components
jest.mock('react-native-responsive-screen', () => ({
  widthPercentageToDP: jest.fn(p => p),
  heightPercentageToDP: jest.fn(p => p),
}));

describe('PlantBoardComponent', () => {
  //mocking the 'plant' object
  const mockItem = {
    name: 'Aloe Vera',
    water: ['12ml', '14ml'],
    users: [{ $id: 'user1' }],
    $id: 'plant1'
  };

  const mockAdd = jest.fn();
  const mockRemove = jest.fn();

  //check if everything for the component renders properly
  it('renders with name, water info, and status Connected', () => {
    const { getByText } = render(
      <PlantBoardComponent
        item={mockItem}
        isReceiving={true}
        isActive={true}
        addCallback={mockAdd}
        removeCallback={mockRemove}
      />
    );

    expect(getByText('Aloe Vera')).toBeTruthy();
    expect(getByText('14ml')).toBeTruthy();
    expect(getByText('Connected')).toBeTruthy();
  });

  //check if it shows when the user is disconnected and when is connected to the MQTT broker
  it('renders status Disconnected when not active or not receiving', () => {
    const { getByText } = render(
      <PlantBoardComponent
        item={mockItem}
        isReceiving={false}
        isActive={false}
        addCallback={mockAdd}
        removeCallback={mockRemove}
      />
    );

    expect(getByText('Disconnected')).toBeTruthy();
  });

  //check if the PlantBoardMenu shows
  it('includes PlantBoardMenu component', () => {
    const { UNSAFE_queryByType } = render(
      <PlantBoardComponent
        item={mockItem}
        isReceiving={true}
        isActive={true}
        addCallback={mockAdd}
        removeCallback={mockRemove}
      />
    );

    expect(UNSAFE_queryByType('PlantBoardMenu')).toBeTruthy();
  });
});
