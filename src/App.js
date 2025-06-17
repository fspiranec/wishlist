import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";

export default function App() {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [newUser, setNewUser] = useState("");

  // Firebase references
  const itemsRef = collection(db, "items");
  const usersRef = collection(db, "users");

  // Load data
  useEffect(() => {
    const unsubItems = onSnapshot(itemsRef, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setItems(data);
    });

    const unsubUsers = onSnapshot(usersRef, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.id);
      setUsers(data);
    });

    return () => {
      unsubItems();
      unsubUsers();
    };
  }, []);

  const addItem = async () => {
    if (!newItemName.trim()) return;
    await addDoc(itemsRef, {
      name: newItemName.trim(),
      details: "",
      claimedBy: [],
    });
    setNewItemName("");
  };

  const updateItemDetails = async (item) => {
    const newDetails = prompt("Enter details for item:", item.details || "");
    if (newDetails !== null) {
      await updateDoc(doc(db, "items", item.id), {
        ...item,
        details: newDetails,
      });
    }
  };

  const deleteItem = async (itemId) => {
    if (confirm("Delete this item?")) {
      await deleteDoc(doc(db, "items", itemId));
    }
  };

  const renameItem = async (item) => {
    const newName = prompt("Rename item:", item.name);
    if (newName && newName.trim()) {
      await updateDoc(doc(db, "items", item.id), {
        ...item,
        name: newName.trim(),
      });
    }
  };

  const claimItem = async (item, user) => {
    if (!item.claimedBy.includes(user)) {
      const updated = [...item.claimedBy, user];
      await updateDoc(doc(db, "items", item.id), { ...item, claimedBy: updated });
    }
  };

  const returnItem = async (item, user) => {
    const updated = item.claimedBy.filter((u) => u !== user);
    await updateDoc(doc(db, "items", item.id), { ...item, claimedBy: updated });
  };

  const addUser = async () => {
    const name = newUser.trim();
    if (name && !users.includes(name)) {
      await setDoc(doc(usersRef, name), {});
      setNewUser("");
    }
  };

  const renameUser = async (oldName) => {
    const newName = prompt("Rename user:", oldName);
    if (!newName || newName === oldName || users.includes(newName)) return;

    // 1. Create new user doc
    await setDoc(doc(usersRef, newName), {});
    // 2. Delete old user
    await deleteDoc(doc(usersRef, oldName));
    // 3. Update items
    for (const item of items) {
      if (item.claimedBy.includes(oldName)) {
        const updated = item.claimedBy.map((u) => (u === oldName ? newName : u));
        await updateDoc(doc(db, "items", item.id), { ...item, claimedBy: updated });
      }
    }
  };

  const deleteUser = async (user) => {
    if (!confirm(`Delete ${user}? Their claims will be removed.`)) return;
    await deleteDoc(doc(usersRef, user));
    for (const item of items) {
      if (item.claimedBy.includes(user)) {
        const updated = item.claimedBy.filter((u) => u !== user);
        await updateDoc(doc(db, "items", item.id), { ...item, claimedBy: updated });
      }
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Franjo's Wish List</h1>

        {/* Add Wish */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="flex-1 border p-2 rounded"
            placeholder="Add wish item"
          />
          <button onClick={addItem} className="bg-blue-500 text-white px-4 rounded">
            Add
          </button>
        </div>

        {/* Wish List */}
        <ul className="mb-6 space-y-2">
          {items.map((item) => (
            <li key={item.id} className="border p-2 rounded flex justify-between items-center">
              <div>
                <span
                  onClick={() => updateItemDetails(item)}
                  className="font-semibold cursor-pointer underline"
                >
                  {item.name}
                </span>
                {item.details && <div className="text-sm text-gray-600">{item.details}</div>}
              </div>
              <div className="flex flex-wrap gap-2">
                {users.map((user) => (
                  <button
                    key={user}
                    onClick={() => claimItem(item, user)}
                    disabled={item.claimedBy.includes(user)}
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                  >
                    {user} takes
                  </button>
                ))}
                <button
                  onClick={() => renameItem(item)}
                  className="bg-yellow-500 text-white px-2 rounded text-xs"
                >
                  Rename
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="bg-red-500 text-white px-2 rounded text-xs"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Users */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
            className="flex-1 border p-2 rounded"
            placeholder="Add user"
          />
          <button onClick={addUser} className="bg-purple-500 text-white px-4 rounded">
            Add User
          </button>
        </div>

        {/* User Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((user) => (
            <div key={user} className="bg-gray-50 border p-4 rounded">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-bold">{user}'s To Buy</h2>
                <div className="flex gap-1">
                  <button
                    onClick={() => renameUser(user)}
                    className="bg-yellow-500 text-white px-2 rounded text-xs"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => deleteUser(user)}
                    className="bg-red-500 text-white px-2 rounded text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <ul className="space-y-1 text-sm">
                {items
                  .filter((item) => item.claimedBy.includes(user))
                  .map((item) => {
                    const pos = item.claimedBy.indexOf(user) + 1;
                    const total = item.claimedBy.length;
                    return (
                      <li key={item.id} className="flex justify-between items-center">
                        <span>
                          {item.name} ({pos}/{total})
                        </span>
                        <button
                          onClick={() => returnItem(item, user)}
                          className="bg-red-400 text-white rounded px-2 text-xs"
                        >
                          Return
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
