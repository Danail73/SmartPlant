import { Client, Account, ID, Avatars, Databases, Query } from 'react-native-appwrite';

export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.jsm.tutorial',
    projectId: '6738bb6e002444426347',
    databaseId: '6738c894002d68d7d7b8',
    userCollectionId: '6738c8a6002fa82ab6fc',
    plantsCollectionId: '6772be2600269d466af7',
    friendRequestsCollectionId: '6784d13b002aeb77720a',
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
        } catch (error) {
            console.log("No current session found. Proceeding to create a new session.");
        }

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
        const session = await account.deleteSession('current')
        return session;
    } catch (error) {
        throw new Error(error);
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
        console.log(error);
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
        console.log(error);
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
        console.log(response)
        return response;
    } catch (error) {
        throw new Error(error);
    }
}

export const getFirendRequests = async (toId) => {
    try {
        const request = await databases.listDocuments(
            config.databaseId, config.friendRequestsCollectionId,
            [
                Query.equal('toUser', toId),
                Query.equal('status', 'pending')
            ]
        )
        console.log(response.documents)
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
        console.log(response)
        return response
    } catch (error) {
        throw new Error(error);
    }
}

export const deleteFriendReques = async (requestId) => {
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
