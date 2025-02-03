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


//Users CRUD

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

export const createUser = async (email, password, encryptedPassword, key, username) => {
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
                accountId: newAccount.$id,
                password_key: [encryptedPassword, key]
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

        return response;
    } catch (error) {
        throw new Error(error)
    }
}

export const getUsersWithIds = async (ids) => {
    try {
        const users = await databases.listDocuments(
            config.databaseId, config.userCollectionId,
            [
                Query.equal('$id', ids)
            ]
        )
        console.log(users.documents)
        return users.documents
    } catch (error) {
        console.log(error)
    }
}

export const updateUser = async (form) => {
    try {
        const response = await databases.updateDocument(
            config.databaseId, config.userCollectionId, form.userId, {
                username: form.username,
                email: form.email,
                password_key: [form.password, form.key]
            })
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


//Friend Requests CRUD

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

export const getFriendRequests = async (userId) => {
    try {
        const requests = await databases.listDocuments(
            config.databaseId, config.friendRequestsCollectionId,
            [
                Query.or([
                    Query.equal('toUser', userId),
                    Query.equal('fromUser', userId)
                ])
            ]
        )
        return requests.documents
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

export const subscribeToFriendRequests = (userId, callback) => {
    try {
        const unsubscribe = client.subscribe(`databases.${config.databaseId}.collections.${config.friendRequestsCollectionId}.documents`, (response) => {
            if (userId == response.payload.fromUser || userId == response.payload.toUser) {
                if (callback)
                    callback(response.payload)
            }
        })
        return unsubscribe;
    } catch (error) {
        console.log(error)
    }
}

export const subscribeToUsers = (callback) => {
    try {
        const unsubscribe = client.subscribe(`databases.${config.databaseId}.collections.${config.userCollectionId}.documents`, (response) => {
            if (callback)
                callback(response)
        })
        return unsubscribe;
    } catch (error) {
        console.log(error)
    }
}

export const subscribeToPlants = (userId, callback) => {
    try {
        const unsubscribe = client.subscribe(`databases.${config.databaseId}.collections.${config.userCollectionId}.documents`, (response) => {
            if (response.payload.users.some((item) => item.$id == userId)) {
                if (callback)
                    callback(response)
            }
        })
        return unsubscribe;
    } catch (error) {
        console.log(error)
    }
}

//Accounts CRUD for Profile

export const getCurrentAccount = async () => {
    try {
        const response = await account.get()
        return response;
    } catch (error) {
        throw new Error(error)
    }
}

export const updateUsername = async (username) => {
    try {
        const response = await account.updateName(username);
        return response;
    } catch (error) {
        throw new Error(error)
    }
}

export const updateEmail = async (email, password) => {
    try {
        const response = await account.updateEmail(email, password);
        return response;
    } catch (error) {
        throw new Error(error)
    }
}

export const updatePassword = async (newPass, oldPass) => {
    try {
        const response = await account.updatePassword(newPass, oldPass);
        return response;
    } catch (error) {
        throw new Error(error)
    }
}
