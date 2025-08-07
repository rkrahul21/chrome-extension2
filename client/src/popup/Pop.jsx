/* global chrome */
import React, { useState } from 'react';

export default function Pop() {
  const [likeCount, setLikeCount] = useState('');
  const [commentCount, setCommentCount] = useState('');

  const isButtonDisabled = !(likeCount && commentCount);

  const handleClick = () => {
    chrome.runtime.sendMessage({
      action: 'startEngagement',
      likeCount: parseInt(likeCount, 10),
      commentCount: parseInt(commentCount, 10),
    });
    window.close();
  };

  return (
    <div className=" p-4 w-96">
      <h1 className="text-lg font-bold mb-2">LinkedIn Auto Engagement</h1>

      <label className="block text-sm">Like Count</label>
      <input
        type="number"
        min="0"
        value={likeCount}
        onChange={(e) => setLikeCount(e.target.value)}
        className="w-full border rounded p-1 mb-2"
      />

      <label className="block text-sm">Comment Count</label>
      <input
        type="number"
        min="0"
        value={commentCount}
        onChange={(e) => setCommentCount(e.target.value)}
        className="w-full border rounded p-1 mb-4"
      />

      <button
        onClick={handleClick}
        disabled={isButtonDisabled}
        className={`w-full py-2 px-4 rounded text-white ${
          isButtonDisabled ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        Start Auto Like & Comment
      </button>
    </div>
  );
}