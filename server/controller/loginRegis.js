const profile = require('../model/profile')
const userPass = require('../model/userNamePass')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

exports.register = async (req, res) => {
    const validName = await userPass.findOne({userName: req.body.userName});
    if (validName) {
        return  res.status(400).send({ message: "Username already exist!" });
    }
    const profileInfo = new profile ({
        email: req.body.email,
        employeeID: req.body.employeeID
    });
    const hashedPass = await bcrypt.hash(req.body.password, 10)
    const userNamePass = new userPass ({
        userName: req.body.userName,
        password: hashedPass,
        employeeID: req.body.employeeID
    });
    try {
        const saveUserPass = await userNamePass.save();
        const saveProfile = await profileInfo.save();
        res.status(200).send({saveProfile, saveUserPass})
    } catch (err) {
        res.status(400).send({ message: "Error" })
    }
}

exports.login = async (req, res) => {
    const validName = await userPass.findOne({userName: req.body.userName});
    if (!validName) {
        return res.status(400).send({Error: "Kuy"})
    }
    const payload = { 
        userName: validName.userName
    };
    if (await bcrypt.compare(req.body.password, validName.password)) {
        const token = jwt.sign(payload, process.env.TOKEN_SECRET , {
            expiresIn: 86400 
        });
        return res.status(200).send(token)
    } else {
        res.status(400).send({Error: "Invalid password"})
    }
}