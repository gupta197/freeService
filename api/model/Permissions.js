var mongoose = require("mongoose"); //Define a schema
var Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");
let aclPermissionsSchema = new Schema({
    role: { type: String },
    controller: { type: String },
    permissions: { type: Array }
}, {
    timestamps: true
});
mongoosePaginate.paginate.options = {
    limit: 10
};
aclPermissionsSchema.plugin(mongoosePaginate);
aclPermissionsSchema.set('toObject', { virtuals: true });
aclPermissionsSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("AclPermissions", aclPermissionsSchema);