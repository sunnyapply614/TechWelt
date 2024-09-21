const path = require('path');
module.exports = () => {
  const uploadFile = (req, res) => {

  
    const filePath = req.file.path;
  
    res.send({ filePath });
  }
  return { uploadFile }
}

