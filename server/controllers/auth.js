import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* REGISTER USER */
export const register = async (req, res) => {   //database'e bir istek yapacaksan bu asenkron olmalı
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      friends,
      location,
      occupation,                 //destructuring yapıyoruz
    } = req.body;                 //req.body ile isteğin body'sine ulaşırız yani kullanıcının gönderdiği bilgilere

    const salt = await bcrypt.genSalt();                       //salt oluşturuyoruz.
    const passwordHash = await bcrypt.hash(password, salt);   // password'u hashliyoruz.

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,   //passwordun hashlenmiş halini veri tabanında tut
      picturePath,
      friends,
      location,
      occupation,
      viewedProfile: Math.floor(Math.random() * 10000),
      impressions: Math.floor(Math.random() * 10000),
    });

    const savedUser = await newUser.save();  //yeni kullanıcı kaydını database'e ekler
    res.status(201).json(savedUser);    //kullanıcının başarıyla oluşturulduğuna dair yanıt gönderiyoruz.bu yanıtı frontend alabilir.
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* LOGGING IN */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ msg: "Kullanıcı bulunamadı. " });

    const isMatch = await bcrypt.compare(password, user.password); //kullanıcının girdiği şifreyle database'deki şifre aynı mı kontrol ediyoruz
    if (!isMatch) return res.status(400).json({ msg: "Geçersiz girişler. " }); //eğer aynı değilse yani isMatch false ise bu mesajı gönder

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET); //kullanıcının benzersiz kimliğini içeren bir JWT oluşturur ve bu JWT'yi imzalayarak güvence altına alır. Bu JWT daha sonra yetkilendirme amaçlarıyla kullanılabilir, örneğin kullanıcının oturum açmasını doğrulamak veya belirli yetkilere sahip olduğunu kanıtlamak için.
  
    delete user.password; //sonra passwordun frontende gönderilmediğinden emin olmak için sileriz. 

    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};