const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    prompt: {
        type: String,
        required: true
    },
});

let Prompt;

if (mongoose.models.Prompt) {
  Task = mongoose.model('Prompt');
} else {
  Task = mongoose.model('Prompt', taskSchema);
}

export default Prompt;