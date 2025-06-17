import React, { useState, useEffect } from 'react';

export default function App() {
  const [wishList, setWishList] = useState([]);
  const [buyersList, setBuyersList] = useState({
    Nina: [],
    Mama: [],
  });
  const [newItem, setNewItem] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    const savedWishes = JSON.parse(localStorage.getItem('wishList')) || [];
    const savedBuyers = JSON.parse(localStorage.getItem('buyersList')) || { Nina: [], Mama: [] };
    setWishList(savedWishes);
    setBuyersList(savedBuyers);
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem('wishList', JSON.stringify(wishList));
    localStorage.setItem('buyersList', JSON.stringify(buyersList));
  }, [wishList, buyersList]);

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
      [buyer]: [...buyersList[buyer], item],
    });
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-6">
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
            Add
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
                  <button 
                    onClick={() => claimWish(item, 'Nina')}
                    className="bg-green-500 text-white rounded p-1 text-sm"
                  >
                    Nina takes
                  </button>
                  <button 
                    onClick={() => claimWish(item, 'Mama')}
                    className="bg-purple-500 text-white rounded p-1 text-sm"
                  >
                    Mama takes
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['Nina', 'Mama'].map(buyer => (
            <div key={buyer} className="bg-gray-50 p-3 rounded border">
              <h2 className="font-semibold mb-2">{buyer}'s To Buy List</h2>
              {buyersList[buyer].length === 0 ? (
                <p className="text-gray-500 text-sm">No items yet</p>
              ) : (
                <ul>
                  {buyersList[buyer].map((item, idx) => (
                    <li key={idx} className="text-sm">{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
