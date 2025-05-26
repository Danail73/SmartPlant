import { Client, Account, ID, Avatars, Databases, Query, Functions } from 'react-native-appwrite';

//config for the Appwrite database
export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.jsm.tutorial',
    projectId: '6738bb6e002444426347',
    databaseId: '6738c894002d68d7d7b8',
    userCollectionId: '6738c8a6002fa82ab6fc',
    plantsCollectionId: '6772be2600269d466af7',
    friendRequestsCollectionId: '67897095002f21cd3114',
    plantIdsCollectionId: '67c32f210009491fefb5',
    storageId: '6738c9f400346555d117',
    deleteFunctionId: '682f7430001edfe884d0'
}

//setting up client, account, avatars and databases
const client = new Client();

client
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setPlatform(config.platform);


const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const functions = new Functions(client);

// CRUD for 'users' collection

//registration function
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

//logout function
export const signOut = async () => {
    try {
        const session = await account.getSession('current')
        const response = await account.deleteSession(session.$id)
        return response;
    } catch (error) {
        throw new Error(error)
    }
}

//function to create user
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
        await account.updatePrefs({
            role: 'user'
        });
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

//function to get the current user
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

//function to get all users
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

//function to update user
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


// CRUD for 'plants' collection (PvZ CRUD)

//function to create plant
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

//function to fetch all plants
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

//function to  update plant's name and plantId
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

//function to update sensor values
export const updatePlantSensors = async (plant, newSensorValues) => {
    try {
        const existingData = {
            time: plant.time,
            temperature: plant.temperature,
            humidity: plant.humidity,
            brightness: plant.brightness,
            water: plant.water,
            statusCode: plant.statusCode
        }



        const updateArray = (prevArray, newValue) =>
            prevArray.length >= 36 ? [...prevArray.slice(1), newValue] : [...prevArray, newValue];

        const updatedData = {
            time: updateArray(existingData.time || [], newSensorValues.time),
            temperature: updateArray(existingData.temperature || [], newSensorValues.temperature),
            humidity: updateArray(existingData.humidity || [], newSensorValues.humidity),
            brightness: updateArray(existingData.brightness || [], newSensorValues.brightness),
            water: updateArray(existingData.water || [], newSensorValues.water),
            statusCode: updateArray(existingData.statusCode || [], newSensorValues.statusCode),
        };
        const response = await databases.updateDocument(
            config.databaseId,
            config.plantsCollectionId,
            plant.$id,
            updatedData
        )

        return response;
    } catch (error) {
        throw new Error(error);
    }
}

//function to update plant's users
export const updatePlantUsers = async (plantUniqueId, users) => {
    try {
        const response = await databases.updateDocument(
            config.databaseId, config.plantsCollectionId, plantUniqueId, {
            users: users
        })

        return response;
    } catch (error) {
        throw new Error(error);
    }
}

//function to delete plant
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


// CRUD for 'friendRequests' collection

//function to create friend request
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

//function to get all user's friend requests
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

//function to update status of a friend request
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

//function to delete friend request
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


// Appwrite real time

//subscribe to 'friendRequests' collection
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

//subscribe to 'users' collection
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

//subscribe to 'plants' collection
export const subscribeToPlants = (userId, callback) => {
    try {
        const channel = `databases.${config.databaseId}.collections.${config.plantsCollectionId}.documents`;
        const unsubscribe = client.subscribe(channel, (response) => {
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


// functions to get/update account

//function to get current account

export const getCurrentAccount = async () => {
    try {
        const response = await account.get()
        return response;
    } catch (error) {
        throw new Error(error)
    }
}

//functions to update credentials

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

export const deleteCurrentAccount = async () => {
    try {
      const currentAccount = await getCurrentAccount();
      const userId = currentAccount.$id;
      const currentUser = await getCurrentUser()
      const id = currentUser.$id
      const requests = await getFriendRequests(id);
      const allPlants = await getAllPlants();
      const plants = allPlants.filter((plant) => plant.users.some((u) => u.$id == id))

      plants.forEach(async (plant) => {
        if(plant.users[0].$id == id){
            try{
                const response = await deletePlant(plant.$id)
            } catch (error) {
                throw error;
            }
        }
        else{
            const users = plant.users.filter((u) => u.$id!=id)
            try {
                const response = await updatePlantUsers(plant.$id, users);
            } catch (error) {
                throw error;
            }
        }
      })
  
      const responseReq = requests.forEach(async (r) => await deleteFriendRequest(r.$id))
      const execution = await functions.createExecution(config.deleteFunctionId, JSON.stringify({ userId }));
      const response = await databases.deleteDocument(config.databaseId, config.userCollectionId, id);
      
      return {execution, response, responseReq};
    } catch (error) {
      throw new Error(error);
    }
  };

//function to check if a plantId exists in 'plantsAdmin' collection
export const plantIdExists = async (plantId) => {
    try {
        const plantIds = await databases.listDocuments(
            config.databaseId, config.plantIdsCollectionId
        )
        const ids = plantIds.documents.map((item) => item.plantId)
        const exists = ids.includes(plantId)
        return exists;
    } catch (error) {
        throw new Error(error)
    }
}

//function for admin to create plant in 'plantsAdmin' collection
export const createPlantAdmin = async (plantId) => {
    try {
        const response = await databases.createDocument(
            config.databaseId, config.plantIdsCollectionId, ID.unique(), {
            plantId: plantId,
        });
        return response;
    } catch (error) {
        throw new Error(error);
    }
}
