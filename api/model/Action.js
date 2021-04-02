var mongoose = require("mongoose"); //Define a schema
var Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");
let aclActionsSchema = new Schema({
    method: { type: String },
    route: { type: String },
    controller: { type: String },
    action: { type: String }, 
    description: { type: String },
    hasAccess: {type: Boolean, default: false}
}, {
    timestamps: true
});
mongoosePaginate.paginate.options = {
    limit: 10
};
aclActionsSchema.plugin(mongoosePaginate);
aclActionsSchema.set('toObject', { virtuals: true });
aclActionsSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("AclActions", aclActionsSchema);