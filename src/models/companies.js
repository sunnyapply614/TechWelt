

const schema = new mongoose.Schema({
    name: {type: String, require: true},
    username: {type: String, require: true, unique: true},
    email: {type: String, require: true},
    mobile: {type: String, defalut: ""},
    country_name: {type: String, defalut: ""},
    address: {type: String, defalut: ""},
}, { timestamps: true })

module.exports = mongoose.model("Companies", schema)
