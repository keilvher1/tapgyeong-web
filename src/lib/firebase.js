import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  setDoc,
  addDoc,
  deleteDoc,
  getCountFromServer,
  increment,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBPk_rn5Bo-sxHBHBjjAR0R00KCD3SfkLI',
  authDomain: 'tapgyeong.firebaseapp.com',
  projectId: 'tapgyeong',
  storageBucket: 'tapgyeong.firebasestorage.app',
  messagingSenderId: '646265861357',
  appId: '1:646265861357:web:7390dd0fec1becb32848e4',
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Demo user document ID
export const DEMO_USER_ID = 'demo-user'

// Helper: get all docs from a collection
export async function getAll(collectionName) {
  const snap = await getDocs(collection(db, collectionName))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// Helper: get all docs with query constraints
export async function getFiltered(collectionName, ...constraints) {
  const q = query(collection(db, collectionName), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// Helper: get single doc by ID
export async function getById(collectionName, docId) {
  const snap = await getDoc(doc(db, collectionName, docId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

// Helper: update a doc
export async function updateById(collectionName, docId, data) {
  await updateDoc(doc(db, collectionName, docId), data)
}

// Helper: count docs matching a query
export async function countDocs(collectionName, ...constraints) {
  const q = query(collection(db, collectionName), ...constraints)
  const snap = await getCountFromServer(q)
  return snap.data().count
}

// Helper: create a doc with auto ID
export async function createDoc(collectionName, data) {
  const ref = await addDoc(collection(db, collectionName), data)
  return ref.id
}

// Helper: create a doc with specific ID
export async function setById(collectionName, docId, data) {
  await setDoc(doc(db, collectionName, docId), data)
}

// Helper: delete a doc
export async function removeById(collectionName, docId) {
  await deleteDoc(doc(db, collectionName, docId))
}

// Re-export firestore query helpers for use in pages
export { collection, doc, where, orderBy, limit, query, increment, serverTimestamp, writeBatch, setDoc, addDoc, deleteDoc }
