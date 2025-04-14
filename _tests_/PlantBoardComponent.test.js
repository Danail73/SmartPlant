import React from 'react';
import { render } from '@testing-library/react-native';
import PlantBoardComponent from '../components/plants/PlantBoardComponent';

jest.mock('../constants/plantImages', () => ({
  plant1: 'plant1-img',
  plant2: 'plant2-img',
  plant3: 'plant3-img'
}));

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

jest.mock('../components/plants/PlantBoardMenu', () => 'PlantBoardMenu');

jest.mock('react-native-responsive-screen', () => ({
  widthPercentageToDP: jest.fn(p => p),
  heightPercentageToDP: jest.fn(p => p),
}));

describe('PlantBoardComponent', () => {
  const mockItem = {
    name: 'Aloe Vera',
    water: ['12ml', '14ml'],
    users: [{ $id: 'user1' }],
    $id: 'plant1'
  };

  const mockAdd = jest.fn();
  const mockRemove = jest.fn();

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
