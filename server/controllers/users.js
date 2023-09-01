import User from "../models/User.js";

/* READ ROUTES  */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;       // URL'den gelen 'id' parametresini alır
    const user = await User.findById(id);  // User modelini kullanarak veritabanından belirtilen 'id' ile kullanıcıyı arar
    res.status(200).json(user);    //Bulunan kullanıcıyı JSON formatında yanıt olarak döner 

  } catch (err) {
    res.status(404).json({ message: err.message });  //kullanıcı bulunamadıysa 404 koduyla hata 
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;       // URL'den gelen 'id' parametresini alır
    const user = await User.findById(id);  // User modelini kullanarak veritabanından belirtilen 'id' ile kullanıcıyı arar
 
    const friends = await Promise.all(        //birden fazla api çağrısı yapacağımız için (kaç tane arkadaşı olduğu belli değil) Promise.all
      user.friends.map((id) => User.findById(id))  // friends'i mapleriz.her arkadaşın bir id'si vardır ve bu id'ye göre o  arkadaşın bütün bilgilerini çekeriz
    );                                             //bilgileri alınan arkadaşları friends dizisine atarız.
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {   // friends dizisindeki her arkadaşın bazı özelliklerini alır ve bu özellikleri bir nesne olarak formatlar.
        return { _id, firstName, lastName, occupation, location, picturePath }; // Daha sonra bu düzenlenmiş arkadaşlar formattedFriends dizisine atanır.
      }
    );
    res.status(200).json(formattedFriends);    //arkadaşları JSON formatında response döner 

  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;  //url'deki kullanıcının id'sini ve arkadaşın id'sini alıyoruz
    const user = await User.findById(id);  //id'den kullanıcıyı buluyoruz
    const friend = await User.findById(friendId); //id'den arkadaşı buluyoruz

    if (user.friends.includes(friendId)) {     // Eğer arkadaş zaten kullanıcının arkadaş listesinde ise

      user.friends = user.friends.filter((id) => id !== friendId);    // Kullanıcının arkadaş listesinden bu arkadaşı çıkar
      friend.friends = friend.friends.filter((id) => id !== id);  // arkadaşın,arkadaş listesinden bu kullanıcıyı çıkarıyoruz.
    } 
      else {                         // Eğer arkadaş kullanıcının arkadaş listesinde değilse
      user.friends.push(friendId);     // Kullanıcının arkadaş listesine bu arkadaşı ekle
      friend.friends.push(id);      // arkadaşın,arkadaş listesine bu kullanıcıyı ekle
    }

    // Değişiklikleri veritabanına kaydet
    await user.save();
    await friend.save();

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );

    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};