const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const User = require("../model/UserModel");
const salt = bcrypt.genSaltSync(10);

const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const usernameFormat = /^[A-Za-z][A-Za-z0-9_]{1,29}$/;
const passwordFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const registerUser = async (req, res) => {
  const { name, phone, email, username, password } = req.body;
  
  //validations
  if (name.length < 2 || name.length > 50) {
    res.status(400).json({error: "Name must be between 2 and 50 characters"})
    return
  }
  if (phone < 1000000000) {
    res.status(400).json({error: "Enter valid phone number"})
    return
  }
  if (!mailFormat.test(email)) {
    res.status(400).json({error: "Enter valid email address"})
    return;
  }
  if (!usernameFormat.test(username)) {
    res.status(400).json({error: 'Invalid username! first character should be alphabet [A-Za-z] and other characters can be alphabets, numbers or an underscore so, [A-Za-z0-9_].'})
  }
  if (!passwordFormat.test(password)) {
    res.status(400).json({error: 'password should have minimum of eight characters, at least one uppercase letter, one lowercase letter, one number and one special character:'})
    return
  }

  //save into database
  try {
    const userByUserName = await User.findOne({username: username})
    if (userByUserName) {
      res.status(400).json({error: 'Username alredy exists'})
      return
    }
    const userByEmail = await User.findOne({email: email})
    if (userByEmail) {
      res.status(400).json({error: 'Email already exists'})
      return
    }

    const userDoc = await User.create({
      name,
      phone,
      email,
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.status(201).json(userDoc);
  } catch (err) {
    res.status(400).end("bad request");
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  if (!usernameFormat.test(username)) {
    res.status(400).json({error: 'Invalid username! first character should be alphabet [A-Za-z] and other characters can be alphabets, numbers or an underscore so, [A-Za-z0-9_].'})
  }
  if (!passwordFormat.test(password)) {
    res.status(400).json({error: 'password should have minimum of eight characters, at least one uppercase letter, one lowercase letter, one number and one special character:'})
    return
  }

  try {
      const userDoc = await User.findOne({username})
      if (!userDoc) {
        res.status(400).end({error: 'Invalid Username'})
        return
      }

      const isPasswordCorrect = bcrypt.compareSync(password, userDoc.password)
      if (!password) {
        res.status(400).end({error: 'Incorrect Password'})
        return
      }

      const token = jwt.sign({id: userDoc._id}, process.env.JWT_SECRET, {expiresIn: '1h'})
      console.log('token', token)
      res.cookie('token', token, {httpOnly: true}).status(200).json({success: 'User Logged In'})
  } catch (err) {
    res.end(err)
  }

};

module.exports = { registerUser, loginUser };
