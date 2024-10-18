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
     const admin = 1;
      if (!admin) {
        res.status(400).json({ message: "Already same user exists!" });
      } else {
        await addCompany.save();
      }
      console.log("save success");
    } catch (err) {
      res.status(401).json({ message: "Something went wrong.", err: err });
    }
  };
  return {
    addCompany,
  };
};
