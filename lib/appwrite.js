import { Permission } from 'appwrite';
import { Client, Account, ID, Avatars, Databases, Query } from 'react-native-appwrite';

export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.jsm.tutorial',
    projectId: '6738bb6e002444426347',
    databaseId: '6738c894002d68d7d7b8',
    userCollectionId: '6738c8a6002fa82ab6fc',
    plantsCollectionId: '6772be2600269d466af7',
    friendRequestsCollectionId: '67897095002f21cd3114',
    storageId: '6738c9f400346555d117'
}



const client = new Client();

client
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setPlatform(config.platform);


const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export const signIn = async (email, password) => {
    try {
        let currentSession;
        try {
            currentSession = await account.getSession('current');

        } catch (error) { }

        if (currentSession) {
            return currentSession;
        }

        const session = await account.createEmailPasswordSession(email, password);

        return session;
    }
    catch (error) {
        throw new Error(error);
    }
}

export const signOut = async () => {
    try {
        const session = await account.getSession('current')
        const response = await account.deleteSession(session.$id)
        return response;
    } catch (error) {
        throw new Error(error)
    }
}

export const createUser = async (email, password, username) => {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        )

        if (!newAccount) throw Error;
        const avatarUrl = avatars.getInitials(username);
        await signIn(email, password)
        const newUser = await databases.createDocument(
            config.databaseId,
            config.userCollectionId,
            ID.unique(),
            {
                username,
                email,
                avatar: avatarUrl,
                accountId: newAccount.$id
            }
        )

        return newUser;
    }
    catch (error) {
        throw new Error(error);
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();

        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if (!currentUser) throw Error;

        return currentUser.documents[0];
    }
    catch (error) {
        throw new Error(error)
    }
}

export const getUsers = async () => {
    try {
        const response = await databases.listDocuments(
            config.databaseId, config.userCollectionId
        )
        return response.documents;
    } catch (error) {
        throw new Error(error)
    }
}

export const getUser = async (userId) => {
    try {
        const response = await databases.getDocument(
            config.databaseId, config.userCollectionId, userId
        )
        //console.log(response)
        return response;
    } catch (error) {
        throw new Error(error)
    }
}




//Plants vs Zombies CRUD

export const createPlant = async (plantId, name, users) => {
    try {
        const newPlant = await databases.createDocument(
            config.databaseId, config.plantsCollectionId, ID.unique(), {
            plantId: plantId,
            name: name,
            users: users
        });
        return newPlant;
    } catch (error) {
        throw new Error(error);
    }
}

