import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyMedia = () => {
  const [media, setMedia] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/uploads/my-uploads`)
      .then(res => setMedia(res.data.filter(u => u.type === 'media')));
  }, []);

  return (
    <div>
      {media.map(item => (
        <div key={item._id}>
          <a href={`${process.env.REACT_APP_BACKEND_URL}/uploads/download/${item._id}`}>Download</a>
          <p>{new Date(item.timestamp).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

export default MyMedia;