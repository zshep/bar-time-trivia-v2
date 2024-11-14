import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';


// Add Data
export const addTriviaSession = async (sessionData) => {
  try {
    const docRef = await addDoc(collection(db, 'triviaSessions'), sessionData);
    console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};

// Get Data
export const getTriviaSessions = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'triviaSessions'));
    const sessions = [];
    querySnapshot.forEach((doc) => {
      sessions.push({ id: doc.id, ...doc.data() });
    });
    return sessions;
  } catch (e) {
    console.error('Error getting documents: ', e);
  }
};

// Update Data
export const updateTriviaSession = async (docId, updatedData) => {
  try {
    const docRef = doc(db, 'triviaSessions', docId);
    await updateDoc(docRef, updatedData);
    console.log('Document updated with ID: ', docId);
  } catch (e) {
    console.error('Error updating document: ', e);
  }
};

// Delete Data
export const deleteTriviaSession = async (docId) => {
  try {
    await deleteDoc(doc(db, 'triviaSessions', docId));
    console.log('Document deleted with ID: ', docId);
  } catch (e) {
    console.error('Error deleting document: ', e);
  }
};
