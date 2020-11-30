const Movies = require("../models/movie");
const Code = require("../models/code");
const Rent = require("../models/rent");
const Order = require("../models/order");
const Member = require("../models/member");

var cloudinary = require("cloudinary").v2;
const DatauriParser = require("datauri/parser");
const parser = new DatauriParser();

const quick_replies = [
  {
    title: "Due Date ကြည့်ရန်",
    block_names: ["due_date"],
  },
  {
    title: "ခွေပြန်အပ်",
    block_names: ["finish"],
  },
];

exports.getLogin = (req, res) => {
  res.render("admin/login", {
    error: "",
  });
};

exports.login = (req, res) => {
  let error = "";

  if (req.body.username === "admin" && req.body.password === "present") {
    req.session.isLogined = true;
    return res.redirect("/admin/");
  } else if (!req.body.username) {
    console.log("in user", req.body);
    error = "Username is empty";

    return res.render("admin/login", {
      error,
    });
  } else if (!req.body.password) {
    error = "Password is empty";

    return res.render("admin/login", {
      error,
    });
  } else {
    error = "User Name or Password is wrong";

    return res.render("admin/login", {
      error,
    });
  }
};

exports.ensureLogin = (req, res, next) => {
  console.log("this happended", req.session, req.cookie);
  if (req.session.isLogined) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};

exports.logout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
};

