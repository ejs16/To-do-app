import mongoose from 'mongoose'

const connection = {}

async function dbConnect() {
  if (connection.isConnected) {
    return
  }

  const db = mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: false,
    useUnifiedTopology: true,
  })

  connection.isConnected = db.then((mongoose) => mongoose.connections[0].readyState);
  return db;
}

async function checkUserAndPassword(username, password) {
    try {
        const User = mongoose.model('User');
        const user = await User.findOne({ username });
        if (!user) {
            return false; // User not found
        }
        const isPasswordValid = await user.comparePassword(password);
        return isPasswordValid;
    } catch (error) {
        console.error('Error checking user and password:', error);
        return false;
    }
}

async function createClient(first, last, letterType){
    try {
        const Client = mongoose.model('Client');
        const client = new Client({ first, last, letterType});
        await client.save();
        return client;
    } catch (error) {
        console.error('Error creating client:', error);
        return null;
    }
}

export default dbConnect
