import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PlantBoardMenu from '../components/plants/PlantBoardMenu';
import { PaperProvider } from 'react-native-paper';

// Mock contexts
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

// Mock appwrite functions
jest.mock('../lib/appwrite', () => ({
  deletePlant: jest.fn(),
  updatePlantUsers: jest.fn()
}));

// Mock navigation
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

  it('renders and toggles menu visibility', async () => {
    const { getByTestId, queryByText } = renderComponent();

    // Menu button is present
    const menuButton = getByTestId('menu-test');
    expect(menuButton).toBeTruthy();

    // Click the menu button
    fireEvent.press(menuButton);

    // Wait for animation to complete
    await waitFor(() => {
      expect(queryByText('Edit')).toBeTruthy();
    });

    // Background click closes the menu
    const background = getByTestId('background-test');
    fireEvent.press(background);

    await waitFor(() => {
      expect(queryByText('Edit')).toBeFalsy();
    });
  });
});