exports.finished = async (req, res) => {
  try {
    const finished = await Rent.findByIdAndUpdate(req.body.id, {
      $set: { finished: true },
    });
    console.log(finished);
    if (finished) {
      const rented = await Rent.find();

      const oneRent = await Rent.findById(req.body.id);

      const oneFind = await Movies.findOne({ movieId: finished.movieId });

      let newQty = oneFind.available + finished.qty;

      const movieUpdate = await Movies.updateOne(
        { movieId: finished.movieId },
        { $set: { available: newQty } }
      );

      return res.render("admin/viewRent", {
        rents: rented,
        success: `ဇာတ်ကားနာမည် ${oneFind.name} , ငှားရမ်းသူနာမည် ${oneRent.name}  အတွက်အ​​ခွေပြန်အပ်မှူ ပြီးစီးပါပြီ`,
        error: "",
      });
    } else {
      const rented = await Rent.find();

      return res.render("admin/viewRent", {
        rents: rented,
        error: "Error Occur",
        success: "",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOfflineRent = async (req, res) => {
  try {
    res.render("admin/offlineRent", { success: "", error: "" });
  } catch (e) {}
};

exports.viewOrder = async (req, res) => {
  try {
    const orders = await Order.find();
    res.render("admin/viewOrder", { orders });
  } catch (e) {
    console.log(e);
  }
};

exports.viewMember = async (req, res) => {
  try {
    const members = await Member.find();
    res.render("admin/viewMember", { members });
  } catch (e) {
    console.log(e);
  }
};

exports.offlineRent = async (req, res) => {
  try {
    let { movieId, memberId, name, phNo, address, qty } = req.body;
    qty = parseInt(qty);

    console.log("rent", qty);
    console.log(`Customer name ${name}`);

    const movie = await Movies.findOne({ movieId });

    const rentedDate = new Date(); // today

    // 2   - millisecond
    // 4, 6

    const days = qty * 2;

    const dueDate = new Date(rentedDate.getTime() + days * 24 * 60 * 60 * 1000);

    const created = await Rent.create({
      movieId,
      memberId,
      movieName: movie.name,
      name,
      phNo,
      address,
      qty,
      totalPrice: movie.price * qty,
      dueDate,
      rentedDate,
    });

    if (created) {
      await Movies.updateOne(
        { movieId: movieId },
        { $set: { available: movie.available - qty } }
      );
      console.log("this work");
      return res.render("admin/offlineRent", {
        success: `${name}အတွက်ဆိုင်လာငှားစာရင်းထည့်ပြီးပါပြီ`,
        error: "",
      });
    } else {
      console.log("fial");
      return res.render("admin/offlineRent", {
        success: "",
        error: "Movie Rent Fail",
      });
    }
  } catch (e) {
    console.log(`error ${e}`);
    return res.render("admin/offlineRent", {
      success: "",
      error: "Movie Rent Fail",
    });
  }
};

exports.renderHome = async (req, res) => {
  try {
    const movies = await Movies.find();

    return res.render("admin/index", {
      movies,
      message: "",
    });
  } catch (e) {}
};

exports.renderMovie = async (req, res) => {
  try {
    // const products = await Products.find();

    return res.render("admin/add", { error: "", success: "" });
  } catch (e) {}
};

exports.delete_Movies = async (req, res) => {
  try {
    const products = await Movies.deleteOne({ movieId: req.body.movieId });
    const renderMovies = await Movies.find();
    if (products) {
      return res.render("admin/index", {
        movies: renderMovies,
        message: `${req.body.movieId} is Deleted `,
      });
    }
  } catch (e) {
    res.json({
      messages: [{ text: "Error Occurs in deleting movies" }],
    });
  }
};

exports.addMovie = async (req, res) => {
  try {
    let {
      id,
      name,
      type,
      price,
      available,
      trailer,
      description,
      file,
    } = req.body;
    price = parseInt(price);
    available = parseInt(available);

    const buffered = parser.format(".png", req.file.buffer);

    const uploadedPhoto = await cloudinary.uploader.upload(buffered.content);

    if (uploadedPhoto.secure_url) {
      const created = await Movies.create({
        movieId: id,
        name,
        type,
        price,
        available,
        trailer,
        description,
        poster: uploadedPhoto.secure_url,
      });

      if (created) {
        return res.render("admin/add", {
          error: "",
          success: `Movie ${id} is added`,
        });
      }
    }
  } catch (e) {
    console.log(e);
    return res.render("admin/add", {
      error: "Error occur in adding movie",
      success: "",
    });
  }
};

exports.renderEdit = async (req, res) => {
  try {
    // const products = await Products.find()

    const id = req.params.id;

    const movie = await Movies.findOne({ movieId: id });

    return res.render("admin/edit", {
      movie,

      success: "",
      error: "",
    });
  } catch (e) {}
};

exports.viewRent = async (req, res) => {
  try {
    const rented = await Rent.find({ memberId: { $ne: null } });

    return res.render("admin/viewRent", {
      rents: rented,
      success: "",
      error: "",
    });
  } catch (e) {
    console.log(e);
  }
};

exports.viewOfflineRent = async (req, res) => {
  try {
    const rented = await Rent.find({ memberId: null });

    return res.render("admin/viewOfflineRent", {
      rents: rented,
      success: "",
      error: "",
    });
  } catch (e) {
    console.log(e);
  }
};

// exports.addMovie = async (req, res) => {
//   try {
//     const movie = req.body;

//     const existed = await Movies.findOne({ movieId: movie.id });

//     if (existed) {
//       return res.json({
//         messages: [
//           {
//             text:
//               "Movie Already Existed, Please Try Again By using 'Get Started' ",
//           },
//         ],
//       });
//     }

//     const movies = await Movies.create({
//       movieId: movie.id,
//       available: parseInt(movie.available),
//       price: parseInt(movie.price),
//       ...movie,
//     });

//     if (!movies) {
//       return res.json({
//         messages: [{ text: "Not added yet. Try again" }],
//       });
//     }
//     return res.json({
//       messages: [
//         {
//           text: `Movie ID: ${move.id}\nName: ${movie.name}\nAdded Successful. What do you want to do next?`,
//           quick_replies,
//         },
//       ],
//     });
//   } catch (err) {
//     console.log(errr);
//     res.json({
//       messages: [{ text: "Error Occurs in adding Moviess" }],
//     });
//   }
// };

exports.getMovies = async (req, res) => {
  try {
    const Moviess = await Movies.find();

    const elements = Moviess.map((Movies) => {
      const newMovies = {
        title: `Name: ${Movies.name}`,
        image_url: Movies.photo,
        subtitle: `Price: ${Movies.price}`,
        buttons: [
          {
            type: "show_block",
            block_names: ["Edit"],
            title: "Edit",
            set_attributes: {
              id: Movies._id,
            },
          },
          {
            type: "show_block",
            block_names: ["Delete"],
            title: "Delete",
            set_attributes: {
              id: Movies._id,
            },
          },
        ],
      };
      return newMovies;
    });

    res.json({
      messages: [
        {
          attachment: {
            type: "template",
            payload: {
              template_type: "generic",
              image_aspect_ratio: "square",
              elements: elements,
            },
          },
        },
      ],
    });
  } catch (e) {
    res.json({
      messages: [{ text: "Error Occurs in find Moviess" }],
    });
  }
};

exports.addCode = async (req, res) => {
  try {
    const findCode = await Code.findOne({
      code: req.body.code,
    });

    if (findCode) {
      return res.json({
        messages: [{ text: "Code Already Add, try use another one" }],
      });
    }

    const codes = await Code.create({
      code: req.body.code,
    });
    if (!codes) {
      return res.json({
        messages: [{ text: "Not added yet. Try again" }],
      });
    }
    return res.json({
      messages: [
        {
          text: "Memberကုဒ်ထည့်ခြင်း ပြီးစီးပါပြီ",
        },
      ],
    });
  } catch (e) {
    res.json({
      messages: [{ text: "Error Occurs in Creating Code" }],
    });
  }
};

exports.deleteMovies = async (req, res) => {
  try {
    const movies = await Movies.deleteOne({ movieId: req.body.id });
    if (!movies) {
      return res.json({
        messages: [
          {
            text:
              "Cannot Delete your movies because of error or movies not found. What do you want to do next?",
            quick_replies,
          },
        ],
      });
    }
    return res.json({
      messages: [
        {
          text: "Delete Successful. What do you want to do next?",
          quick_replies,
        },
      ],
    });
  } catch (e) {
    res.json({
      messages: [{ text: "Error Occurs in deleting Moviess" }],
    });
  }
};

exports.editMovies = async (req, res) => {
  try {
    const edited = await Movies.findByIdAndUpdate(req.body.id, {
      $set: req.body,
    });

    if (edited) {
      const movie = await Movies.findOne({ movieId: req.body.movieId });

      return res.render("admin/edit", {
        movie,

        success: "Movie Edited",
        error: "",
      });
    } else {
      const movie = await Movies.findOne({ movieId: id });

      return res.render("admin/edit", {
        movie,

        success: "",
        error: "Movie Edited Failed",
      });
    }
  } catch (e) {
    console.log(e);
  }
};
