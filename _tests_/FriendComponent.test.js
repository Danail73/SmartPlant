import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FriendComponent from '../components/friends/FriendComponent';

const mockItem = {
  $id: 'user123',
  avatar: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fandreian.com%2Fmusashi-21-rules%2F&psig=AOvVaw3gOHeTqlmoIPrV5mhxrtq8&ust=1744709617650000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCOjp5Pqb14wDFQAAAAAdAAAAABAE',
  username: 'TestUser',
  email: 'test@example.com',
};

const mockFromUser = {
  $id: 'fromUser123',
};

jest.mock('../lib/appwrite', () => ({
  sendFriendRequest: jest.fn(() => Promise.resolve('sent')),
  respondFriendRequest: jest.fn(() => Promise.resolve('responded')),
}));

describe('FriendComponent', () => {
  it('renders user info', () => {
    const { getByText } = render(
      <FriendComponent item={mockItem} />
    );

    expect(getByText('TestUser')).toBeTruthy();
    expect(getByText('test@example.com')).toBeTruthy();
  });

  it('triggers sendFriendRequest when add friend button is pressed', async () => {
    const { getByTestId } = render(
      <FriendComponent item={mockItem} forInvite={true} fromUser={mockFromUser} />
    );

    const button = getByTestId('invite-test');
    fireEvent.press(button);

    expect(require('../lib/appwrite').sendFriendRequest)
      .toHaveBeenCalledWith(mockFromUser.$id, mockItem.$id);
  });

  it('shows accept and decline buttons when isPending is true', () => {
    const { getByText } = render(
      <FriendComponent item={mockItem} isPending={true} requestId="req123" />
    );

    expect(getByText('Accept')).toBeTruthy();
    expect(getByText('Decline')).toBeTruthy();
  });

  it('calls respondFriendRequest on Accept and Decline press', async () => {
    const { getByText } = render(
      <FriendComponent item={mockItem} isPending={true} requestId="req123" />
    );

    fireEvent.press(getByText('Accept'));
    fireEvent.press(getByText('Decline'));

    expect(require('../lib/appwrite').respondFriendRequest).toHaveBeenCalledWith('req123', 'accepted');
    expect(require('../lib/appwrite').respondFriendRequest).toHaveBeenCalledWith('req123', 'declined');
  });
});
