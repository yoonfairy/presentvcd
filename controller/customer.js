const Movies = require("../models/movie");
const Code = require("../models/code");
const Member = require("../models/member");
const Rent = require("../models/rent");
const Order = require("../models/order");

exports.renderHome = async (req, res) => {
  try {
    // const products = await Products.find()

    const id = req.params.id;

    const movies = await Movies.find();

    return res.render("customer/index", {
      id,
      movies,
      message: "",
    });
  } catch (e) {}
};

exports.filterType = async (req, res) => {
  try {
    const movies = await Movies.find({ type: { $in: [req.params.category] } });

    return res.render("customer/index", {
      id: req.params.id,
      movies,
      message: "",
    });
  } catch (e) {
    console.log(e);
  }

  // res.render("customer/index")
};

exports.view_order = async (req, res) => {
  try {
    const id = req.params.id;
    const orders = await Order.find({ memberId: id });
    res.render("customer/viewOrder", {
      id: req.params.id,
      orders: orders,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.RENT = async (req, res) => {
  try {
    console.log(req.body);
    let { name, phNo, address, qty, ID, movieId } = req.body;

    qty = parseInt(qty);

    const member = await Member.findOne({ messengerId: ID });
    const movie = await Movies.findOne({ movieId });
    const notMemberPrice = movie.price * qty;
    const memberPrice = notMemberPrice - notMemberPrice * 0.1;

    const isMember = member ? true : false;
    const totalPrice = isMember ? memberPrice : notMemberPrice;

    const rentedDate = new Date();

    const days = qty * 2;

    const dueDate = new Date(rentedDate.getTime() + days * 24 * 60 * 60 * 1000);

    const rented = await Rent.create({
      movieId,
      movieName: movie.name,
      name,
      phNo,
      address,
      qty,
      memberId: ID,
      totalPrice,
      rentedDate,
      dueDate,
    });

    if (rented) {
      await Movies.updateOne({ movieId }, { available: movie.available - qty });

      return res.render("customer/rent", {
        error: "",
        success: `ဇာတ်ကား ${
          movie.name
        } ငှားရမ်းပြီးပါပြီ, အပ်ရ မည့်ရက်  ${dueDate.toLocaleDateString()}, စုစုပေါင်း ငှားခ ${totalPrice}`,
        movie: "",
        id: ID,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.recentMovie = async (req, res) => {
  try {
    const movies = await Movies.find().limit(10).sort({ date: -1 });
    console.log(movies);
    const elements = movies.map((movie) => {
      const newMovies = {
        title: `ဇာတ်ကား အိုင်ဒီ: ${movie.movieId}`,
        image_url: movie.poster,
        subtitle: `နာမည်: ${movie.name}\nငှားခ : ${movie.price}\n အမျိုးအစား: ${movie.type}`,
      };
      return newMovies;
    });

    return res.json({
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
  } catch (e) {}
};

exports.renderRent = async (req, res) => {
  try {
    const movie = await Movies.findOne({ movieId: req.params.movieId });

    if (!movie) {
      return res.redirect("../");
    }

    return res.render("customer/rent", {
      error: "",
      success: "",
      movie: movie,
      id: req.params.id,
    });
  } catch (e) {}
};

exports.renderOrder = async (req, res) => {
  try {
    res.render("customer/order", {
      id: req.params.id,
      code: req.params.code,
      success: "",
      error: "",
    });
  } catch (e) {}
};

exports.orderMovie = async (req, res) => {
  try {
    const movie = await Movies.findOne({
      movieId: req.body.movieId,
    });

    const order = await Order.create({
      memberId: req.params.id,
      movieName: movie.name,
      moviePrice: parseInt(movie.price),
      ...req.body,
    });

    if (order) {
      res.render("customer/order", {
        id: req.params.id,
        code: req.params.code,
        success: "အော်ဒါ ပြီးစီးပါပြီ",
        error: "",
      });
    } else {
      res.render("customer/order", {
        id: req.params.id,
        code: req.params.code,
        success: "",
        error: "အော်ဒါ လုပ်လို့မရပါ",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.viewRent = async (req, res) => {
  try {
    const rented = await Rent.find({ memberId: req.params.id });

    return res.render("customer/viewRent", {
      rents: rented,
      id: req.params.id,
    });
  } catch (e) {}
};

exports.become_member = async (req, res) => {
  const code = req.body.code;
  const messengerId = req.body["messenger user id"];
  const phNo = req.body.phNo;
  const name = req.body.name;
  const address = req.body.address;
  try {
    const findMember = await Member.findOne({
      messengerId,
    });

    if (findMember) {
      return res.json({
        messages: [
          {
            text: "မိတ်ဆွေ member ဖြစ်ပီးသားပါ ",
          },
        ],
      });
    }

    const codes = await Code.findOne({ code });
    if (!codes) {
      return res.json({
        messages: [
          {
            text: "သင်ရဲ့ ကုဒ်ကိုရှာမတွေ့ပါ.",
          },
        ],
      });
    }

    if (codes.activated) {
      return res.json({
        messages: [
          {
            text: "ကုဒ်အသုံးပြုပြီးပါပြီ ",
          },
        ],
      });
    } else {
      const updated = await Code.updateOne(
        {
          code,
        },
        { $set: { activated: true } }
      );

      const created = await Member.create({
        messengerId,
        name,
        phNo,
        address,
      });

      if (created && updated) {
        return res.json({
          messages: [
            {
              text: "ဂုဏ်ယူပါတယ်. မိတ်ဆွေ member ဖြစ်ပြီးသွားပါပြီ ",
            },
          ],
        });
      }
    }
  } catch (e) {
    console.log(e);
    return res.json({
      messages: [
        {
          text: "Error Occur during Activation. ",
        },
      ],
    });
  }
};
