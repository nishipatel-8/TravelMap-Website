const router = require("express").Router();
const Pin = require("../models/Pin");

//create a pin

router.post("/", async (req, res) => {
    const newPin = new Pin(req.body);
    try {
        console.log(newPin);
        const savedPin = await newPin.save();
        res.status(200).json(savedPin);
    } catch (err) {
        res.status(500).json(err);
    }
})


// delete a pin 

router.post("/deletepin", async (req, res) => {
    try {
        //find user
        const newPin = await Pin.findOne({ lat: req.body.lat , long: req.body.long });
        !newPin && res.status(400).json("Wrong Pin");

        await Pin.deleteOne(newPin);

        const pins = await Pin.find();
        res.status(200).json(pins);
        
        
    } catch (err) {
        res.status(500).json(err);
    }
});


//get all pins

router.get("/", async(req,res) => {
    try{
        const pins = await Pin.find();
        res.status(200).json(pins);
    } catch(err){
        res.status(500).json(err);
    }
});

module.exports = router