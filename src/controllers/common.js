const path = require('path');
module.exports = () => {
  const uploadFile = (req, res) => {
    if (!req.file) {
      return res.status(400).send('No file.');
    }
  
    const filePath = req.file.path;
  
    res.send({ filePath });
  }

  return { uploadFile }
}
