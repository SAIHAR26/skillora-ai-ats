
const mongoose = require("mongoose");

mongoose.connect(
"mongodb+srv://skilloraadmin:Skillora2026@cluster0.36hjtsn.mongodb.net/skillora?retryWrites=true&w=majority"
)
.then(() => {
    console.log("CONNECTED");
})
.catch(err => {
    console.log(err);
});