import { createContext, useContext, useState, useEffect } from 'react';
import { getFriendRequests, getUsers } from '../lib/appwrite';
import { useGlobalContext } from './GlobalProvider';

const FriendsContext = createContext();
export const useFriendsContext = () => useContext(FriendsContext);

const FriendsProvider = ({ children }) => {
    const { user } = useGlobalContext()
    const [friends, setFriends] = useState([]);
    const [requestFriends, setRequestFriends] = useState([]);
    const [invitedFriends, setInvitedFriends] = useState([]);
    const [others, setOthers] = useState([])

    const fetchAllRequests = async () => {
        try {
            const requests = await getFriendRequests(user.$id)
            return requests
        } catch (error) {
            console.log(Error, error)
        }
    }

    const getAccepted = (reguests) => {
        const accepted = reguests.filter((item) => item.status == 'accepted')
        return accepted

    }
    const getInvites = (requests) => {
        const pendingInvites = requests.filter((item) => item.status === 'pending' && item.fromUser == user.$id)
        return pendingInvites
    }
    const getIncoming = (requests) => {
        const incomingRequests = requests.filter((item) => item.status === 'pending' && item.toUser == user.$id)
        return incomingRequests
    }


    const getFriends = (accepted, users) => {
        if (accepted.length > 0) {
            const tempIds = accepted.map((item) => item.fromUser)
            accepted.forEach((item) => {
                if (!tempIds.includes(item.toUser)) {
                    tempIds.push(item.toUser)
                }
            })
            const ids = tempIds.filter((item) => item != user.$id)
            const fetchedUsers = fetchUsersWithIds(ids, users)

            if (fetchedUsers) {
                const users_requests = accepted.map((item) => {
                    const user = fetchedUsers.find((u) => u.$id == item.toUser || u.$id == item.fromUser)
                    return { friend: user, request: item }
                })

                setFriends(users_requests)
                return users_requests
            }
        }
        else {
            setFriends([])
            return null
        }
    }

    const getRequestFriends = (pending, users) => {
        if (pending.length > 0) {
            const ids = pending.map((item) => item.toUser)
            const fetchedUsers = fetchUsersWithIds(ids, users)

            if (fetchedUsers) {
                const users_requests = pending.map((item) => {
                    const user = fetchedUsers.find((u) => u.$id == item.toUser)
                    return { friend: user, request: item }
                })

                setInvitedFriends(users_requests)
                return users_requests
            }
        }
        else {
            setInvitedFriends([])
            return null
        }
    }

    const getIncomingRequests = (incoming, users) => {
        if (incoming.length > 0) {
            const ids = incoming.map((item) => item.fromUser)
            const fetchedUsers = fetchUsersWithIds(ids, users);

            if (fetchedUsers) {
                const users_requests = incoming.map((item) => {
                    const user = fetchedUsers.find((u) => u.$id == item.fromUser)
                    return { friend: user, request: item }
                })

                setRequestFriends(users_requests)
                return users_requests
            }
        }
        else {
            setRequestFriends([])
            return null
        }
    }

    const fetchUsersWithIds = (ids, users) => {
        if (ids.length > 0) {
            try {
                const f = users.filter((item) => ids.includes(item.$id))
                return f
            } catch (error) {
                console.log(Error, error)
            }
        }
    }

    const fetchUsers = async () => {
        const unfiltered = await getUsers()
        const filtered = unfiltered.filter((item) => item.$id != user.$id)
        return filtered
    }

    const getOtherUsers = (users, fr, inv, req) => {
        const other = users.filter((item) =>
            (!fr || !fr.some(friend => friend.friend?.$id === item.$id)) &&
            (!inv || !inv.some(invite => invite.friend?.$id === item.$id)) &&
            (!req || !req.some(request => request.friend?.$id === item.$id))
        );
        setOthers(other);
    }

    const updateEverything = (requests, users) => {
        const accepted = getAccepted(requests);
        const pending = getInvites(requests);
        const incoming = getIncoming(requests);

        const fr = getFriends(accepted, users);
        const inv = getRequestFriends(pending, users);
        const req = getIncomingRequests(incoming, users);
        getOtherUsers(users, fr, req, inv);
    }

    const fetchData = async () => {
        try {
            const [users, requests] = await Promise.all([
                fetchUsers(),
                fetchAllRequests()
            ]);

            if (users && requests) {
                updateEverything(requests, users)
            }
        } catch (error) {
            console.log("Error fetching data:", error);
        }
    };

    useEffect(() => {
        if(user?.$id) {
            fetchData()
        }
    }, [user])

    return (
        <FriendsContext.Provider
            value={{
                fetchData,
                friends,
                requestFriends,
                invitedFriends,
                others
            }}
        >
            {children}
        </FriendsContext.Provider>
    )
}

export default FriendsProvider;