var mongoose = require("mongoose"); //Define a schema
const bcrypt = require("bcrypt");
const mongoosePaginate = require("mongoose-paginate-v2");
var Schema = mongoose.Schema;
var config = require('../../configs/config')
let userSchema = new Schema({
    // name: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String },
    email: { type: String, unique: true, lowercase: true, required: true },
    password: { type: String, required: true },
    gender: { type: String, },//male, female, others    
    country_id: { type: mongoose.ObjectId, ref: 'Country' }, //type: String
    role: { type: String, enum: ["superAdmin","admin", "vendor", "buyer","teamMember", "familyMember"], default: "buyer" },
    status: { type: Number, default: 0 },// 0 = Inactive, 1= Active will activate after OTP varification
    image: { type: String },
    uid: { type: String },
    provider: { type: String },
    otp: { type: String },
    otp_expires: { type: Date },
    contact_code: {type: String},
    contact: {type: String},
    company: { type: String },
    category_id: { type: mongoose.ObjectId, ref: 'Category' },
    is_deleted: { type: Boolean, default: false },
    is_blocked: { type: Boolean, default: false },
    designation: { type: String },
    parent_user: { type: mongoose.ObjectId, ref: 'User' },
    products: {type: Number},
    amount: {type: Number},
    appointments: {type: Number},
    profit: {type: Number},
    is_busy: { type: Boolean, default: false },
    saved_stalls: [{ type: mongoose.ObjectId, ref: 'Stall'}],
}, {
    timestamps: true
});

// mongoosePaginate.paginate.options = {
//     limit: 10
// };
userSchema.plugin(mongoosePaginate);

userSchema.methods.toJSON = filterUserInformation;

userSchema.methods.filterUserData = filterUserInformation;

function filterUserInformation() {
    var obj = this.toObject();
    delete obj.password;
    // obj.photos_url = '/' + config.userPublicUrl
    return obj;
}
userSchema.virtual('image_url').get(function () {
    let imageName = this.image;
    if (this.image != undefined && this.image !== '') {
        return config.mediaHostUrl + '/' + config.userPublicUrl + imageName
    } else {
        return '';
    }
});
userSchema.virtual('photos_url').get(function () {    
    return '/'+ config.userPublicUrl;
});

// userSchema.virtual('ratings', {
//     ref: HangoutRatings,
//     localField: '_id',
//     foreignField: 'host_id'    
// })


// userSchema.pre('find',function(){
//     this.populate('ratings')
// })

userSchema.set('toObject', { virtuals: true });

userSchema.pre("save", function (next) {
    if (this.isNew) {
        var saltRounds = 10;
        var encPassword = bcrypt.hashSync(this.password, saltRounds);
        this.password = encPassword;
    }
    next();
});

userSchema.statics.encPassword = async (password) => {
    var saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds);
}

module.exports = mongoose.model("User", userSchema);
