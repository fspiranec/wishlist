import React, { useState, useEffect } from 'react';

export default function App() {
  const [wishList, setWishList] = useState([]);
  const [buyersList, setBuyersList] = useState({});
  const [users, setUsers] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [newUser, setNewUser] = useState('');

  useEffect(() => {
    const savedWishes = JSON.parse(localStorage.getItem('wishList')) || [];
    const savedBuyers = JSON.parse(localStorage.getItem('buyersList')) || {};
    const savedUsers = JSON.parse(localStorage.getItem('users')) || [];
    setWishList(savedWishes);
    setBuyersList(savedBuyers);
    setUsers(savedUsers);
  }, []);

  useEffect(() => {
    localStorage.setItem('wishList', JSON.stringify(wishList));
    localStorage.setItem('buyersList', JSON.stringify(buyersList));
    localStorage.setItem('users', JSON.stringify(users));
  }, [wishList, buyersList, users]);

  const addWish = () => {
    if (newItem.trim() !== '') {
      setWishList([...wishList, newItem.trim()]);
      setNewItem('');
    }
  };

  const claimWish = (item, buyer) => {
    setWishList(wishList.filter(wish => wish !== item));
    setBuyersList({
      ...buyersList,
      [buyer]: [...(buyersList[buyer] || []), item],
    });
  };

  const returnWish = (item, buyer) => {
    setBuyersList({
      ...buyersList,
      [buyer]: buyersList[buyer].filter(i => i !== item),
    });
    setWishList([...wishList, item]);
  };

  const addUser = () => {
    const name = newUser.trim();
    if (name && !users.includes(name)) {
      setUsers([...users, name]);
      setBuyersList({ ...buyersList, [name]: [] });
      setNewUser('');
    }
  };

  const renameUser = (oldName) => {
    const newName = prompt(`Rename ${oldName} to:`, oldName);
    if (newName && newName.trim() !== '' && !users.includes(newName.trim())) {
      const updatedUsers = users.map(u => u === oldName ? newName.trim() : u);
      const updatedBuyersList = { ...buyersList };
      updatedBuyersList[newName.trim()] = updatedBuyersList[oldName];
      delete updatedBuyersList[oldName];
      setUsers(updatedUsers);
      setBuyersList(updatedBuyersList);
    }
  };

  const deleteUser = (name) => {
    if (window.confirm(`Delete ${name}? All their items will be lost.`)) {
      const updatedUsers = users.filter(u => u !== name);
      const updatedBuyersList = { ...buyersList };
      delete updatedBuyersList[name];
      setUsers(updatedUsers);
      setBuyersList(updatedBuyersList);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-3xl mx-auto bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Franjo's Wish List</h1>
        
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            className="flex-1 border rounded p-2"
            placeholder="Add item..."
          />
          <button 
            onClick={addWish}
            className="bg-blue-500 text-white rounded p-2"
          >
            Add Item
          </button>
        </div>

        <ul className="mb-6">
          {wishList.length === 0 ? (
            <li className="text-gray-500">No wishes yet</li>
          ) : (
            wishList.map((item, index) => (
              <li key={index} className="flex justify-between items-center border-b py-1">
                <span>{item}</span>
                <div className="flex gap-2">
                  {users.map((user, idx) => (
                    <button 
                      key={idx}
                      onClick={() => claimWish(item, user)}
                      className="bg-green-500 text-white rounded p-1 text-sm"
                    >
                      {user} takes
                    </button>
                  ))}
                </div>
              </li>
            ))
          )}
        </ul>

        <div className="mb-4 flex gap-2">
          <input 
            type="text"
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
            className="flex-1 border rounded p-2"
            placeholder="Add user..."
          />
          <button 
            onClick={addUser}
            className="bg-purple-500 text-white rounded p-2"
          >
            Add User
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((user) => (
            <div key={user} className="bg-gray-50 p-3 rounded border">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">{user}'s To Buy List</h2>
                <div className="flex gap-1">
                  <button
                    onClick={() => renameUser(user)}
                    className="bg-yellow-500 text-white rounded p-1 text-xs"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => deleteUser(user)}
                    className="bg-red-500 text-white rounded p-1 text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {buyersList[user] && buyersList[user].length > 0 ? (
                <ul>
                  {buyersList[user].map((item, idx) => (
                    <li key={idx} className="flex justify-between items-center py-1">
                      <span className="text-sm">{item}</span>
                      <button
                        onClick={() => returnWish(item, user)}
                        className="bg-red-400 text-white rounded p-1 text-xs"
                      >
                        Return
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No items yet</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
