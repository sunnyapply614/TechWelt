require("dotenv").config();
const { companySchema } = require("../models");

module.exports = () => {
    const addCompany = async (req, res) => {
    const {
        name,
        username,
        email,
        mobile,
        country_name,
        address,
    } = req.body;
        
    if (!(name && username && email && mobile && country_name && address)) {
      res.status(400).json({ message: "All Input is required" });
      return;
    }

    try {      
    //   const admin = await companySchema.findOne({ email });        

  };
  return {
    addCompany,
  };
};
