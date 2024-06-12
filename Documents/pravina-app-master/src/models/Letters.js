const mongoose = require('mongoose');

const letterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    template: {
        type: String,
        required: true
    },
    status:
    {
        type: String,
        required: true
    },
});

let Letter;

if (mongoose.models.Letter) {
  Task = mongoose.model('Letter');
} else {
  Task = mongoose.model('Letter', letterScheme);
}

export default Letter;