import React, { useState } from 'react';
import axios from 'axios';

const Upload = () => {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);

  const handleTextUpload = async () => {
    await axios.post(`${process.env.REACT_APP_BACKEND_URL}/uploads/text`, { text });
    setText('');
  };

  const handleMediaUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);
    await axios.post(`${process.env.REACT_APP_BACKEND_URL}/uploads/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setFile(null);
  };

  return (
    <div>
      <h2>Upload Text</h2>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={handleTextUpload}>Upload Text</button>
      
      <h2>Upload Media</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleMediaUpload}>Upload Media</button>
    </div>
  );
};

export default Upload;