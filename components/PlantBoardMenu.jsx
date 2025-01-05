import { View, Text, Modal, Pressable, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'

const PlantBoardMenu = ({menuVisible}) => {
    return (
        <Modal
            transparent={true}
            visible={menuVisible}
            animationType="fade"
            onRequestClose={() => setMenuVisible(false)}
        >
            <Pressable
                style={styles.modalOverlay}
                //onPress={() => setMenuVisible(false)}
            >
                <View style={styles.menuContainer}>
                    <TouchableOpacity onPress={() => {}}>
                        <Text style={styles.menuOption}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {}}>
                        <Text style={styles.menuOption}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContainer: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: 130,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    menuOption: {
        fontSize: 16,
        color: '#333',
        paddingVertical: 10,
    },
})

export default PlantBoardMenu