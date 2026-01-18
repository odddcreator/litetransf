import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyTexts = () => {
  const [texts, setTexts] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/uploads/my-uploads`)
      .then(res => setTexts(res.data.filter(u => u.type === 'text')));
  }, []);

  return (
    <div>
      {texts.map(text => (
        <div key={text._id}>
          <p>{text.content}</p>
          <p>{new Date(text.timestamp).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

export default MyTexts;