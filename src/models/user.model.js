const mongoose = require("mongoose");
const { generateOtp } = require("../utils/generateOtp.util");
const { sendEmail } = require("../services/mail.service");

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["seller", "buyer"],
      default: "buyer",
    },
    // wishlist: [
    //   {
    //     productId: { type: Schema.Types.ObjectId, ref: "Product" },
    //     addedAt: { type: Date, default: Date.now },
    //   },
    // ],
    orderHistory: [
      {
        orderId: { type: Schema.Types.ObjectId, ref: "Order" },
        purchaseDate: { type: Date, default: Date.now },
      },
    ],
    // resetPasswordToken: {
    //   type: String,
    // },
    // resetPasswordExpires: {
    //   type: Date,
    // },
    otp: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", function (next) {
  if (!this.otp) {
    this.otp = generateOtp();
    const payload = {
      from: "hamailkhan213@gmail.com",
      to: this.email,
      subject: "Safro",
      html: ` <table style="width: 100%; text-align: center; padding: 20px; font-family: Arial, sans-serif;">
        <tr>
          <td>
            <img src="https://lh3.googleusercontent.com/pw/AP1GczORkJuqr-XSjQkHvvEiHFtIM74Hw9gJrLIQgt9_BaB47yedUXHfMkhNpMHa9zZsSLyOiVI_eLYBRz-sKdcclZViuBABc21hsX59lFBrB-8VmhJwBabjFczc4FDinE8ERW2GqKMA4OWBvHBEvlcTGZ8-=w473-h473-s-no-gm?authuser=0" alt="Company Logo" style="width: 100px; height: auto; margin-bottom: 20px;" />
          </td>
        </tr>
        <tr>
          <td>
            <h1 style="color: #333;">Hi, ${this.username}!</h1>
            <p style="color: #555; font-size: 16px;">
              Your One-Time Password (OTP) is: <strong style="font-size: 20px; color: #000;">${this.otp}</strong>
            </p>
            <p style="color: #555; font-size: 16px;">
              Please use this OTP to complete your verification.
            </p>
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://shamoil-khan.vercel.app/" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 20px;">Explore More</a>
          </td>
        </tr>
        <tr>
          <td>
            <p style="color: #555; font-size: 14px; margin-top: 30px;">Best regards,</p>
            <p style="color: #333; font-size: 16px; font-weight: bold;">Safro</p>
          </td>
        </tr>
      </table>`,
    };
    sendEmail({
      ...payload,
    })
      .then((res) => console.log(`Success sending email to ${this.email}`))
      .catch((err) => console.log(`Error sending email to ${this.email}`));
  }
  next();
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
