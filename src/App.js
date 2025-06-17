
import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  getDoc,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", password: "" });
  const [newItem, setNewItem] = useState({ name: "", details: "" });
  const [editingItem, setEditingItem] = useState(null);
  const logout = () => setCurrentUser(null);

  const login = async (e) => {
    e.preventDefault();
    const { username, password } = e.target;
    const userRef = doc(db, "users", username.value);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists() && userSnap.data().password === password.value) {
      setCurrentUser({ username: username.value, role: userSnap.data().role });
    } else {
      alert("Invalid credentials");
    }
  };

  useEffect(() => {
    const unsubItems = onSnapshot(collection(db, "items"), (snapshot) => {
      setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map((doc) => doc.id));
    });
    return () => {
      unsubItems();
      unsubUsers();
    };
  }, []);

  const createUser = async () => {
    if (!newUser.username || !newUser.password) return;
    await setDoc(doc(db, "users", newUser.username), {
      password: newUser.password,
      role: "user",
    });
    setNewUser({ username: "", password: "" });
  };

  const deleteUser = async (username) => {
    if (window.confirm("Delete this user?")) {
      await deleteDoc(doc(db, "users", username));
    }
  };

  const createItem = async () => {
    if (!newItem.name) return;
    await setDoc(doc(collection(db, "items")), {
      name: newItem.name,
      details: newItem.details,
      claimedBy: [],
    });
    setNewItem({ name: "", details: "" });
  };

  const claimItem = async (item, user) => {
    if (!item.claimedBy.includes(user)) {
      await updateDoc(doc(db, "items", item.id), {
        claimedBy: arrayUnion(user),
      });
    }
  };

  const returnItem = async (item, user) => {
    await updateDoc(doc(db, "items", item.id), {
      claimedBy: arrayRemove(user),
    });
  };

  const deleteItem = async (id) => {
    if (window.confirm("Delete this item?")) {
      await deleteDoc(doc(db, "items", id));
    }
  };

  const startEdit = (item) => {
    setEditingItem({ id: item.id, name: item.name, details: item.details });
  };

  const saveEdit = async () => {
    if (!editingItem) return;
    await updateDoc(doc(db, "items", editingItem.id), {
      name: editingItem.name,
      details: editingItem.details,
    });
    setEditingItem(null);
  };

  const cancelEdit = () => setEditingItem(null);

  if (!currentUser) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        <form onSubmit={login} className="space-y-4">
          <input name="username" placeholder="Username" className="border p-2 w-full" />
          <input type="password" name="password" placeholder="Password" className="border p-2 w-full" />
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
        </form>
      </div>
    );
  }

  const isAdmin = currentUser.username === "franjo";

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Welcome, {currentUser.username}</h1>
        <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>

      {isAdmin && (
        <>
          <div>
            <h2 className="font-semibold">Create User</h2>
            <div className="flex gap-2 mt-2">
              <input
                placeholder="Username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="border p-2"
              />
              <input
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="border p-2"
              />
              <button onClick={createUser} className="bg-green-600 text-white px-4 py-2 rounded">Add</button>
            </div>
            <ul className="mt-2">
              {users.map((u) =>
                u !== "franjo" ? (
                  <li key={u} className="flex justify-between mt-1">
                    <span>{u}</span>
                    <button onClick={() => deleteUser(u)} className="text-red-500">Delete</button>
                  </li>
                ) : null
              )}
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mt-6">Create Item</h2>
            <div className="flex gap-2 mt-2">
              <input
                placeholder="Item name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="border p-2"
              />
              <input
                placeholder="Details"
                value={newItem.details}
                onChange={(e) => setNewItem({ ...newItem, details: e.target.value })}
                className="border p-2"
              />
              <button onClick={createItem} className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
            </div>
          </div>
        </>
      )}

      <div>
        <h2 className="font-semibold">Wish List</h2>
        <ul className="mt-2 space-y-2">
          {items.map((item) => (
            <li key={item.id} className="border p-2 rounded">
              {editingItem && editingItem.id === item.id ? (
                <div className="space-y-2">
                  <input
                    className="border p-2 w-full"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  />
                  <input
                    className="border p-2 w-full"
                    value={editingItem.details}
                    onChange={(e) => setEditingItem({ ...editingItem, details: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="bg-blue-600 text-white px-3 py-1 rounded">
                      Save
                    </button>
                    <button onClick={cancelEdit} className="text-gray-600">
                      Cancel
                    </button>
                    <button onClick={() => deleteItem(editingItem.id)} className="text-red-600">
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <span className="font-bold">{item.name}</span>
                    {item.claimedBy.length > 0 && (
                      <span className="ml-2 text-sm text-gray-600">({item.claimedBy.join(", ")})</span>
                    )}
                    {" – "}
                    {item.details}
                  </div>
                  {isAdmin ? (
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => startEdit(item)} className="text-blue-600">
                        Edit
                      </button>
                      <button onClick={() => deleteItem(item.id)} className="text-red-600">
                        Delete
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center mt-1">
                      <button
                        onClick={() => claimItem(item, currentUser.username)}
                        disabled={item.claimedBy.includes(currentUser.username)}
                        className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
                      >
                        {item.claimedBy.includes(currentUser.username) ? "Claimed" : "Claim"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      {!isAdmin && (
        <div>
          <h2 className="font-semibold">My Claimed Items</h2>
          <ul className="mt-2 space-y-2">
            {items
              .filter((i) => i.claimedBy.includes(currentUser.username))
              .map((item) => {
                const total = item.claimedBy.length;
                return (
                  <li key={item.id} className="border p-2 rounded flex justify-between">
                    <span>
                      {item.name} {item.claimedBy.map((u, i) => `${i + 1}/${total} ${u}`).join(", ")}
                    </span>
                    <button
                      onClick={() => returnItem(item, currentUser.username)}
                      className="text-red-600"
                    >
                      Return
                    </button>
                  </li>
                );
              })}
          </ul>
        </div>
      )}
    </div>
  );
}