export const getAllPlants = async () => {
    try {
        const plants = await databases.listDocuments(
            config.databaseId,
            config.plantsCollectionId
        )

        return plants.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const updatePlant = async (plantUniqueId, plantId, name) => {
    try {
        const response = await databases.updateDocument(
            config.databaseId, config.plantsCollectionId, plantUniqueId, {
            plantId: plantId,
            name: name,
        })

        return response;
    } catch (error) {
        throw new Error(error);
    }
}

export const deletePlant = async (plantId) => {
    try {
        const response = await databases.deleteDocument(
            config.databaseId,
            config.plantsCollectionId,
            plantId
        );
        return response;
    } catch (error) {
        throw new Error(error);
    }
}

//Friend Requests

export const sendFriendRequest = async (fromId, toId) => {
    try {
        const response = await databases.createDocument(
            config.databaseId, config.friendRequestsCollectionId,
            ID.unique(),
            {
                fromUser: fromId,
                toUser: toId,
                status: 'pending',
                createdAt: new Date().toISOString(),
            }

        )
        return response;
    } catch (error) {
        throw new Error(error)
    }
}

export const getFriendRequests = async (toId) => {
    try {
        const response = await databases.listDocuments(
            config.databaseId, config.friendRequestsCollectionId,
            [
                Query.equal('toUser', toId),
                Query.equal('status', 'pending')
            ]
        )
        return response.documents
    } catch (error) {
        throw new Error(error);
    }
}

export const getSentRequests = async (fromId) => {
    try {
        const response = await databases.listDocuments(
            config.databaseId, config.friendRequestsCollectionId,
            [
                Query.equal('fromUser', fromId),
                Query.equal('status', 'pending')
            ]
        )
        return response.documents
    } catch (error) {
        throw new Error(error);
    }
}

export const respondFriendRequest = async (requestId, status) => {
    try {
        const response = await databases.updateDocument(
            config.databaseId, config.friendRequestsCollectionId, requestId,
            {
                status: status
            }
        )
        return response
    } catch (error) {
        throw new Error(error);
    }
}

export const deleteFriendRequest = async (requestId) => {
    try {
        const response = await databases.deleteDocument(
            config.databaseId, config.friendRequestsCollectionId, requestId
        )
        console.log(response)
        return response;
    } catch (error) {
        throw new Error(error)
    }
}

export const getAllFriends = async (userId) => {
    try {
        const fromRequest = await databases.listDocuments(
            config.databaseId, config.friendRequestsCollectionId,
            [
                Query.equal('status', 'accepted'),
                Query.equal('fromUser', userId),
            ]
        )

        const toRequest = await databases.listDocuments(
            config.databaseId, config.friendRequestsCollectionId,
            [
                Query.equal('status', 'accepted'),
                Query.equal('toUser', userId),
            ]
        )

        const request = [
            ...fromRequest.documents,
            ...toRequest.documents,
        ].filter((value, index, self) =>
            index === self.findIndex((t) => t.$id === value.$id)
        );

        const userIds = request.map((item) => item.toUser)
        const fromIds = request.map((item) => item.fromUser)
        const ids = userIds.concat(fromIds);
        const neededUsersIds = ids.filter((item) => item != userId)

        const userPromises = neededUsersIds.map(async (id) => {
            const u = await getUser(id);
            return u;
        });
        const users = await Promise.all(userPromises);
        return users

    } catch (error) {
        throw new Error(error)
    }

}

export const getAllOtherUsers = async (userId) => {
    try {
        const allUsers = await databases.listDocuments(
            config.databaseId, config.userCollectionId,
        )

        const users = allUsers.documents.filter((item) => item.$id != userId)
        const fromRequests = await databases.listDocuments(
            config.databaseId, config.friendRequestsCollectionId,
            [
                Query.equal('fromUser', userId),
                Query.notEqual('status', 'declined')
            ]
        )
        const toRequests = await databases.listDocuments(
            config.databaseId, config.friendRequestsCollectionId,
            [
                Query.equal('toUser', userId),
                Query.notEqual('status', 'declined')
            ]
        )


        const friendRequests = [
            ...fromRequests.documents,
            ...toRequests.documents,
        ].filter((value, index, self) =>
            index === self.findIndex((t) => t.$id === value.$id)
        );

        const fromIds = friendRequests.map((item) => item.fromUser)
        const toIds = friendRequests.map((item) => item.toUser)
        const ids = new Set((fromIds.concat(toIds)).filter((item) => item != userId));
        const otherUsers = users.filter((item) => !ids.has(item.$id))
        return otherUsers

    } catch (error) {
        throw new Error(error)
    }
}

export const getAcceptedRequest = async (fromUser, toUser) => {
    try {
        const requestFrom = await databases.listDocuments(
            config.databaseId, config.friendRequestsCollectionId,
            [
                Query.equal('fromUser', fromUser),
                Query.equal('toUser', toUser),
                Query.equal('status', 'accepted')
            ]
        )
        const requestTo = await databases.listDocuments(
            config.databaseId, config.friendRequestsCollectionId,
            [
                Query.equal('fromUser', toUser),
                Query.equal('toUser', fromUser),
                Query.equal('status', 'accepted')
            ]
        )
        if (requestFrom.documents)
            return requestFrom.documents[0]
        else
            return requestTo.documents[0]
    } catch (error) {
        throw new Error(error);
    }
}
