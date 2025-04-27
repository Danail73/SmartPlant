import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PlantBoardMenu from '../components/plants/PlantBoardMenu';
import { PaperProvider } from 'react-native-paper';

//mock useGlobalContext and usePlantsContext
jest.mock('../context/GlobalProvider', () => ({
  useGlobalContext: () => ({
    user: { $id: 'user1' }
  })
}));

jest.mock('../context/PlantsProvider', () => ({
  usePlantsContext: () => ({
    setPlants: jest.fn(),
    setActivePlant: jest.fn()
  })
}));

//mock appwrite functions
jest.mock('../lib/appwrite', () => ({
  deletePlant: jest.fn(),
  updatePlantUsers: jest.fn()
}));

//mock navigation functions
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn()
  }
}));

describe('PlantBoardMenu', () => {
  const item = {
    $id: 'plant1',
    users: [{ $id: 'user1' }]
  };

  const mockAdd = jest.fn();
  const mockRemove = jest.fn();

  const renderComponent = () =>
    render(
      <PaperProvider>
        <PlantBoardMenu
          item={item}
          addCallback={mockAdd}
          removeCallback={mockRemove}
          menuStyle={{ width: 24, height: 24 }}
        />
      </PaperProvider>
    );

  //check if the menu opens
  it('renders and toggles menu visibility', async () => {
    const { getByTestId, queryByText } = renderComponent();

    //menu button is present
    const menuButton = getByTestId('menu-test');
    expect(menuButton).toBeTruthy();

    //click the menu button
    fireEvent.press(menuButton);

    //wait for animation to complete and expect to see Edit option
    await waitFor(() => {
      expect(queryByText('Edit')).toBeTruthy();
    });

    //check if background click closes the menu
    const background = getByTestId('background-test');
    fireEvent.press(background);

    //check if the Edit option is no more visible
    await waitFor(() => {
      expect(queryByText('Edit')).toBeFalsy();
    });
  });
});
