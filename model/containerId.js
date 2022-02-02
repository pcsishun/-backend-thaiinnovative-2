const mongoose = require('mongoose');

const containerSchema = new mongoose.Schema({
    container_id: {type: String, unique:true}
});


module.exports = mongoose.model('containerId', containerSchema)